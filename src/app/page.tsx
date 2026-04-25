"use client";

import { useState } from "react";
// CSS Modulesをインポート
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
        if (res.status === 503) throw new Error("AIが混み合っています。数秒後にもう一度。");
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
        alert("追加失敗: " + (data.error || "不明なエラー"));
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Beat Explorer</h1>
        
        <div className={styles.searchGroup}>
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
            {isLoading ? "AIが考え中..." : "検索"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.list}>
          {recommendations.map((track: any, index: number) => (
            <div key={index} className={styles.card}>
              {track.album_image && (
                <img src={track.album_image} alt={track.track} className={styles.albumImage} />
              )}
              <div className={styles.trackInfo}>
                <h2 className={styles.trackName}>{track.track}</h2>
                <p className={styles.artistName}>{track.artist}</p>
                <p className={styles.reason}>{track.reason}</p>
                
                <button
                  onClick={() => handleAddToPlaylist(track.track_uri)}
                  className={styles.addButton}
                >
                  + ADD TO PLAYLIST
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
