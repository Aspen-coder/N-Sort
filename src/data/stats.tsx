// src/data/stats.ts
import { Line } from "react-chartjs-2";

export interface PracticeStat {
  timestamp: number;
  modeKey: string;       // e.g., "2 stimuli"
  correct: boolean;
  stimuliCount: number;  // number of types
  sequenceLength: number;
  speedPerStimulus: number; // seconds per stimulus
  speed: number;         // stimuli/sec (optional)
  score: number;         // new scoring
}

// Global state (if you want to use these in multiple components)
export let stats: PracticeStat[] = [];

// Load stats from localStorage
export function loadStats(): PracticeStat[] {
  const saved = localStorage.getItem("practiceStats");
  stats = saved ? JSON.parse(saved) : [];
  return stats;
}

// Save stats to localStorage and update global variable
export function saveStat(newStat: PracticeStat) {
  stats.push(newStat);
  localStorage.setItem("practiceStats", JSON.stringify(stats));
  console.log("SAVING STAT:", newStat);
}

// Call when a practice round is complete
export function onPracticeComplete(params: {
  correct: boolean;
  stimuliCount: number;
  sequenceLength: number;
  speedPerStimulus: number;
}) {
  const { correct, stimuliCount, sequenceLength, speedPerStimulus } = params;

  const score = correct ? (sequenceLength * stimuliCount) / speedPerStimulus : 0;

  const newStat: PracticeStat = {
    timestamp: Date.now(),
    modeKey: `${stimuliCount} types`,
    correct,
    stimuliCount,
    sequenceLength,
    speedPerStimulus,
    speed: sequenceLength / speedPerStimulus,
    score,
  };

  saveStat(newStat);
}


interface StatsPopupProps {
  onClose: () => void;
}

export function StatsPopup({ onClose }: StatsPopupProps) {
  const stats = loadStats();

  // summary counts
  const correctCount = stats.filter(s => s.correct).length;
  const incorrectCount = stats.filter(s => !s.correct).length;
  const correctStats = stats.filter(s => s.correct);

  // Group stats by modeKey (same as before)
  const grouped = stats.reduce((acc, s) => {
    if (!acc[s.modeKey]) acc[s.modeKey] = [];
    acc[s.modeKey].push(s);
    return acc;
  }, {} as Record<string, PracticeStat[]>);

  // Chart data preparation remains mostly the same
  const timestamps = Array.from(new Set(correctStats.map(s => s.timestamp))).sort((a, b) => a - b);
  const labels = timestamps.map(t => new Date(t).toLocaleString());

  const datasets = Object.keys(grouped).map((modeKey, i) => {
    const dataForMode = grouped[modeKey];
    const scoreMap = new Map(dataForMode.map(s => [s.timestamp, s.score]));
    return {
      label: `${modeKey} (score)`,
      data: timestamps.map(ts => scoreMap.get(ts) ?? null),
      fill: false,
      borderColor: `hsl(${i * 70}, 70%, 50%)`,
      tension: 0.1,
    };
  });

  const data = { labels, datasets };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Practice Statistics</h2>

        {/* Correct / Incorrect summary */}
        <div className="mb-4 text-gray-700">
          <span className="mr-4 font-semibold text-green-600">Correct: {correctCount}</span>
          <span className="font-semibold text-red-600">Incorrect: {incorrectCount}</span>
        </div>

        <Line data={data} />

        <div className="mt-6 text-right">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}