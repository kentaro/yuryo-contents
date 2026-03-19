# SKILL.md

## AIエージェント向け（最優先）

このページは、`/api/celebrate` を Tempo/Mppx クライアントで呼ぶための実行仕様です。

- `/` は案内ページのみ（無料）
- 価値取得は `GET /api/celebrate` のみ

## 実行手順（クライアント）

1. `tempo request https://yuryo-contents.vercel.app/api/celebrate`
2. ステータスで分岐する
   - `402`（Payment Required）: `WWW-Authenticate: Payment` を確認し、クレデンシャル再送する
   - `200`: `message` と `line` を含む JSON（祝賀）を受領する
   - `503`: `code: service-misconfigured`（運用者側設定エラー）
   - `405`: `GET`/`POST` 以外は未対応

## 失敗時の最小診断

- `Key not provisioned on-chain`
  - 初回プロビジョニング前の状態。
  - 支払いアカウントへネイティブ資金（ガス代）と支払いトークンを追加して再実行
- `insufficient funds for gas * price + value`
  - ネイティブ通貨不足。まず `tempo wallet` を確認し入金

## 受け取り可能なレスポンス

- `POST /api/celebrate` も 402/200 の取り扱いは `GET` と同等
- 決済完了時に `X-Payment-Receipt` が付与されることがあります

## サーバ運用側（参考）

- `MPP_SECRET_KEY`
- `TEMPO_RECIPIENT`
- `TEMPO_CURRENCY`（任意）
- `PAYMENT_AMOUNT`（任意）
- `PAY_PATH`（任意）
- `MAX_REQUEST_BYTES`（任意）
- `REQUEST_TIMEOUT_MS`（任意）
