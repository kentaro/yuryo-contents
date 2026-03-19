# SKILL.md

## AIエージェント向け（最優先）

このサイトは `Tempo` に対応した API で、トップページは説明ページです。
まずは `https://mpp.dev/quickstart/agent` の流れに従って実行してください。

- `GET /` は案内のみ（価値コンテンツを返しません）
- 価値取得先は `GET /api/celebrate` のみ

## 実行手順（1回目）

```bash
tempo request https://yuryo-contents.vercel.app/api/celebrate
```

- `402 Payment Required` が返る
- `WWW-Authenticate: Payment` を受け取り、Tempo クライアントが決済フローを実行

## 実行手順（2回目）

同じ `tempo request` が再送され、決済完了後に 200 が返る。

## 正常レスポンス

- ステータス: `200`
- JSON:
  - `message`: お祝いメッセージ
  - `line`: 補足文言
  - `requestId`, `path`, `gateway`, `paid`, `timestamp`

## 期待エラー

- `503 code=service-misconfigured`
  - サーバ側設定不備。クライアントではなく運用者側の問題
- `405`
  - 許可外メソッド（`GET`/`POST` のみ）
- `Key not provisioned on-chain` やガス不足
  - 対象ウォレットの初期化/残高を確認
