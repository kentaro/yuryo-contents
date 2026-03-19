import http from 'node:http';
import { randomUUID, createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Mppx, tempo } from 'mppx/server';

const defaultCelebrationLines = [
  'お支払いありがとうございます！これがAIエージェントの未来だ！',
  'ペイメント完了。未来のエージェントは、あなたの一歩で加速する。',
  '料金を確認しました。君はもう“支払いできる未来”の住人です。',
  'レシートを受け取った。さあ、次の会話で世界を自動化しよう。',
];

type Config = {
  realm: string;
  secretKey: string;
  recipient: string;
  currency: string;
  amount: string;
  maxRequestBytes: number;
  requestTimeoutMs: number;
  payPath: string;
  lines: string[];
  quote: string;
};

type PaymentMode = {
  status: 402 | 200;
};

const config = loadConfig();
const payment = buildPaymentHandler(config);

export async function handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const start = performance.now();
  const requestId = randomUUID();

  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const path = normalizePath(url.pathname);
    const method = req.method?.toUpperCase() ?? 'GET';

    if (path === '/healthz') {
      if (method !== 'GET') {
        writeJson(res, 405, { code: 'method-not-allowed', requestId });
        return;
      }
      writeJson(res, 200, {
        status: 'ok',
        service: 'tempo-mpp-celebration',
        path,
        requestId,
      });
      return;
    }

    if (method !== 'GET' && method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      writeJson(res, 405, { code: 'method-not-allowed', requestId });
      return;
    }

    if (path !== config.payPath) {
      writeJson(res, 200, {
        code: 'public-endpoint',
        message: `こんにちは。支払いが必要なエンドポイントは ${config.payPath} です。`,
        requestId,
      });
      return;
    }

    const contentLength = req.headers['content-length'];
    if (contentLength !== undefined) {
      const size = Number.parseInt(contentLength, 10);
      if (!Number.isFinite(size) || size < 0) {
        writeJson(res, 400, { code: 'invalid-content-length', requestId });
        return;
      }
      if (size > config.maxRequestBytes) {
        writeJson(res, 413, { code: 'payload-too-large', requestId });
        return;
      }
    }

    const result = await withTimeout(
      payment(req, res),
      config.requestTimeoutMs,
      `Timeout after ${config.requestTimeoutMs}ms`
    );

    if (result.status === 402) {
      return;
    }

    const payload = {
      requestId,
      message: config.quote,
      line: pickLine(config.lines),
      path,
      gateway: 'tempo-mpp-celebration',
      paid: true,
      timestamp: new Date().toISOString(),
    };
    writeJson(
      res,
      200,
      payload,
      typeof res.getHeader('Payment-Receipt') === 'string' ? res.getHeader('Payment-Receipt') : undefined
    );
    return;
  } catch (error) {
    writeJson(
      res,
      500,
      {
        code: 'internal-error',
        message: error instanceof Error ? error.message : 'unexpected error',
        requestId,
      }
    );
  } finally {
    const ms = Math.round(performance.now() - start);
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${ms}ms`);
  }
}

function buildPaymentHandler(config: Config) {
  const mppx = Mppx.create({
    realm: config.realm,
    secretKey: config.secretKey,
    methods: [
      tempo({
        recipient: config.recipient,
        currency: config.currency,
      }),
    ],
  });
  const routeHandler = mppx['tempo/charge']({
    amount: config.amount,
    recipient: config.recipient,
    currency: config.currency,
    description: 'future-token-gate',
  });
  const nodeListener = Mppx.toNodeListener((input) => routeHandler(input));
  return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<PaymentMode> => {
    return nodeListener(req, res) as Promise<PaymentMode>;
  };
}

function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function pickLine(lines: string[]): string {
  const index = Math.floor(Math.random() * lines.length);
  return lines[index] ?? defaultCelebrationLines[0];
}

function writeJson(
  res: http.ServerResponse,
  status: number,
  payload: Record<string, unknown>,
  paymentReceipt?: string
) {
  const body = JSON.stringify(payload);
  const digest = createHash('sha256').update(body).digest('hex');

  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Payload-Digest', digest);
  if (paymentReceipt) {
    res.setHeader('X-Payment-Receipt', paymentReceipt);
  }
  res.end(body);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

function loadConfig(): Config {
  const recipient = requireEnv('TEMPO_RECIPIENT');
  const secretKey = requireEnv('MPP_SECRET_KEY');
  const currency = requireEnv('TEMPO_CURRENCY', '0x20C0000000000000000000000000000000000000');
  const amount = process.env.PAYMENT_AMOUNT ?? '10000';
  const payPath = normalizePath(process.env.PAY_PATH ?? '/api/celebrate');

  const rawLines = process.env.CELEBRATION_LINES;
  const lines = parseLineJson(rawLines);
  const quote = process.env.CELEBRATION_QUOTE ?? defaultCelebrationLines[0];

  return {
    realm: process.env.MPP_REALM ?? 'tempo-mpp-celebration',
    secretKey,
    recipient,
    currency,
    amount,
    maxRequestBytes: clampInt(process.env.MAX_REQUEST_BYTES, 8192),
    requestTimeoutMs: clampInt(process.env.REQUEST_TIMEOUT_MS, 10000),
    payPath,
    lines,
    quote,
  };
}

function parseLineJson(raw: string | undefined): string[] {
  if (!raw) {
    return defaultCelebrationLines;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultCelebrationLines;
    const sanitized = parsed.filter((line) => typeof line === 'string' && line.trim().length > 0);
    return sanitized.length > 0 ? sanitized : defaultCelebrationLines;
  } catch {
    return defaultCelebrationLines;
  }
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.trim()) {
    return value.trim();
  }
  if (typeof fallback === 'string') {
    return fallback;
  }
  throw new Error(`Missing required env: ${name}`);
}

function clampInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric env value: ${value}`);
  }
  return parsed;
}
