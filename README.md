# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# League of Legends チーム編成システム

League of Legends（LoL）のチーム編成を自動化するReactアプリケーションです。

## 主な機能

### 1. レーン別チーム編成
- 各レーン（Top, Jungle, Mid, ADC, Support）ごとに1人ずつ自動選出
- プレイヤーのレーン適性を考慮した配置

### 2. ランクフィルタリング
- 各レーンごとに最小・最大ランクを指定可能
- サポートランク：Iron, Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster, Challenger

### 3. 時間ベースフィルタリング
- 指定した時間以内に追加されたプレイヤーのみを選定対象にする機能
- プレイヤーの最終アクティビティ時間による絞り込み

## 使用技術

- **React 18** - UIフレームワーク
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **CSS3** - スタイリング（League of Legendsテーマ）

## セットアップ

### 前提条件
- Node.js (18.0.0以上)
- npm または yarn

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# プロダクションビルド
npm run build

# ビルドファイルをプレビュー
npm run preview
```

## 使用方法

### 1. プレイヤー追加
1. 「プレイヤー追加」タブを選択
2. プレイヤー名、ランク、対応可能レーンを入力
3. 「プレイヤーを追加」ボタンをクリック

### 2. プレイヤー管理
1. 「プレイヤーリスト」タブでプレイヤー一覧を確認
2. アクティビティ更新やプレイヤー削除が可能

### 3. チーム編成
1. 「チーム編成」タブを選択
2. 各レーンのフィルター条件を設定：
   - 最小・最大ランク
   - 最大非アクティブ時間
3. 「プレイヤー追加からの最大経過時間」を設定（オプション）
4. 「チーム編成を実行」ボタンをクリック

## フィルター機能詳細

### レーン別フィルター
- **最小ランク**: そのレーンに配置するプレイヤーの最低ランク
- **最大ランク**: そのレーンに配置するプレイヤーの最高ランク
- **最大非アクティブ時間**: 最後のアクティビティからの経過時間（分）

### グローバルフィルター
- **プレイヤー追加からの最大経過時間**: プレイヤーが追加されてからの経過時間（分）

## 技術的な特徴

### 型安全性
- TypeScriptによる完全な型定義
- League of Legends固有の型（Lane, Rank, Player等）を定義

### 状態管理
- React Contextによるグローバル状態管理
- プレイヤーデータの永続化（ローカルストレージ対応可能）

### アルゴリズム
- ランクベースのプレイヤー選出アルゴリズム
- 複数条件による効率的なフィルタリング

### UI/UX
- League of Legendsテーマの美しいデザイン
- レスポンシブデザイン対応
- 直感的な操作性

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── PlayerForm.tsx   # プレイヤー追加フォーム
│   ├── PlayerList.tsx   # プレイヤーリスト表示
│   ├── TeamBuilder.tsx  # チーム編成機能
│   └── LoLTeamBuilder.css # スタイルシート
├── contexts/            # Reactコンテキスト
│   └── PlayerContext.tsx # プレイヤー状態管理
├── types/               # TypeScript型定義
│   └── lol.ts          # LoL固有の型
├── utils/               # ユーティリティ関数
│   └── lolUtils.ts     # LoL関連のヘルパー関数
├── App.tsx             # メインアプリケーション
├── main.tsx            # エントリーポイント
└── index.css           # グローバルスタイル
```

## 開発者向け情報

### VSCode設定
- `.github/copilot-instructions.md` でCopilot用のプロジェクト固有の指示を定義
- TypeScript厳密モード有効

### 拡張可能性
- 新しいランクの追加が容易
- APIとの連携によるリアルタイムデータ取得
- プレイヤー統計の追加
- チーム履歴の保存機能

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

League of Legendsは Riot Games, Inc. の商標です。

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
