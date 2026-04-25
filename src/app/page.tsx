"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./page.module.css";

export default function MusicApp() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setRecommendations([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* ログイン・認証セクション */}
        <div className={styles.authSection}>
          {session ? (
            <div className={styles.userProfile}>
              <span className={styles.userName}>👤 {session.user?.name}</span>
              <button onClick={() => signOut()} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("spotify")} className={styles.loginBtn}>
              Spotifyでログイン
            </button>
          )}
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Music Explorer</h1>
          <div className={styles.searchSection}>
            <input
              className={styles.input}
              type="text"
              placeholder="今の気分や、好きなアーティストを入力..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button 
              className={styles.button} 
              onClick={handleSearch} 
              disabled={isLoading}
            >
              {isLoading ? "..." : "SEARCH"}
            </button>
          </div>
        </header>

        <main>
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>AIがあなたにぴったりの曲をセレクト中...</p>
            </div>
          )}

          {!isLoading && (
            <div className={styles.grid}>
              {recommendations.map((rec: any, i: number) => (
                <div key={i} className={styles.card}>
                  <span className={styles.category}>{rec.category}</span>
                  
                  <img 
                    className={styles.albumImage}
                    src={rec.album_image || "/no-image.png"} 
                    alt={rec.track} 
                  />

                  <div className={styles.content}>
                    <h2 className={styles.trackName}>{rec.track}</h2>
                    <p className={styles.artistName}>{rec.artist}</p>
                    <p className={styles.reason}>{rec.reason}</p>

                    <div className={styles.previewSection}>
                      <p className={styles.previewLabel}>Preview Audio</p>
                      {rec.preview_url ? (
                        <audio controls src={rec.preview_url} className={styles.audio} />
                      ) : (
                        <p className={styles.noPreview}>※試聴音源がありません</p>
                      )}
                    </div>

                    <div className={styles.actionSection}>
                      <a 
                        href={rec.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.spotifyButton}
                      >
                        LISTEN ON SPOTIFY
                      </a>
                      
                      {/* ログイン中のみ表示される追加ボタン（ロジックは今後実装） */}
                      {session && (
                        <button className={styles.addToPlaylistBtn}>
                          ＋ ADD TO PLAYLIST
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
