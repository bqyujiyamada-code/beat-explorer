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
        if (res.status === 503) {
          throw new Error("AIが混み合っています。数秒後にもう一度お試しください。");
        }
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
    if (!trackUri) {
      alert("楽曲の識別情報(URI)が見つかりません。");
      return;
    }
    
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
        if (res.status === 403) {
          alert("【403エラー】権限がありません。\n\n対策:\n1. 一度ログアウトして再ログインし、権限を承認してください。\n2. 設定したプレイリストIDが「自分が作成したもの」か確認してください。");
        } else {
          alert("追加失敗: " + (data.error || "不明なエラー"));
        }
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
          {isLoading ? "AI解析中..." : "検索"}
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
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px', color: '#fff' }}>
                {track.track}
              </h2>
              <p style={{ color: '#1db954', fontWeight: 'bold', marginBottom: '10px' }}>{track.artist}</p>
              <p style={{ fontSize: '0.85rem', color: '#b3b3b3', lineHeight: '1.5', marginBottom: '15px' }}>
                {track.reason}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 視聴ボタンの表示判定 */}
                {track.preview_url ? (
                  <audio controls src={track.preview_url} style={{ width: '100%', height: '32px' }}>
                    お使いのブラウザは再生に対応していません
                  </audio>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                    ※この楽曲はプレビュー再生が制限されています
                  </p>
                )}

                <button
                  onClick={() => handleAddToPlaylist(track.track_uri)}
                  className={styles.button}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '0.9rem',
                    marginTop: '5px'
                  }}
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
