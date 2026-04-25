"use client";

import { useState } from "react";

export default function MusicExplorer() {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // AIに推薦を依頼する関数
  const handleSearch = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // 503エラー（混雑）などのメッセージを親切に変換
        if (res.status === 503) throw new Error("AIが混み合っています。数秒後にもう一度お試しください。");
        throw new Error(data.error || "検索に失敗しました");
      }
      
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // プレイリストに追加する関数
  const handleAddToPlaylist = async (trackUri: string) => {
    if (!trackUri) return;
    
    try {
      const res = await fetch("/api/playlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUri }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("プレイリストに追加しました！");
      } else {
        alert("追加失敗: " + (data.error || "不明なエラー"));
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Beat Explorer</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="今の気分は？ (例: 集中できるジャズ)"
          className="border p-2 flex-1 text-black"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? "AIが考え中..." : "検索"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid gap-4">
        {recommendations.map((track: any, index: number) => (
          <div key={index} className="border p-4 rounded flex items-center gap-4">
            {track.album_image && (
              <img src={track.album_image} alt={track.track} className="w-20 h-20" />
            )}
            <div className="flex-1">
              <h2 className="font-bold">{track.track} / {track.artist}</h2>
              <p className="text-sm text-gray-400">{track.reason}</p>
              
              <button
                onClick={() => handleAddToPlaylist(track.track_uri)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                + ADD TO PLAYLIST
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
