# yuryo-contents

Tempo (`mppx`) で課金して、
支払い成功時に「お支払いありがとうございます！これがAIエージェントの未来だ！」という
メッセージ系JSONを返す超シンプルなVercel向けサーバです。

## 仕組み

- エンドポイント: `/api/celebrate`
- 支払い前: 402 + `WWW-Authenticate: Payment`
- 支払い後: JSON を返す（ランダム1行つき）

## ローカル起動

```bash
cd /Users/antipop/src/github.com/kentaro/yuryo-contents
cp .env.example .env
npm install
npm run build
npm start
```

## Vercel 本番デプロイ（CLI）

1. 依存をインストールしてビルドできることを確認

```bash
cd /Users/antipop/src/github.com/kentaro/yuryo-contents
npm install
npm run build
```

2. Vercel CLI にログイン（初回のみ）

```bash
npm i -g vercel
vercel login
```

3. GitHub の `main` をデプロイ先と接続してリンク

```bash
vercel
```

4. 環境変数を登録

```bash
vercel env add TEMPO_RECIPIENT
vercel env add MPP_SECRET_KEY
vercel env add TEMPO_CURRENCY    # 任意
vercel env add PAYMENT_AMOUNT   # 任意
vercel env add PAY_PATH         # 任意（初期値 /api/celebrate）
```

5. 本番デプロイ（GitHub 連携後の推奨運用）

```bash
vercel --prod
```

6. 既存の `main` に push すれば本番へ自動反映（GitHub 連携有効時）

```bash
git add .
git commit -m "..."
git push origin main
```

デプロイ先URLで動作確認:

```bash
curl -i https://<あなたのVercelドメイン>/api/celebrate
```

レスポンスが `402` なら課金フローへ進むための設定待ち、`200` で `message` が返れば OK です。

必要環境変数:
- `TEMPO_RECIPIENT`（受け取り先）
- `MPP_SECRET_KEY`（Tempo APIキー）
- `TEMPO_CURRENCY`（任意）
- `PAYMENT_AMOUNT`（任意）
- `PAY_PATH`（任意、初期値 `/api/celebrate`）

### 期待レスポンス例

```json
{
  "requestId": "...",
  "message": "お支払いありがとうございます！これがAIエージェントの未来だ！",
  "line": "未来へようこそ。あなたのトークンが物語を動かした。",
  "path": "/api/celebrate",
  "gateway": "yuryo-contents",
  "paid": true,
  "timestamp": "2026-03-19T00:00:00.000Z"
}
```
