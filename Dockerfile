# DigitalOcean用のDockerfile
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build:do

# 本番環境用の軽量サーバーを使用
FROM nginx:alpine

# Nginxの設定をコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ビルドされたアプリをコピー
COPY --from=0 /app/dist /usr/share/nginx/html

# ポート80を公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
