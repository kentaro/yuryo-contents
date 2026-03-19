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

## GitHub Actions で `main` 自動デプロイ

GitHub 上の push で自動で本番デプロイする構成を追加する場合は、次を設定します。

1. Vercel 用のアクセストークンとプロジェクト情報を取得

```bash
vercel login
vercel projects ls
vercel projects inspect yuryo-contents
```

`vercel projects inspect yuryo-contents` の出力から `orgId` と `ProjectId` を控えます。

2. GitHub Secrets を登録

- `VERCEL_TOKEN`: Personal Access Token
- `VERCEL_ORG_ID`: 上記 `orgId`
- `VERCEL_PROJECT_ID`: 上記 `ProjectId`

3. `.github/workflows/vercel-prod-deploy.yml` を作成

```bash
mkdir -p .github/workflows
cat > .github/workflows/vercel-prod-deploy.yml <<'EOF'
name: deploy-prod

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel (prod)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          working-directory: .
EOF
```

`main` に push したら自動的に本番デプロイされます。必要なら手動で `vercel --prod` も使えます。

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

## ランディングページ

ルート `/` にはトップページ（日本語LP）を追加し、
- `support`的な導線説明
- API の実行デモボタン
- `main` への push 自動デプロイ説明

を表示します。

本番公開時 URL:

- https://yuryo-contents-g2tsoi27g-kentaro-kuribayashis-projects.vercel.app
- https://yuryo-contents.vercel.app（alias）

