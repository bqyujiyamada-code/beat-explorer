"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { signIn, signOut, useSession } from "next-auth/react";

export default function MusicExplorer() {
  const { data: session, status } = useSession(); // ログイン状態を取得
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
        if (res.status === 401) throw new Error("セッション切れです。再ログインしてください。");
        if (res.status === 503) throw new Error("AI混雑中...数秒後にお試しください。");
        throw new Error(data.error || "検索失敗");
      }
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
      if (res.ok) {
        alert("プレイリストに追加しました！");
      } else {
        const data = await res.json();
        alert("失敗: " + (data.error || "エラー"));
      }
    } catch (err) {
      alert("通信エラー");
    }
  };

  // 1. ログイン確認中の表示
  if (status === "loading") {
    return <div className={styles.container}><p style={{textAlign: 'center'}}>読み込み中...</p></div>;
  }

  // 2. 未ログイン時の表示
  if (!session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Beat Explorer</h1>
          <p style={{ marginBottom: '2rem', color: '#888' }}>Spotifyでログインして、AIのおすすめをプレイリストに入れよう</p>
          <button onClick={() => signIn("spotify")} className={styles.button} style={{ padding: '15px 40px' }}>
            Spotifyでログイン
          </button>
        </header>
      </div>
    );
  }

  // 3. ログイン済みの表示（メイン機能）
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={styles.title} style={{ margin: 0 }}>Beat Explorer</h1>
          <button 
            onClick={() => signOut()} 
            style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}
          >
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
          {isLoading ? "AI解析中..." : "検索"}
        </button>
      </div>

      {error && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>}

      <div className={styles.grid}>
        {recommendations.map((track: any, index: number) => (
          <div key={index} className={styles.card}>
            {track.album_image && <img src={track.album_image} alt={track.track} style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }} />}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{track.track}</h2>
              <p style={{ color: '#1db954', fontWeight: 'bold' }}>{track.artist}</p>
              <p style={{ fontSize: '0.85rem', color: '#b3b3b3', margin: '15px 0' }}>{track.reason}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {track.preview_url ? (
                  <audio controls src={track.preview_url} style={{ width: '100%', height: '32px' }} />
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>※プレビュー制限あり</p>
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
