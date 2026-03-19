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

## Vercel デプロイ

1. リポジトリ接続
2. 以下環境変数を設定
   - `TEMPO_RECIPIENT`
   - `MPP_SECRET_KEY`
   - `TEMPO_CURRENCY`（任意）
   - `PAYMENT_AMOUNT`（任意）
   - `PAY_PATH`（任意、初期値 `/api/celebrate`）
3. `vercel` でデプロイ

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
