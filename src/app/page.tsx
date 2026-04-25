"use client";

import { useState } from "react";
import styles from "./page.module.css";

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
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Beat Explorer</h1>
      </header>
      
      <div className={styles.searchSection}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="今の気分は？ (例: 集中できるジャズ)"
          className={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? "AIが考え中..." : "検索"}
        </button>
      </div>

      {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>}

      <div className={styles.grid}>
        {recommendations.map((track: any, index: number) => (
          <div key={index} className={styles.card}>
            {track.album_image && (
              <img 
                src={track.album_image} 
                alt={track.track} 
                style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }} 
              />
            )}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {track.track}
              </h2>
              <p style={{ color: '#b3b3b3', marginBottom: '10px' }}>{track.artist}</p>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '15px' }}>
                {track.reason}
              </p>
              
              <button
                onClick={() => handleAddToPlaylist(track.track_uri)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#1db954',
                  color: 'black',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
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
