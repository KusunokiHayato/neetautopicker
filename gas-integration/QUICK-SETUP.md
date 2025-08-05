# 🚀 既存GASプロジェクト統合ガイド

## 📋 準備するもの
- [ ] 既存のGASプロジェクトのURL
- [ ] スプレッドシートのID
- [ ] シート名
- [ ] スプレッドシートの列構成確認

## ⚡ クイック統合手順

### 1️⃣ GASプロジェクトを開く
既存のGASプロジェクト（https://script.google.com/）にアクセス

### 2️⃣ コードを追加
`gas-integration/integration-code.gs` の内容を既存プロジェクトにコピー&ペースト

### 3️⃣ 設定を変更
```javascript
// この2行を実際の値に変更
const YOUR_SPREADSHEET_ID = 'あなたのスプレッドシートID';
const YOUR_SHEET_NAME = 'あなたのシート名';
```

### 4️⃣ デプロイする
1. 「デプロイ」→「新しいデプロイ」
2. 種類：「ウェブアプリ」
3. 実行者：「自分」、アクセス：「全員」
4. 「デプロイ」クリック
5. **Web App URL をコピー**

### 5️⃣ アプリに設定
`.env` ファイルを編集：
```
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 6️⃣ アプリを再起動
```bash
npm run dev
```

## 🔍 スプレッドシートID の取得方法

Google SheetsのURL：
```
https://docs.google.com/spreadsheets/d/[ここがスプレッドシートID]/edit#gid=0
```

## 📊 データ列の対応表

| 列 | 項目名例 | 必須 | 説明 |
|---|---|---|---|
| A | タイムスタンプ | ✅ | フォーム送信時刻 |
| B | Discordユーザー名 | ✅ | Discord名 |
| C | サモナー名 | ✅ | LoL名前 |
| D | サモナーID | ✅ | LoL ID |
| E | Tier | | ランクティア |
| F | Division | | ランクディビジョン |
| G | 宣言レーン | ✅ | プレイレーン |
| H | OPGG | | プロフィールURL |
| I | 自由記入 | | コメント |
| J | （未使用） | | |
| K | サモナーレベル | | レベル |
| L | ソロランク | | ソロRank |
| M | フレックス | | FlexRank |

## ⚠️ よくある問題と解決法

### 「設定されていません」エラー
→ `.env` ファイルの `VITE_GAS_URL` を確認

### 「Failed to fetch」エラー
→ GASのデプロイ設定で「アクセス：全員」になっているか確認

### データが取得できない
→ GASで `Logger.log()` を使ってデバッグ情報を確認

### 「Sheet not found」エラー
→ シート名が正確に一致しているか確認

## 🧪 テスト方法

### 1. ヘルスチェック
ブラウザで直接アクセス：
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=health
```

### 2. データ取得テスト
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getPlayers
```

### 3. アプリでテスト
1. アプリを開く
2. 「Google Sheetsからデータ取得」ボタンをクリック
3. プレイヤー数が表示されることを確認

## 📞 サポート

### デバッグ情報の確認方法
1. GASエディタで「実行」→「getTeamBuildingPlayers」
2. 「表示」→「ログ」でエラー詳細を確認

### 手動テスト
GASエディタで以下を実行：
```javascript
function testIntegration() {
  try {
    const result = getTeamBuildingPlayers();
    Logger.log(result.getContent());
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}
```
