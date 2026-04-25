"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { signIn, signOut, useSession } from "next-auth/react";

export default function MusicExplorer() {
  const { data: session, status } = useSession();
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
      if (!res.ok) throw new Error(data.error || "検索失敗");
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (trackUri: string) => {
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
        // 403の場合のヒントを厚くする
        const msg = res.status === 403 
          ? `権限エラー(403): ${data.error}\n\n【対策】\n1. 一度ログアウトして再ログイン\n2. プレイリストIDが自分のものか確認` 
          : data.error;
        alert("追加失敗: " + msg);
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  if (status === "loading") return <div className={styles.container}>読み込み中...</div>;

  if (!session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Beat Explorer</h1>
          <button onClick={() => signIn("spotify")} className={styles.button}>
            Spotifyでログイン
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title}>Beat Explorer</h1>
          <button onClick={() => signOut()} className={styles.button} style={{ padding: '5px 15px', background: 'none', border: '1px solid #333' }}>
            ログアウト
          </button>
        </div>
      </header>
      
      <div className={styles.searchSection}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="今の気分は？"
          className={styles.input}
        />
        <button onClick={handleSearch} disabled={isLoading} className={styles.button}>
          {isLoading ? "解析中..." : "検索"}
        </button>
      </div>

      {error && <p style={{ color: '#ff4d4d', textAlign: 'center' }}>{error}</p>}

      <div className={styles.grid}>
        {recommendations.map((track: any, index: number) => (
          <div key={index} className={styles.card}>
            {track.album_image && <img src={track.album_image} alt={track.track} style={{ width: '100%', borderRadius: '10px' }} />}
            <div style={{ marginTop: '15px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#fff' }}>{track.track}</h2>
              <p style={{ color: '#1db954' }}>{track.artist}</p>
              <p style={{ fontSize: '0.8rem', color: '#b3b3b3', margin: '10px 0' }}>{track.reason}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {track.preview_url ? (
                  <audio controls src={track.preview_url} style={{ width: '100%', height: '30px' }} />
                ) : (
                  <p style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center' }}>※プレビュー不可</p>
                )}
                <button onClick={() => handleAddToPlaylist(track.track_uri)} className={styles.button} style={{ width: '100%' }}>
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
