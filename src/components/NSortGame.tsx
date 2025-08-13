"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Brain, Settings } from "lucide-react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { HasLoadingBoundary } from "next/dist/server/app-render/types";

type StimulusType = "colors" | "numbers" | "letters" | "shapes";
type SortingPattern =
  | "forward"
  | "reverse"
  | "rainbow"
  | "alphabet"
  | "reverse_alphabet";

interface Stimulus {
  id: string;
  display: string;
  type: string;
  sortValue: number;
  stimulusType?: StimulusType;
}

interface PracticeStat {
  timestamp: number; // Date.now()
  modeKey: string;   // Example: "3-types-N=3"
  speed: number;     // stimuli per second
}



const stimuli: Record<StimulusType, Stimulus[]> = {
  colors: [
    { id: "red", display: "#EF4444", type: "color", sortValue: 1 },
    { id: "orange", display: "#F97316", type: "color", sortValue: 2 },
    { id: "yellow", display: "#EAB308", type: "color", sortValue: 3 },
    { id: "green", display: "#22C55E", type: "color", sortValue: 4 },
    { id: "blue", display: "#3B82F6", type: "color", sortValue: 5 },
    { id: "purple", display: "#A855F7", type: "color", sortValue: 6 },
  ],
  numbers: [
    { id: "1", display: "1", type: "number", sortValue: 1 },
    { id: "2", display: "2", type: "number", sortValue: 2 },
    { id: "3", display: "3", type: "number", sortValue: 3 },
    { id: "4", display: "4", type: "number", sortValue: 4 },
    { id: "5", display: "5", type: "number", sortValue: 5 },
    { id: "6", display: "6", type: "number", sortValue: 6 },
    { id: "7", display: "7", type: "number", sortValue: 7 },
    { id: "8", display: "8", type: "number", sortValue: 8 },
    { id: "9", display: "9", type: "number", sortValue: 9 },
  ],
  letters: [
    { id: "A", display: "A", type: "letter", sortValue: 1 },
    { id: "B", display: "B", type: "letter", sortValue: 2 },
    { id: "C", display: "C", type: "letter", sortValue: 3 },
    { id: "D", display: "D", type: "letter", sortValue: 4 },
    { id: "E", display: "E", type: "letter", sortValue: 5 },
    { id: "F", display: "F", type: "letter", sortValue: 6 },
    { id: "G", display: "G", type: "letter", sortValue: 7 },
    { id: "H", display: "H", type: "letter", sortValue: 8 },
  ],
  shapes: [
    { id: "circle", display: "●", type: "shape", sortValue: 1 },
    { id: "square", display: "■", type: "shape", sortValue: 2 },
    { id: "triangle", display: "▲", type: "shape", sortValue: 3 },
    { id: "diamond", display: "♦", type: "shape", sortValue: 4 },
    { id: "star", display: "★", type: "shape", sortValue: 5 },
    { id: "heart", display: "♥", type: "shape", sortValue: 6 },
    { id: "club", display: "♣", type: "shape", sortValue: 7 },
    { id: "spade", display: "♠", type: "shape", sortValue: 8 },
  ],
};

const availableSortingPatterns: Record<
  StimulusType,
  { key: SortingPattern; label: string }[]
> = {
  colors: [{ key: "rainbow", label: "Rainbow (ROYGBIV)" }],
  numbers: [
    { key: "forward", label: "Forward (1→9)" },
    { key: "reverse", label: "Reverse (9→1)" },
  ],
  letters: [
    { key: "alphabet", label: "Forward Alphabetical (A→H)" },
    { key: "reverse_alphabet", label: "Reverse Alphabetical (H→A)" },
  ],
  shapes: [
    { key: "forward", label: "Forward (●→♠)" },
    { key: "reverse", label: "Reverse (♠→●)" },
  ],
};

const rainbowOrder = ["red", "orange", "yellow", "green", "blue", "purple"];
type UserSequences = Record<StimulusType, Stimulus[]>;

const NSortGame: React.FC = () => {
  const [gameState, setGameState] = useState<
    "setup" | "presenting" | "sorting" | "result"
  >("setup");

  const [level, setLevel] = useState(3); // sequence length per selected type
  const [selectedStimulusTypes, setSelectedStimulusTypes] = useState<
    StimulusType[]
  >(["colors"]);

  const [sortingPatterns, setSortingPatterns] = useState<
    Record<StimulusType, SortingPattern>
  >({
    colors: "forward",
    numbers: "forward",
    letters: "alphabet",
    shapes: "forward",
  });

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [showAdvanced, setShowAdvanced] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [distinction, setDistinction] = useState(50); // default 50%
    const [hasLoaded, setHasLoaded] = useState(false); // for react bugging out

  const [speed, setSpeed] = useState(2.0); // seconds per stimulus

  const [sequencesByType, setSequencesByType] = useState<
    Record<StimulusType, Stimulus[]>
  >({
    colors: [],
    numbers: [],
    letters: [],
    shapes: [],
  });

  const [userSequences, setUserSequences] = useState<UserSequences>({
    colors: [],
    numbers: [],
    letters: [],
    shapes: [],
  });

  const [currentPresentIndex, setCurrentPresentIndex] = useState(0);
  const [showingStimulus, setShowingStimulus] = useState(false);

  const [selectionHistory, setSelectionHistory] = useState<
    { type: StimulusType; stimulus: Stimulus }[]
  >([]);

  // --- Generation ---
  const generateSequencesByType = useCallback(() => {
  const newSequences: Record<StimulusType, Stimulus[]> = {
    colors: [],
    numbers: [],
    letters: [],
    shapes: [],
  };

  selectedStimulusTypes.forEach((type) => {
    const pool = stimuli[type];
    const seq: Stimulus[] = [];

    for (let i = 0; i < level; i++) {
      // Distinction bias: probability to avoid duplicates
      let candidate: Stimulus;
      if (Math.random() < distinction / 100) {
        // Pick something NOT already used in this sequence (if possible)
        const unused = pool.filter(
          (stim) => !seq.some((s) => s.id === stim.id)
        );
        if (unused.length > 0) {
          candidate = unused[Math.floor(Math.random() * unused.length)];
        } else {
          candidate = pool[Math.floor(Math.random() * pool.length)];
        }
      } else {
        // No bias — pick freely
        candidate = pool[Math.floor(Math.random() * pool.length)];
      }

      seq.push({ ...candidate, stimulusType: type });
    }

    newSequences[type] = seq;
  });

  return newSequences;
}, [level, selectedStimulusTypes, distinction]);

    // stats helpers
function savePracticeStat(selectedStimulusTypes: string[], N: number, speedSetting: number, correctCount: number) {
  const modeKey = `${selectedStimulusTypes.length}-types-N=${N}`;

  // Calculate average stimuli/second for correct answers only
  const avgSpeed = correctCount / speedSetting; // stimuli per second

  const newStat: PracticeStat = {
    timestamp: Date.now(),
    modeKey,
    speed: avgSpeed,
  };

  // Load existing stats
  const existing = JSON.parse(localStorage.getItem("nsort_stats") || "[]");

  // Add new record
  existing.push(newStat);

  // Save back to localStorage
  localStorage.setItem("nsort_stats", JSON.stringify(existing));
}

function loadStats(): PracticeStat[] {
  return JSON.parse(localStorage.getItem("practiceStats") || "[]");
}

function saveStat(newStat: PracticeStat) {
  const stats = loadStats();
  console.log("SAVING STAT!!");
  stats.push(newStat);
  localStorage.setItem("practiceStats", JSON.stringify(stats));
}

function onPracticeComplete(params: { correct: boolean; stimuliCount: number; speedPerStimulus: number }) {
  const { correct, stimuliCount, speedPerStimulus } = params;
  if (!correct) return;

  const totalSpeed = stimuliCount / speedPerStimulus;

  const newStat: PracticeStat = {
    timestamp: Date.now(),
    modeKey: `${stimuliCount} stimuli`,
    speed: totalSpeed,
  };

  saveStat(newStat);
}

interface StatsPopupProps {
  onClose: () => void;
}

function StatsPopup({ onClose }: StatsPopupProps) {
  const stats = loadStats();
  console.log("Loaded stats:", stats);
  // Group stats by modeKey
  const grouped = stats.reduce((acc, s) => {
    if (!acc[s.modeKey]) acc[s.modeKey] = [];
    acc[s.modeKey].push(s);
    return acc;
  }, {} as Record<string, PracticeStat[]>);

  // Sort each group by timestamp
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.timestamp - b.timestamp));

  // Get all unique timestamps sorted
  const timestamps = Array.from(new Set(stats.map(s => s.timestamp))).sort((a, b) => a - b);

  // Create labels for x-axis
  const labels = timestamps.map(t => new Date(t).toLocaleString());

  // Build datasets aligned to timestamps
  const datasets = Object.keys(grouped).map((modeKey, i) => {
    const dataForMode = grouped[modeKey];
    const speedMap = new Map(dataForMode.map(s => [s.timestamp, s.speed]));
    return {
      label: modeKey,
      data: timestamps.map(ts => speedMap.get(ts) ?? null),
      fill: false,
      borderColor: `hsl(${i * 70}, 70%, 50%)`,
      tension: 0.1,
    };
  });

  const data = {
    labels,
    datasets,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Practice Statistics</h2>
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
// -- Advanced Settings Popup
const [disableAnimation, setDisableAnimation] = useState<boolean>(false);

interface AdvancedSettingsPopupProps {
  onClose: () => void;
}

function AdvancedSettingsPopup({ onClose }: { onClose: () => void }) {
  // Load saved values from localStorage first, fallback to global variables
  const savedDistinction = localStorage.getItem("distinction");
  const savedDisableAnimation = localStorage.getItem("disableAnimation");

  const [localDistinction, setLocalDistinction] = useState(
    savedDistinction !== null ? Number(savedDistinction) : distinction
  );

  const [localDisableAnimation, setLocalDisableAnimation] = useState(
    savedDisableAnimation !== null ? savedDisableAnimation === "true" : disableAnimation
  );

  // Commit changes when closing
  const handleClose = () => {
    setDistinction(localDistinction); // update global
    setDisableAnimation(localDisableAnimation); // update global
    localStorage.setItem("distinction", localDistinction.toString());
    localStorage.setItem("disableAnimation", localDisableAnimation.toString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Advanced Settings</h2>

        {/* Distinction slider */}
        <label className="block mb-4">
          <span className="text-gray-700">Distinction: {localDistinction}%</span>
          <input
            type="range"
            min={1}
            max={100}
            value={localDistinction}
            onChange={(e) => setLocalDistinction(Number(e.target.value))}
            className="w-full mt-2"
          />
        </label>

        {/* Disable animation checkbox */}
        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={localDisableAnimation}
            onChange={(e) => setLocalDisableAnimation(e.target.checked)}
          />
          <span className="text-gray-700">Disable stimulus fade-in animation</span>
        </label>

        <div className="mt-6 text-right">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}









  // --- Sorting helpers ---
  const sortSequenceByPattern = (
    seq: Stimulus[],
    type: StimulusType,
    pattern: SortingPattern
  ) => {
    const group = [...seq];
    switch (pattern) {
      case "forward":
        return group.sort((a, b) => a.sortValue - b.sortValue);
      case "reverse":
        return group.sort((a, b) => b.sortValue - a.sortValue);
      case "rainbow":
        if (type === "colors") {
          return group.sort(
            (a, b) => rainbowOrder.indexOf(a.id) - rainbowOrder.indexOf(b.id)
          );
        }
        return group.sort((a, b) => a.sortValue - b.sortValue);
      case "alphabet":
        return group.sort((a, b) => a.id.localeCompare(b.id));
      case "reverse_alphabet":
        return group.sort((a, b) => b.id.localeCompare(a.id));
      default:
        return group.sort((a, b) => a.sortValue - b.sortValue);
    }
  };

  const getSortedSequences = (): Record<StimulusType, Stimulus[]> => {
    const sorted: Record<StimulusType, Stimulus[]> = {
      colors: [],
      numbers: [],
      letters: [],
      shapes: [],
    };
    selectedStimulusTypes.forEach((type) => {
      const seq = sequencesByType[type] || [];
      const pattern = sortingPatterns[type] || "forward";
      sorted[type] = sortSequenceByPattern(seq, type, pattern);
    });
    return sorted;
  };

  // Available pool for sorting (compact tiles)
  const getCombinedPool = (): Stimulus[] => {
    const combined: Stimulus[] = [];
    selectedStimulusTypes.forEach((type) => {
      combined.push(
        ...stimuli[type].map((stimulus) => ({
          ...stimulus,
          stimulusType: type,
        }))
      );
    });
    return combined;
  };


  // --- Game control ---
  const startGame = () => {
    const generated = generateSequencesByType();
    setSequencesByType(generated);
    setUserSequences({
      colors: [],
      numbers: [],
      letters: [],
      shapes: [],
    });
    setSelectionHistory([]);
    setCurrentPresentIndex(0);
    setGameState("presenting");
    setShowingStimulus(false);
  };

  const maxSequenceLength = Math.max(
    ...selectedStimulusTypes.map((t) => sequencesByType[t]?.length || 0)
  );

  // --- Presenting loop ---
  useEffect(() => {
    if (gameState !== "presenting") return;

    if (currentPresentIndex >= maxSequenceLength) {
      setGameState("sorting");
      setShowingStimulus(false);
      return;
    }

    setShowingStimulus(true);
    
    const showTimer = setTimeout(() => {
      setShowingStimulus(false);
      const pauseDuration = disableAnimation ? 50 : 280;

      const pauseTimer = setTimeout(() => {
        setCurrentPresentIndex((prev) => prev + 1);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }, speed * 1000);

    return () => clearTimeout(showTimer);
  }, [gameState, currentPresentIndex, maxSequenceLength, speed]);

  // --- Settings handlers ---
  const handleStimulusTypeToggle = (type: StimulusType) => {
    let newSelected: StimulusType[];
    if (selectedStimulusTypes.includes(type)) {
      newSelected = selectedStimulusTypes.filter((t) => t !== type);
      if (newSelected.length === 0) return; // keep at least one
    } else {
      newSelected = [...selectedStimulusTypes, type];
    }
    setSelectedStimulusTypes(newSelected);
  };

  const handleSortingPatternChange = (
    type: StimulusType,
    pattern: SortingPattern
  ) => {
    setSortingPatterns((prev) => ({
      ...prev,
      [type]: pattern,
    }));
  };

  // --- Sorting clicks ---
  const handleStimulusClick = (stimulus: Stimulus) => {
    if (gameState !== "sorting") return;
    if (!stimulus.stimulusType) return;

    const type = stimulus.stimulusType;

    // Enforce cap: prevent picking more of a token than were generated for that type
    const countInUser = userSequences[type].filter((s) => s.id === stimulus.id)
      .length;
    const countInGenerated = sequencesByType[type].filter(
      (s) => s.id === stimulus.id
    ).length;
   // if (countInUser >= countInGenerated) return; NO HEHEHEHE

    setUserSequences((prev) => ({
      ...prev,
      [type]: [...prev[type], stimulus],
    }));

    setSelectionHistory((prev) => [...prev, { type, stimulus }]);
  };

  const undoLastSelection = () => {
    if (selectionHistory.length === 0) return;
    const last = selectionHistory[selectionHistory.length - 1];

    setUserSequences((prev) => ({
      ...prev,
      [last.type]: prev[last.type].slice(0, -1),
    }));

    setSelectionHistory((prev) => prev.slice(0, -1));
  };

  // --- Check answers ---
  const checkAnswers = () => {
    const sortedSequences = getSortedSequences();
    let allCorrect = true;

    for (const type of selectedStimulusTypes) {
      const userSeq = userSequences[type];
      const correctSeq = sortedSequences[type];

      if (
        userSeq.length !== correctSeq.length ||
        userSeq.some((stim, idx) => stim.id !== correctSeq[idx].id)
      ) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setScore((prev) => prev + level * 10);
      setStreak((prev) => prev + 1);
      
    } else {
      setStreak(0);
    }
    onPracticeComplete({
        correct: allCorrect,
        stimuliCount: selectedStimulusTypes.length,
        speedPerStimulus: speed,
    });
    setGameState("result");

  };

  // Auto-check when all selected
  useEffect(() => {
    if (gameState !== "sorting") return;

    const totalSelected = Object.values(userSequences).reduce(
      (acc, arr) => acc + arr.length,
      0
    );

    const totalStimuli = selectedStimulusTypes.reduce(
      (acc, type) => acc + (sequencesByType[type]?.length || 0),
      0
    );

    if (totalSelected === totalStimuli && totalStimuli > 0) {
      checkAnswers();
    }
  }, [userSequences, gameState, selectedStimulusTypes, sequencesByType, level]);

  // --- Rendering helpers (compact with animations) ---
  const renderStimulus = (
    stimulus: Stimulus,
    size: "large" | "small" = "large",
    extra?: string
  ) => {
    const base =
      size === "large"
        ? "w-16 h-16 text-3xl md:w-20 md:h-20 md:text-4xl"
        : "w-10 h-10 text-lg md:w-12 md:h-12 md:text-xl";

    if (stimulus.type === "color") {
      return (
        <div
          className={`${base} rounded-xl border border-white/70 shadow-md ring-1 ring-black/5 ${extra || ""}`}
          style={{ backgroundColor: stimulus.display }}
          aria-label={stimulus.id}
        />
      );
    }

    return (
      <div
        className={`${base} bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center font-semibold text-gray-800 select-none ${extra || ""}`}
        aria-label={stimulus.id}
      >
        {stimulus.display}
      </div>
    );
  };

  const sectionCard =
    "bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-purple-700">
            <Brain className="w-9 h-9 text-purple-600 drop-shadow" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight select-none">
              N‑Sort Challenge
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="px-4 py-2 rounded-xl bg-white/70 border border-purple-100 shadow-sm text-gray-700">
              Score: <span className="text-purple-600 font-semibold">{score}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/70 border border-purple-100 shadow-sm text-gray-700">
              Streak:{" "}
              <span className="text-purple-600 font-semibold">{streak}</span>
            </div>
          </div>
        </header>

        {/* Mobile score/streak */}
        <div className="md:hidden mt-4 grid grid-cols-2 gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/80 border border-purple-100 shadow-sm text-center text-gray-700">
            Score: <span className="text-purple-600 font-semibold">{score}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/80 border border-purple-100 shadow-sm text-center text-gray-700">
            Streak: <span className="text-purple-600 font-semibold">{streak}</span>
          </div>
        </div>

        {/* --- SETUP --- */}
            {gameState === "setup" && (
    <section className={`mt-6 p-6 ${sectionCard}`}>
        <h2 className="flex items-center text-2xl md:text-3xl font-semibold mb-6 text-purple-700">
        <Settings className="w-7 h-7 mr-3" />
        Game Settings
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
        {/* Level */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm">
            <label className="block text-gray-700 font-medium mb-2">
            Level (N = <span className="text-purple-700">{level}</span>)
            </label>
            <input
            type="range"
            min={2}
            max={9}
            step={1}
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
            aria-label="Level"
            />
            <div className="mt-1 text-sm text-gray-500">
            Number of stimuli per selected type.
            </div>
        </div>

        {/* Speed */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-purple-100 shadow-sm">
            <label className="block text-gray-700 font-medium mb-2">
            Speed <span className="text-gray-500">(seconds per stimulus)</span>
            </label>
            <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
            aria-label="Speed"
            />
            <div className="mt-1 text-sm text-gray-500">
            {speed.toFixed(2)}s per stimulus
            </div>
        </div>
        </div>

        {/* Extra Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
        <button
            onClick={() => setShowAdvanced(true)}
            className="px-5 py-2.5 bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
            ⚙️ Advanced Settings
        </button>

        <button
            onClick={() => setShowStats(true)}
            className="px-5 py-2.5 bg-pink-200 hover:bg-pink-300 text-pink-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
            📊 Show Stats
        </button>
        </div>

        {/* Stimulus types */}
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-purple-100 shadow-sm">
        <label className="block text-gray-700 font-medium mb-3">
            Select Stimulus Types
        </label>
        <div className="flex flex-wrap gap-4">
            {(Object.keys(stimuli) as StimulusType[]).map((type) => {
            const active = selectedStimulusTypes.includes(type);
            return (
                <button
                key={type}
                onClick={() => handleStimulusTypeToggle(type)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                    active
                    ? "bg-purple-600 text-white border-purple-700 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-sm"
                }`}
                aria-pressed={active}
                >
                <span className="capitalize">{type}</span>
                </button>
            );
            })}
        </div>
        </div>

        {/* Sorting patterns */}
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-purple-100 shadow-sm">
        <label className="block text-gray-700 font-medium mb-3">
            Sorting Pattern per Stimulus Type
        </label>
        <div className="flex flex-wrap gap-4">
            {selectedStimulusTypes.map((type) => (
            <div
                key={type}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
                <span className="font-semibold capitalize text-purple-700">
                {type}
                </span>
                <select
                className="rounded-md border border-gray-200 px-2 py-1 text-gray-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={sortingPatterns[type]}
                onChange={(e) =>
                    handleSortingPatternChange(
                    type,
                    e.target.value as SortingPattern
                    )
                }
                aria-label={`Sorting pattern for ${type}`}
                >
                {availableSortingPatterns[type].map(({ key, label }) => (
                    <option key={key} value={key}>
                    {label}
                    </option>
                ))}
                </select>
            </div>
            ))}
        </div>
        </div>

        {/* Start */}
        <div className="mt-10 text-center">
        <button
            className="px-10 py-3 font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg active:scale-[0.99] transition-all"
            onClick={startGame}
        >
            Start Game
        </button>
        </div>
    </section>
    )}

        {/* --- PRESENTING --- */}
        {gameState === "presenting" && (
          <section className={`mt-8 p-6 ${sectionCard}`}>
            <div className="text-gray-700 text-lg font-semibold select-none text-center">
              Memorize the sequence
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {selectedStimulusTypes.map((type) => {
                const seq = sequencesByType[type] || [];
                const stim = seq[currentPresentIndex];

                return (
                  <div
                    key={type}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-white to-purple-50 border border-purple-100 shadow-sm"
                  >
                    <div className="mb-2 capitalize font-semibold text-purple-700 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
                      {type}
                    </div>
                    {stim && showingStimulus ? (
                   <div
                    className={`${
                        disableAnimation
                        ? "opacity-100 scale-100 transition-none" // no animation at all
                        : "transition-all duration-100 ease-out scale-95 opacity-0 animate-[fadeIn_0.1s_ease-out_forwards]"
                    }`}
                    key={`${type}-${currentPresentIndex}-${stim.id}-${disableAnimation ? "noanim" : "anim"}`}
                    >
                    {showingStimulus && renderStimulus(
                        stim,
                        "large",
                        "shadow-md ring-1 ring-purple-500/20"
                    )}
                    </div>


                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-dashed border-purple-200 bg-white/70" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center">
              Showing item {Math.min(currentPresentIndex + 1, maxSequenceLength)} of{" "}
              {maxSequenceLength}
            </div>
          </section>
        )}

        {/*--- ADVANCED SETTINGS --- */}
               {showAdvanced && (
            <AdvancedSettingsPopup
                onClose={() => setShowAdvanced(false)}
            />
            )}

        {/* --- STATISTICS --- */}
        {showStats && <StatsPopup onClose={() => setShowStats(false)} />}

        {/* --- SORTING --- */}
        {gameState === "sorting" && (
          <section className="mt-8 grid lg:grid-cols-5 gap-6">
            {/* User sequences */}
            <div className={`lg:col-span-2 p-5 ${sectionCard}`}>
              <div className="text-gray-800 font-semibold text-lg mb-4">
                Build the sorted sequences
              </div>

              <div className="flex flex-col gap-5">
                {selectedStimulusTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold text-purple-700 capitalize">
                        {type} sequence
                      </div>
                      <div className="text-xs text-gray-500">
                        Pattern:{" "}
                        <span className="font-semibold">
                          {
                            availableSortingPatterns[type].find(
                              (p) => p.key === sortingPatterns[type]
                            )?.label
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[56px] rounded-lg border border-purple-200 bg-white p-2">
                      {userSequences[type].length === 0 && (
                        <div className="text-gray-400 select-none">
                          Tap tiles below to add…
                        </div>
                      )}

                      {userSequences[type].map((stimulus, index) => (
                        <button
                          key={`${stimulus.id}-${index}`}
                          onClick={() => {
                            // Remove specific tile from this sequence
                            setUserSequences((prev) => ({
                              ...prev,
                              [type]: prev[type].filter((_, i) => i !== index),
                            }));
                            // Remove last matching history item for this stim/type
                            setSelectionHistory((prev) => {
                              const idx = [...prev]
                                .reverse()
                                .findIndex(
                                  (sel) =>
                                    sel.type === type &&
                                    sel.stimulus.id === stimulus.id
                                );
                              if (idx === -1) return prev;
                              const realIdx = prev.length - 1 - idx;
                              return [
                                ...prev.slice(0, realIdx),
                                ...prev.slice(realIdx + 1),
                              ];
                            });
                          }}
                          title="Click to remove"
                          className="transition-transform active:scale-95"
                          aria-label={`Remove ${stimulus.id} from ${type} sequence`}
                        >
                          {renderStimulus(
                            stimulus,
                            "small",
                            "hover:ring-2 hover:ring-purple-300"
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                  onClick={undoLastSelection}
                  disabled={selectionHistory.length === 0}
                >
                  Undo Last
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                  onClick={checkAnswers}
                >
                  Check Now
                </button>
              </div>
            </div>

            {/* Pool */}
            <div className={`lg:col-span-3 p-5 ${sectionCard}`}>
              <div className="text-gray-800 font-semibold text-lg mb-4">
                Available tiles
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {getCombinedPool().map((stimulus, index) => {
                  const type = stimulus.stimulusType!;
                  const countInUser = userSequences[type].filter(
                    (s) => s.id === stimulus.id
                  ).length;
                  const countInGenerated = sequencesByType[type].filter(
                    (s) => s.id === stimulus.id
                  ).length;
                  const disabled = false;

                  return (
                    <button
                      key={`${stimulus.id}-${index}`}
                      onClick={() => !disabled && handleStimulusClick(stimulus)}
                      disabled={disabled}
                      aria-label={`Select ${stimulus.id} (${type})`}
                      className={`rounded-xl border p-1 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                        !disabled
                          ? "hover:scale-105 hover:shadow"
                          : "opacity-60"
                      }`}
                      title={
                        disabled
                          ? "No more of this tile were shown"
                          : `Add ${stimulus.id} to ${type}`
                      }
                    >
                      {renderStimulus(
                        stimulus,
                        "small",
                        !disabled ? "ring-1 ring-black/5" : ""
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tip: You can remove a tile from your sequence by clicking it.
              </div>
            </div>
          </section>
        )}

        {/* --- RESULT --- */}

        

        {gameState === "result" && (
          <section className={`mt-8 p-6 ${sectionCard}`}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`text-3xl md:text-4xl font-extrabold select-none ${
                  streak > 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {streak > 0 ? "Correct!" : "Not quite"}
              </div>
              <div className={streak > 0 ? "animate-bounce" : "animate-pulse"}>
                {streak > 0 ? "🎉" : "💥"}
              </div>
              <div className="mt-2 text-gray-700">
                Score:{" "}
                <span className="font-semibold text-purple-700">{score}</span>{" "}
                • Streak:{" "}
                <span className="font-semibold text-purple-700">{streak}</span>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {selectedStimulusTypes.map((type) => {
                const userSeq = userSequences[type];
                const correctSeq = getSortedSequences()[type];
                const isTypeCorrect =
                  userSeq.length === correctSeq.length &&
                  userSeq.every((s, i) => s.id === correctSeq[i].id);
                

                return (
                  <div
                    key={type}
                    className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-semibold text-purple-700 capitalize">
                        {type} Result
                      </div>
                      <span
                        className={`text-xs rounded-full px-2 py-1 border ${
                          isTypeCorrect
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isTypeCorrect ? "Matched" : "Mismatch"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-1">Your order</div>
                    <div className="flex gap-2 flex-wrap min-h-[56px] bg-white border border-gray-200 rounded-lg p-2">
                      {userSeq.length === 0 ? (
                        <div className="text-gray-400">No input</div>
                      ) : (
                        userSeq.map((stimulus, i) => (
                          <div key={`${stimulus.id}-u-${i}`}>
                            {renderStimulus(stimulus, "small")}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mt-3 mb-1">
                      Expected
                    </div>
                    <div className="flex gap-2 flex-wrap min-h-[56px] bg-white border border-gray-200 rounded-lg p-2">
                      {correctSeq.map((stimulus, i) => (
                        <div key={`${stimulus.id}-c-${i}`}>
                          {renderStimulus(stimulus, "small")}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <button
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg active:scale-[0.99] transition-all"
                onClick={startGame}
              >
                Play Next Round
              </button>
              <button
                className="px-8 py-3 rounded-xl bg-white text-gray-800 font-semibold border border-gray-200 hover:border-purple-300 hover:shadow"
                onClick={() => setGameState("setup")}
              >
                Change Settings
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-10 bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 text-center text-gray-700 text-lg font-medium shadow-inner">
  <span className="flex items-center justify-center gap-2">
    Made with <span className="text-red-500 animate-pulse">❤️</span> by{" "}
    <span className="font-bold text-purple-700">Jay</span>
  </span>
</footer>

      {/* tiny keyframes util for present fade-in */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      
    </div>
  );
};

export default NSortGame;
