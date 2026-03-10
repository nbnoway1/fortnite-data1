# ⚡ Fortnite Island Dashboard

Fortnite APIのデータをリアルタイム可視化するダッシュボード。  
Vercel + React (Vite) + サーバーレスAPIプロキシ構成。

## デプロイ手順

### 1. GitHubにプッシュ
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/nbnoway1/<repo-name>.git
git push -u origin main
```

### 2. Vercelでインポート
1. https://vercel.com/new を開く
2. GitHubリポジトリを選択
3. 設定はそのまま（自動検出）→ Deploy

## ローカル起動
```bash
npm install
npm run dev
# → http://localhost:5173
```

## ファイル構成
```
├── api/
│   └── proxy.js       # Vercelサーバーレス関数（CORSプロキシ）
├── src/
│   ├── main.jsx
│   └── App.jsx        # ダッシュボード本体
├── index.html
├── vite.config.js
├── vercel.json        # ルーティング設定
└── package.json
```
