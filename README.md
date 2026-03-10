# ⚡ My Islands — Realtime Dashboard

4つの自分の島のデータをリアルタイムで可視化するダッシュボード。

## 監視対象の島
- 3808-8348-4233
- 5240-9604-1946
- 0126-6244-2163
- 3890-4970-8669

## 機能
- ⚡ **リアルタイム**: 60秒ごと自動更新・セッション数の推移
- 📅 **7日間DAU**: 積み上げ棒グラフ
- 🎮 **セッション推移**: 7日間の折れ線グラフ
- ⏱️ **プレイ時間**: 平均プレイ時間の推移
- 🕸️ **総合比較**: レーダーチャートで4島を一括比較
- 📊 **スナップショットテーブル**: 最新数値の一覧

## デプロイ手順

```bash
# 1. GitHubにリポジトリ作成してpush
git init && git add . && git commit -m "init"
git remote add origin https://github.com/nbnoway1/my-islands-dashboard.git
git push -u origin main

# 2. Vercel: https://vercel.com/new でインポート → Deploy
```
