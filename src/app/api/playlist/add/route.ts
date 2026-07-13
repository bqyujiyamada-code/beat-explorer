import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trackUri } = await req.json();
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

    // 2026年最新仕様: tracks ではなく items を使用
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // VercelのLogsに詳細を出力して403の正体を暴く
      console.error("--- Spotify API Error Debug ---");
      console.error("Status:", response.status);
      console.error("Body:", JSON.stringify(data));
      console.error("Auth Header Check:", response.headers.get("www-authenticate"));
      
      return NextResponse.json(
        { error: data.error?.message || "Spotify API Error" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
