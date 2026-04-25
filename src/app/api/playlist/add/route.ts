import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route"; // パスは環境に合わせて調整してください

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Spotifyへのログインが必要です" }, { status: 401 });
  }

  try {
    const { trackUri } = await req.json();
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

    if (!playlistId) {
      return NextResponse.json({ error: "環境変数 SPOTIFY_PLAYLIST_ID が未設定です" }, { status: 500 });
    }

    // Spotify APIへリクエスト
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify API Error:", data);
      return NextResponse.json({ error: data.error?.message || "追加に失敗しました" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
