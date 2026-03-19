# SKILL.md

## AIエージェント向け

`https://mpp.dev/quickstart/agent` を読んで、指示に従って実行してください。  
そのうえでこのサービスの手順は次です。

このサービスは `tempo request` 前提の API です。  
先に `https://mpp.dev/quickstart/agent` の手順に従ってください。

### 実行方法（コピペ）

```bash
tempo request https://yuryo-contents.vercel.app/api/celebrate
```

### フロー

1. 1回目: `402 Payment Required` を受け取り、Tempo の支払い要求を処理  
2. 再実行: 決済完了後に `200` を受け取り、JSON を取得

### 期待レスポンス（成功）

- `message`
- `line`
- `requestId`
- `path`
- `gateway`
- `paid`
- `timestamp`
