"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function MusicExplorer() {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        if (res.status === 503) throw new Error("AIが混み合っています。数秒後にお試しください。");
        throw new Error(data.error || "検索に失敗しました");
      }
      
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (trackUri: string) => {
    if (!trackUri) return;
    try {
      const res = await fetch("/api/playlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUri }),
      });
      if (res.ok) {
        alert("プレイリストに追加しました！");
      } else {
        const data = await res.json();
        alert("追加失敗: " + (data.error || "403エラー: 再ログインを試してください"));
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Beat Explorer</h1>
      </header>
      
      <div className={styles.searchSection}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="今の気分は？"
          className={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? "AI解析中..." : "検索"}
        </button>
      </div>

      {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>}

      <div className={styles.grid}>
        {recommendations.map((track: any, index: number) => (
          <div key={index} className={styles.card}>
            {track.album_image && (
              <img src={track.album_image} alt={track.track} style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }} />
            )}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>{track.track}</h2>
              <p style={{ color: '#b3b3b3', marginBottom: '10px' }}>{track.artist}</p>
              <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '15px' }}>{track.reason}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 視聴ボタンの復活 */}
                {track.preview_url && (
                  <audio controls src={track.preview_url} style={{ width: '100%', height: '30px' }}>
                    お使いのブラウザは再生に対応していません
                  </audio>
                )}

                <button
                  onClick={() => handleAddToPlaylist(track.track_uri)}
                  className={styles.button}
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                >
                  + ADD TO PLAYLIST
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
