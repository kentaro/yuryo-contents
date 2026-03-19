# SKILL.md

## AIエージェント向け（最優先）

このページを先に読む。ここは UI を押して進むものではなく、**Tempo/Mppx クライアント（`tempo request` 系）経由で `/api/celebrate` を呼び出す API サイト**です。

- `/` は説明ページ（無料）。課金は発生しません。
- 価値を取得するのは `/api/celebrate` のみ。
- 実行手順:
  1. `GET /SKILL.md` を読む
  2. Tempo/Mppx クライアントで `GET /api/celebrate` を呼ぶ（最初は 402 が返り、クライアントが支払いして再送する）
  3. ステータスで分岐
     - `402`: 未決済。`WWW-Authenticate: Payment` を伴う決済要求
     - `200`: 決済済み。`message` と `line` を含む祝賀 JSON を返却
  4. 必要なら `X-Payment-Receipt` を受け取る

## API仕様（最短）

- `GET /` : 案内ページ
- `GET /api/celebrate` : 決済要求またはコンテンツ返却
- `POST /api/celebrate` : 決済フローを許容（実体は `GET` と同等）
- `GET /healthz` : ヘルスチェック

## 最優先チェック

- `503` + `code: "service-misconfigured"` は環境変数不足や設定不備
- `400`/`405`/`413`/`500` はリクエスト/実行エラー

## 必須環境変数

- `MPP_SECRET_KEY`
- `TEMPO_RECIPIENT`（形式: `0x...`）

## 任意環境変数

- `TEMPO_CURRENCY`
- `PAYMENT_AMOUNT`
- `PAY_PATH`（既定: `/api/celebrate`）
- `MAX_REQUEST_BYTES`
- `REQUEST_TIMEOUT_MS`

`mpp.dev/quickstart/agent` で示される「先に仕様を読む → Tempo/Mppx クライアントで対象 API を呼ぶ」流れに合わせる。

---

## 人間向けの説明

このサイトは、トップは説明・導線だけ、価値は API レスポンスとして配信する構成です。

- 一般公開ページは無料で閲覧可能
- 決済の実体は `/api/celebrate` のみに限定
- 受領は `200` 時の JSON、必要なら `X-Payment-Receipt` を確認
- 画面上での疑似ボタンや自動開放は行わない
