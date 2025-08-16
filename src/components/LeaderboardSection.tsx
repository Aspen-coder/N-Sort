"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface ScoreEntry {
  username: string;
  score: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scoresRef = collection(db, "scores");
    const q = query(scoresRef, orderBy("score", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: ScoreEntry[] = snapshot.docs.map((doc) => ({
        username: doc.data().username,
        score: doc.data().score,
      }));
      setScores(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md";
      default:
        return "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
           <button
              onClick={() => {
                router.push("/")
              }}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors underline"
            >
              Go Back
            </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Top {scores.length} players</p>
        </div>

        {/* Top 3 Podium */}
        {scores.length >= 3 && (
          <div className="flex justify-center items-end mb-8 space-x-4">
            {/* Second Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg p-4 mb-2 transform hover:scale-105 transition-transform">
                <div className="text-2xl mb-2">🥈</div>
                <div className="text-white font-semibold">{scores[1]?.username}</div>
                <div className="text-white text-sm">{scores[1]?.score}</div>
              </div>
              <div className="bg-gray-400 h-16 w-24 rounded-t-lg"></div>
            </div>

            {/* First Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 mb-2 transform hover:scale-105 transition-transform shadow-xl">
                <div className="text-3xl mb-2">👑</div>
                <div className="text-white font-bold text-lg">{scores[0]?.username}</div>
                <div className="text-white">{scores[0]?.score}</div>
              </div>
              <div className="bg-yellow-500 h-24 w-24 rounded-t-lg"></div>
            </div>

            {/* Third Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-4 mb-2 transform hover:scale-105 transition-transform">
                <div className="text-2xl mb-2">🥉</div>
                <div className="text-white font-semibold">{scores[2]?.username}</div>
                <div className="text-white text-sm">{scores[2]?.score}</div>
              </div>
              <div className="bg-orange-500 h-12 w-24 rounded-t-lg"></div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Complete Rankings</h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {scores.map((entry, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={`${entry.username}-${idx}`}
                  className={`
                    flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0
                    transition-all duration-200 transform hover:scale-[1.02]
                    ${getRankStyle(rank)}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                      ${rank <= 3 ? 'text-white' : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'}
                    `}>
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </div>
                    <div>
                      <div className={`font-semibold ${rank <= 3 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {entry.username}
                      </div>
                      {rank <= 10 && (
                        <div className={`text-sm ${rank <= 3 ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          Top {rank <= 3 ? '3' : '10'} Player
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${rank <= 3 ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {entry.score.toLocaleString()}
                    </div>
                    <div className={`text-sm ${rank <= 3 ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      points
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {scores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No scores yet!
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Be the first to make it to the leaderboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}