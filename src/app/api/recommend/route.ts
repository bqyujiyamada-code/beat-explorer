import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Spotifyのアクセストークンを取得（検索用）
async function getSpotifyToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Vercelの環境変数名に合わせて修正
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const systemPrompt = `音楽キュレーターとして、実在する楽曲を必ず2つ推薦してください。
    出力は必ず以下の形式のJSONのみにしてください。余計な解説や\`\`\`jsonタグは不要です。
    {"recommendations": [{"artist": "歌手名", "track": "曲名", "reason": "推薦理由"}]}`;

    const geminiResult = await model.generateContent([
      { text: systemPrompt },
      { text: `ユーザーの好み: ${prompt}` }
    ]);

    const responseText = geminiResult.response.text();
    
    // JSON部分を安全に抽出
    let geminiData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
      geminiData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Gemini JSON Parse Error. Raw Text:", responseText);
      throw new Error("Geminiの回答を解析できませんでした");
    }

    const spotifyToken = await getSpotifyToken();

    // Spotifyの情報を付与
    const enriched = await Promise.all(
      geminiData.recommendations.slice(0, 2).map(async (rec: any, i: number) => {
        try {
          const query = encodeURIComponent(`${rec.track} ${rec.artist}`);
          const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
            { 
              headers: { Authorization: `Bearer ${spotifyToken}` },
              signal: AbortSignal.timeout(5000) // タイムアウトを少し余裕持たせました
            }
          );

          const searchData = await searchRes.json();
          const track = searchData.tracks?.items?.[0];

          return {
            ...rec,
            category: i === 0 ? "Similar" : "Discovery",
            album_image: track?.album?.images?.[0]?.url || null,
            external_url: track?.external_urls?.spotify || null,
            preview_url: track?.preview_url || null,
            track_uri: track?.uri || null, // プレイリスト追加用にURIも保持
          };
        } catch (err) {
          console.error("Spotify Search Error:", err);
          return {
            ...rec,
            category: i === 0 ? "Similar" : "Discovery",
            album_image: null,
            external_url: null,
            preview_url: null,
            track_uri: null,
          };
        }
      })
    );

    return NextResponse.json({ recommendations: enriched });
  } catch (error: any) {
    console.error("DEBUG - Server Error Details:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
