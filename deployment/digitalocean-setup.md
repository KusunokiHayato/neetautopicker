# DigitalOcean App Platform デプロイメントガイド

## 概要

このプロジェクトはDigitalOcean App Platformでデプロイするように設定されています。

## デプロイ手順

### 1. DigitalOceanアカウント準備
1. [DigitalOcean](https://www.digitalocean.com/)でアカウントを作成
2. App Platformにアクセス

### 2. アプリケーション作成
1. **Create App** をクリック
2. **GitHub** を選択してリポジトリを接続
3. リポジトリ: `Slum-Dev/neetautopicker`
4. ブランチ: `main`
5. **Next** をクリック

### 3. アプリ設定
#### 自動検出の場合：
- DigitalOceanが自動的に設定を検出します

#### 手動設定の場合：
```yaml
Build Command: npm run build:do
Run Command: npm start
```

### 4. 環境変数設定

**✨ 自動設定済み！**

環境変数はすべて`.do/app.yaml`で事前設定済みです。DigitalOceanのコンソールでの手動設定は**不要**です。

- `VITE_GAS_URL`: デフォルト値設定済み（Google Apps Script設定後に変更可能）
- `VITE_APP_NAME`: "NEET Auto Picker"
- `VITE_NODE_ENV`: "production"
- `VITE_DEBUG_MODE`: "false"
- その他すべての設定値

### 5. リソース設定
- **Instance Size**: Basic ($5/month) 推奨
- **Instance Count**: 1

### 6. デプロイ実行
1. **Create Resources** をクリック
2. デプロイが完了するまで待機
3. 提供されるURLでアプリケーションにアクセス

## 設定ファイル

### `.do/app.yaml`
DigitalOcean App Platform用の設定ファイルが含まれています。

### `Dockerfile` (オプション)
カスタムDockerデプロイメント用のファイルです。

## 費用

- **Basic Plan**: $5/month
- **Pro Plan**: $12/month (より多くのリソース)

## 自動デプロイ

GitHubのmainブランチにプッシュすると自動的に再デプロイされます。

## トラブルシューティング

### ビルドエラー
- Node.jsのバージョンが18以上であることを確認
- 依存関係が正しくインストールされていることを確認

### Google Sheets連携
- アプリ起動後、「Google Sheets連携」タブからGoogle Apps Scriptを設定
- 環境変数の手動設定は不要（自動的にデフォルト値が適用）

## サポート

問題が発生した場合は、DigitalOceanのドキュメントを参照するか、サポートに連絡してください。
