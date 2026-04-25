import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth"; // 切り出した設定ファイルをインポート

export async function POST(req: Request) {
  // 1. ユーザーのセッション（アクセストークンを含む）を取得
  const session: any = await getServerSession(authOptions);
  
  // 2. ログインチェック
  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: "Spotifyへのログインが必要です。一度ログアウトして再ログイン試してください。" }, 
      { status: 401 }
    );
  }

  try {
    // 3. フロントエンドから送られてきた曲のURIを取得
    const { trackUri } = await req.json();
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

    // 4. 環境変数のチェック
    if (!playlistId) {
      console.error("Error: SPOTIFY_PLAYLIST_ID is not defined in Vercel Environment Variables");
      return NextResponse.json(
        { error: "サーバー側の設定（プレイリストID）が不足しています。" }, 
        { status: 500 }
      );
    }

    if (!trackUri) {
      return NextResponse.json(
        { error: "追加する曲の情報が正しく送信されませんでした。" }, 
        { status: 400 }
      );
    }

    // 5. Spotify APIへ「プレイリストへの楽曲追加」をリクエスト
    // 公式ドキュメント: https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri], // 配列形式で送る必要があります
        }),
      }
    );

    const data = await response.json();

    // 6. Spotifyからのレスポンス判定
    if (!response.ok) {
      console.error("Spotify API Error Response:", data);
      return NextResponse.json(
        { error: data.error?.message || "Spotifyへの追加に失敗しました。" }, 
        { status: response.status }
      );
    }

    // 7. 成功レスポンス
    return NextResponse.json({ success: true, snapshot_id: data.snapshot_id });

  } catch (error: any) {
    console.error("Internal Server Error in playlist/add:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました。" }, 
      { status: 500 }
    );
  }
}
