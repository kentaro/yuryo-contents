# SKILL.md

## AIエージェント向け（最優先）

このページは、`/api/celebrate` を **Tempo/Mppx クライアント**で呼ぶ API サービスのための手順です。

- まず本文の内容をそのまま実行する。
- `/` は案内ページ（無料）。
- 価値取得は `GET /api/celebrate` のみ。

## 1) 実行手順（クライアント側）

1. `Tempo request` で呼び出す
   - `tempo request https://yuryo-contents.vercel.app/api/celebrate`
2. 取得したステータスで分岐
   - `402`（Payment Required）: `WWW-Authenticate: Payment` を受け取り、クレデンシャルで再送
   - `200`: `message` と `line` を含む祝賀 JSON を受け取る
   - `503`: 設定ミス（サーバ側）
   - それ以外: 再試行/エラー対応

## 2) 必要なクライアント状態

Tempo/Mppx を使うクライアントで、次を満たすこと。

- `tempo` コマンドが実行できること
- 送金に使うアドレス（`tempo wallet`）が存在すること
- 初回支払い時のキー/チャネル未登録で失敗した場合は、上記アドレスに
  - ネットワークのネイティブ資金（ガス代）
  - 支払いトークン（例: USDC）
  を入金して再試行

## 3) 失敗時の最小診断（短縮）

- `Key not provisioned on-chain`
  - 初回プロビジョニング前の状態。
  - クライアント側アカウントの資金を補充して再実行
- `insufficient funds for gas * price + value`
  - ネイティブ通貨不足。まず `tempo wallet` のアドレスへ入金

## API仕様

- `GET /` : 案内ページ
- `GET /api/celebrate` : 決済要求または祝賀JSON
- `POST /api/celebrate` : 402/200 の流れを許容（GET と同等）
- `GET /healthz` : ヘルスチェック

## サーバ運用側（公開対象外）

- `yuryo-contents` 側の環境変数（※運用者が設定）
  - `MPP_SECRET_KEY`
  - `TEMPO_RECIPIENT`
  - `TEMPO_CURRENCY`（任意）
  - `PAYMENT_AMOUNT`（任意）
  - `PAY_PATH`（任意、既定 `/api/celebrate`）

---

## 人間向けの説明

この LP は「入口」と「課金対象 API」を分けたデモです。

- ボタン操作は不要
- 価値は `tempo request` 経由の 402→200 の流れで取得
- 未決済をページ上で偽装しない
