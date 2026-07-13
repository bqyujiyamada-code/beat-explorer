# TODO

## 完了した作業 (2026-07-13)
- `https://github.com/bqyujiyamada-code/beat-explorer.git` を `projects/beat-explorer` にclone
- `npm install` でパッケージ導入(385 packages)
- ソースコードから参照している環境変数を洗い出し、`.env.local` に空欄で用意
  - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`(src/lib/auth.ts, src/app/api/recommend/route.ts)
  - `SPOTIFY_PLAYLIST_ID`(src/app/api/playlist/add/route.ts)
  - `NEXTAUTH_SECRET`(src/lib/auth.ts)
  - `GOOGLE_GENERATIVE_AI_API_KEY`(src/app/api/recommend/route.ts)

## この後やりたいこと
- [ ] `.env.local` の各値を実際に入力する(Spotify Developer Dashboard / Google AI Studio などから取得)
- [ ] `npm audit` の結果を確認する(1 low, 6 moderate, 2 high の脆弱性あり)
- [ ] `sharp` / `unrs-resolver` のインストールスクリプトが保留中("allow-scripts pending")になっているため、`npm approve-scripts --allow-scripts-pending` で内容を確認し、必要なら許可する
- [ ] `npm run dev` でローカル起動し、Spotify連携・レコメンド機能の動作確認
