import SpotifyProvider from "next-auth/providers/spotify";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid playlist-modify-public playlist-modify-private user-read-email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // 初回ログイン時に情報をトークンに保存
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }
      
      // 有効期限内ならそのまま返す
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 期限切れなら自動更新を試みる（※今回は簡略化のため再ログイン推奨とします）
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
