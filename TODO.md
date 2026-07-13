# TODO

## 完了した作業 (2026-07-13)
- `https://github.com/bqyujiyamada-code/beat-explorer.git` を `projects/beat-explorer` にclone
- `npm install` でパッケージ導入(385 packages)
- ソースコードから参照している環境変数を洗い出し、`.env.local` に空欄で用意
  - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`(src/lib/auth.ts, src/app/api/recommend/route.ts)
  - `SPOTIFY_PLAYLIST_ID`(src/app/api/playlist/add/route.ts)
  - `NEXTAUTH_SECRET`(src/lib/auth.ts)
  - `GOOGLE_GENERATIVE_AI_API_KEY`(src/app/api/recommend/route.ts)
- `.env.local` の各値を実際に入力(Spotify Developer Dashboard / Google AI Studio から取得)
- `.env.local` に `NEXTAUTH_URL=http://localhost:3000` を追加し、next-authの警告を解消
- `npm run dev` でローカル起動し、動作確認を実施
  - ホームページ・Spotify OAuthリダイレクト(`/api/auth/signin/spotify` → `accounts.spotify.com/authorize`)は正常
  - Gemini(`GOOGLE_GENERATIVE_AI_API_KEY`)によるレコメンドAPIが実際に楽曲を返すことを確認
  - Spotify Search APIが `403 Active premium subscription required` を返すことを確認(アプリ所有者アカウントの制限。対応不要と判断)
- コードレビュー・リファクタリングを実施し、`main` にpush(commit `a3d2677`)
  - `next.config.js`: `allowedDevOrigins` の重複指定(旧`experimental`配下 + 不要な旧IP `18.178.204.116`)を削除
  - 型安全性: `src/types/next-auth.d.ts` を新規作成し next-auth の `Session`/`JWT` に `accessToken` を型付け、`any` を全廃(`auth.ts`, `playlist/add/route.ts`, `page.tsx`, `recommend/route.ts`)
  - `page.tsx`: Spotify検索が失敗し `track_uri` が `null` の曲は「ADD TO PLAYLIST」ボタンをdisabled化(以前は押すとAPIエラーになるバグがあった)
  - `page.tsx`: `/api/recommend` へのfetchに `Content-Type: application/json` ヘッダーを追加(`playlist/add`との一貫性)
  - `npx tsc --noEmit` / `npm run lint` ともにエラー0件を確認

## この後やりたいこと
- [ ] Spotify Developer Dashboardで、Redirect URIに `http://localhost:3000/api/auth/callback/spotify` が登録されているか確認・追加する
      - 実ブラウザ(ログイン済み)から `/api/auth/signin/spotify` を実行すると `accounts.spotify.com/authorize` が `400 Bad Request` を返し、認可画面が表示されない事象あり
      - 未ログイン状態(curl)では同URLが303でログイン画面に遷移するため、ログイン後の認可検証段階で弾かれている可能性が高い
- [ ] 【要対応・セキュリティ】動作確認中にブラウザの開発者ツールの内容をチャットに貼った際、Spotifyの実セッションCookie(`sp_dc`, `sp_key`, `__Host-device_id` など)が含まれていた。Spotifyアカウント設定から「全デバイスからログアウト」を実行してセッションを無効化することを推奨
- [ ] `npm audit` の結果を確認する(1 low, 6 moderate, 2 high の脆弱性あり)
- [ ] `sharp` / `unrs-resolver` のインストールスクリプトが保留中("allow-scripts pending")になっているため、`npm approve-scripts --allow-scripts-pending` で内容を確認し、必要なら許可する
- [ ] (任意) `page.tsx` の `<img>` を `next/image` に置き換える(要 `next.config.js` へのSpotify CDNドメイン登録、ESLint警告として残存中)
