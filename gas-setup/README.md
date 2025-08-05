# Google Apps Script 連携セットアップガイド

## 概要
この機能により、Google SheetsのNeetDivisionフォームデータを直接アプリケーションに読み込むことができます。

## セットアップ手順

### 1. Google Apps Script プロジェクトの作成
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」を作成
3. プロジェクト名を「LoL Team Builder API」などに変更

### 2. スクリプトのコピー
1. `gas-script/Code.gs` ファイルの内容をコピー
2. Google Apps Scriptエディタに貼り付け
3. `SPREADSHEET_ID` を実際のGoogle SheetsのIDに変更
   ```javascript
   const SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID';
   ```

### 3. スプレッドシートIDの取得方法
Google SheetsのURLから取得：
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit#gid=0
```
上記の [SPREADSHEET_ID] 部分が必要なIDです。

### 4. Web Appとしてデプロイ
1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 種類：「ウェブアプリ」を選択
4. 設定：
   - **実行ユーザー**: 自分
   - **アクセスできるユーザー**: 全員
5. 「デプロイ」をクリック
6. 表示される **Web app URL** をコピー

### 5. 環境変数の設定
1. プロジェクトルートの `.env` ファイルを編集
2. `VITE_GAS_URL` にデプロイURLを設定：
   ```
   VITE_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### 6. アプリケーションの再起動
```bash
npm run dev
```

## データマッピング

### Google Sheetsの列とアプリケーションフィールドの対応
| Google Sheets列 | アプリケーションフィールド | 説明 |
|---|---|---|
| A: タイムスタンプ | timestamp | フォーム送信時刻 |
| B: Discordユーザー名 | discordUsername | Discord表示名 |
| C: サモナー名 | summonerName | LoLサモナー名 |
| D: サモナーID | summonerId | LoLサモナーID |
| E: Tier | tier | ランクティア |
| F: Division | division | ランクディビジョン |
| G: 宣言レーン | declaredLane | プレイしたいレーン |
| H: OPGG | opggUrl | OP.GG プロフィールURL |
| I: 自由記入 | freeComment | 自由コメント |
| K: サモナーレベル | summonerLevel | LoLサモナーレベル |
| L: ソロランク | soloRank | ソロランク情報 |
| M: フレックス | flexRank | フレックスランク情報 |

## トラブルシューティング

### よくある問題と解決方法

#### 1. 「Google Sheets連携が設定されていません」
- `.env` ファイルの `VITE_GAS_URL` が正しく設定されているか確認
- アプリケーションを再起動 (`npm run dev`)

#### 2. 「Failed to fetch players」
- GASのデプロイ設定を確認（アクセス権限: 全員）
- スプレッドシートIDが正しいか確認
- スプレッドシートが共有されているか確認

#### 3. 「HTTP error! status: 403」
- GASの実行権限を確認
- スプレッドシートの閲覧権限を確認

#### 4. データが表示されない
- スプレッドシートにデータがあるか確認
- シート名が「フォームの回答 1」と一致しているか確認
- ブラウザの開発者ツールでエラーを確認

## API仕様

### エンドポイント
- `GET ?action=getPlayers` - プレイヤーデータ取得
- `GET ?action=health` - ヘルスチェック

### レスポンス形式
```json
{
  "players": [
    {
      "id": "player_2",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "discordUsername": "Player#1234",
      "summonerName": "PlayerName",
      "summonerId": "JP1",
      "tier": "GOLD",
      "division": "III",
      "declaredLane": "TOP",
      "opggUrl": "https://op.gg/summoners/kr/PlayerName-JP1",
      "freeComment": "コメント",
      "summonerLevel": 150,
      "soloRank": "GOLD III",
      "flexRank": "SILVER I",
      "isSubAccountSuspect": false
    }
  ],
  "totalCount": 1,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

## セキュリティ考慮事項
- GASは「全員」にアクセス許可しているため、URLを知る人は誰でもデータにアクセス可能
- 機密情報は含めないよう注意
- 必要に応じてIP制限やアクセス制御を追加検討

## 更新とメンテナンス
- スプレッドシートの構造変更時はGASスクリプトも更新が必要
- 定期的にGASの実行ログを確認してエラーがないかチェック
- データ量が多い場合はキャッシュ機能の追加を検討
