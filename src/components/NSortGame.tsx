"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, Settings, Trophy, Brain } from "lucide-react";

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
    { id: "9", display: "9", type: "number", sortValue: 9 }
  ],
  letters: [
    { id: "A", display: "A", type: "letter", sortValue: 1 },
    { id: "B", display: "B", type: "letter", sortValue: 2 },
    { id: "C", display: "C", type: "letter", sortValue: 3 },
    { id: "D", display: "D", type: "letter", sortValue: 4 },
    { id: "E", display: "E", type: "letter", sortValue: 5 },
    { id: "F", display: "F", type: "letter", sortValue: 6 },
    { id: "G", display: "G", type: "letter", sortValue: 7 },
    { id: "H", display: "H", type: "letter", sortValue: 8 }
  ],
  shapes: [
    { id: "circle", display: "●", type: "shape", sortValue: 1 },
    { id: "square", display: "■", type: "shape", sortValue: 2 },
    { id: "triangle", display: "▲", type: "shape", sortValue: 3 },
    { id: "diamond", display: "♦", type: "shape", sortValue: 4 },
    { id: "star", display: "★", type: "shape", sortValue: 5 },
    { id: "heart", display: "♥", type: "shape", sortValue: 6 },
    { id: "club", display: "♣", type: "shape", sortValue: 7 },
    { id: "spade", display: "♠", type: "shape", sortValue: 8 }
  ]
};

const availableSortingPatterns: Record<
  StimulusType,
  { key: SortingPattern; label: string }[]
> = {
  colors: [
    { key: "forward", label: "Forward (1→8)" },
    { key: "reverse", label: "Reverse (8→1)" },
    { key: "rainbow", label: "Rainbow (ROYGBIV)" }
  ],
  numbers: [
    { key: "forward", label: "Forward (1→9)" },
    { key: "reverse", label: "Reverse (9→1)" },
    { key: "alphabet", label: "Alphabetical" },
    { key: "reverse_alphabet", label: "Reverse Alphabetical" }
  ],
  letters: [
    { key: "forward", label: "Forward (A→H)" },
    { key: "reverse", label: "Reverse (H→A)" },
    { key: "alphabet", label: "Alphabetical" },
    { key: "reverse_alphabet", label: "Reverse Alphabetical" }
  ],
  shapes: [
    { key: "forward", label: "Forward (●→♠)" },
    { key: "reverse", label: "Reverse (♠→●)" },
    { key: "alphabet", label: "Alphabetical" },
    { key: "reverse_alphabet", label: "Reverse Alphabetical" }
  ]
};

const rainbowOrder = ["red", "orange", "yellow", "green", "blue", "purple"];

const NSortGame: React.FC = () => {
  const [gameState, setGameState] = useState<
    "setup" | "presenting" | "sorting" | "result"
  >("setup");
  const [level, setLevel] = useState(3);
  const [selectedStimulusTypes, setSelectedStimulusTypes] = useState<
    StimulusType[]
  >(["colors"]);
  const [sortingPatterns, setSortingPatterns] = useState<
    Record<StimulusType, SortingPattern>
  >({
    colors: "forward",
    numbers: "forward",
    letters: "forward",
    shapes: "forward"
  });
  const [speed, setSpeed] = useState(2.5);
  const [sequence, setSequence] = useState<Stimulus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<Stimulus[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showingStimulus, setShowingStimulus] = useState(false);

  // Generate sequence with only selected stimulus types
  const generateSequence = useCallback(() => {
    const newSequence: Stimulus[] = [];
    for (let i = 0; i < level; i++) {
      const randomStimulusType =
        selectedStimulusTypes[
          Math.floor(Math.random() * selectedStimulusTypes.length)
        ];
      const availableStimuli = stimuli[randomStimulusType];
      const randomStimulus =
        availableStimuli[Math.floor(Math.random() * availableStimuli.length)];
      newSequence.push({ ...randomStimulus, stimulusType: randomStimulusType });
    }
    return newSequence;
  }, [level, selectedStimulusTypes]);

  // Sort sequence: ALL possible stimuli of each type must be sorted and shown for answer checking
  const getSortedSequence = (seq: Stimulus[]) => {
    const groupedByType: Record<StimulusType, Stimulus[]> = {
        colors: [],
        numbers: [],
        letters: [],
        shapes: [],
    };

    seq.forEach((stimulus) => {
        groupedByType[stimulus.stimulusType!].push(stimulus);
    });

    const sortedGroups: Record<StimulusType, Stimulus[]> = {
        colors: [],
        numbers: [],
        letters: [],
        shapes: [],
    };

    Object.keys(groupedByType).forEach((type) => {
        const t = type as StimulusType;
        const pattern = sortingPatterns[t]; // pattern per type
        const group = [...groupedByType[t]];

        // Apply sorting based on the pattern of that type
        switch (pattern) {
        case "forward":
            sortedGroups[t] = group.sort((a, b) => a.sortValue - b.sortValue);
            break;
        case "reverse":
            sortedGroups[t] = group.sort((a, b) => b.sortValue - a.sortValue);
            break;
        case "rainbow":
            if (t === "colors") {
            sortedGroups[t] = group.sort(
                (a, b) => rainbowOrder.indexOf(a.id) - rainbowOrder.indexOf(b.id)
            );
            } else {
            sortedGroups[t] = group.sort((a, b) => a.sortValue - b.sortValue);
            }
            break;
        case "alphabet":
            sortedGroups[t] = group.sort((a, b) => a.id.localeCompare(b.id));
            break;
        case "reverse_alphabet":
            sortedGroups[t] = group.sort((a, b) => b.id.localeCompare(a.id));
            break;
        default:
            sortedGroups[t] = group.sort((a, b) => a.sortValue - b.sortValue);
        }
    });

    // Merge all sorted groups in the order the user selected stimulus types
    const result: Stimulus[] = [];
    selectedStimulusTypes.forEach((type) => {
        if (sortedGroups[type]) {
        result.push(...sortedGroups[type]);
        }
    });

    return result;
};

  // Start the game
  const startGame = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setUserSequence([]);
    setCurrentIndex(0);
    setGameState("presenting");
    setShowingStimulus(false);
  };

  // Presentation effect to show stimuli one by one
  useEffect(() => {
    if (gameState === "presenting") {
      if (currentIndex < sequence.length) {
        setShowingStimulus(true);
        const timer = setTimeout(() => {
          setShowingStimulus(false);
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
          }, 300);
        }, speed * 1000);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => {
          setGameState("sorting");
        }, 500);
      }
    }
  }, [gameState, currentIndex, sequence.length, speed]);

  // Stimulus type toggle
  const handleStimulusTypeToggle = (type: StimulusType) => {
    const newSelected = selectedStimulusTypes.includes(type)
      ? selectedStimulusTypes.filter((t) => t !== type)
      : [...selectedStimulusTypes, type];

    if (newSelected.length === 0) return;

    setSelectedStimulusTypes(newSelected);

    // Update sortingPatterns to include all selected, default to 'forward'
    const newSortingPatterns: Record<StimulusType, SortingPattern> = {
    colors: newSelected.includes("colors") ? (sortingPatterns.colors || "forward") : "forward",
    numbers: newSelected.includes("numbers") ? (sortingPatterns.numbers || "forward") : "forward",
    letters: newSelected.includes("letters") ? (sortingPatterns.letters || "alphabet") : "alphabet",
    shapes: newSelected.includes("shapes") ? (sortingPatterns.shapes || "forward") : "forward",
    };

    newSelected.forEach((t) => {
      newSortingPatterns[t] = sortingPatterns[t] || "forward";
    });
    setSortingPatterns(newSortingPatterns);
  };

  // Sorting pattern change for a type
  const handleSortingPatternChange = (
    type: StimulusType,
    pattern: SortingPattern
  ) => {
    setSortingPatterns((prev) => ({
      ...prev,
      [type]: pattern
    }));
  };

  // When user clicks stimulus to build their sequence
  const handleStimulusClick = (stimulus: Stimulus) => {
    if (gameState !== "sorting") return;

    /*if (
      userSequence.find(
        (s) => s.id === stimulus.id && s.stimulusType === stimulus.stimulusType
      )
    )
      return; */ // sometims stimulus can repeat, I dont want to disable them just because of that xD

    const newUserSequence = [...userSequence, stimulus];
    setUserSequence(newUserSequence);

    if (newUserSequence.length === sequence.length) {
      const correctSequence = getSortedSequence(sequence);
      const isCorrect = newUserSequence.every(
        (s, index) =>
          s.id === correctSequence[index].id &&
          s.stimulusType === correctSequence[index].stimulusType
      );

      if (isCorrect) {
        setScore((prev) => prev + level * 10);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      setGameState("result");
      setTimeout(() => {
        setGameState("setup");
      }, 3000);
    }
  };

  // Remove last stimulus from user sequence
  const removeLastStimulus = () => {
    setUserSequence((prev) => prev.slice(0, -1));
  };

  // Render stimulus block
  const renderStimulus = (stimulus: Stimulus, size: "large" | "small" = "large") => {
    const sizeClass =
      size === "large" ? "w-20 h-20 text-5xl" : "w-12 h-12 text-xl";

    if (stimulus.type === "color") {
      return (
        <div
          className={`${sizeClass} rounded-lg border-2 border-gray-300 shadow-md`}
          style={{ backgroundColor: stimulus.display }}
          aria-label={stimulus.id}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center font-bold text-gray-800 select-none cursor-pointer hover:scale-105 transition-transform`}
        aria-label={stimulus.id}
      >
        {stimulus.display}
      </div>
    );
  };

  // For feedback emojis
  const renderResultEmoji = () => {
    if (gameState !== "result") return null;
    if (streak > 0) {
      return (
        <div className="text-6xl animate-bounce select-none" aria-label="success">
          🎉
        </div>
      );
    }
    return (
      <div className="text-6xl animate-shake select-none" aria-label="failure">
        💥
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center gap-3 text-purple-700">
          <Brain className="w-8 h-8" />
          <h1 className="text-4xl font-extrabold select-none">N-Sort Challenge</h1>
        </header>

        {/* Score & Streak */}
        <div className="flex justify-between items-center text-gray-700 font-semibold text-lg select-none">
          <div>Score: <span className="text-purple-600">{score}</span></div>
          <div>Streak: <span className="text-purple-600">{streak}</span></div>
        </div>

        {/* Setup screen */}
        {gameState === "setup" && (
          <section className="space-y-8">
            {/* Settings Panel */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="flex items-center text-3xl font-semibold mb-6 text-purple-700">
                <Settings className="w-7 h-7 mr-3" />
                Game Settings
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Level Slider */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Level (N = {level})
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {level} stimuli to remember
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Presentation Speed (seconds)
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={3.5}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {speed.toFixed(1)} seconds per stimulus
                  </div>
                </div>
              </div>

              {/* Stimulus Types */}
              <div className="mt-8">
                <label className="block text-gray-700 font-medium mb-3">
                  Stimulus Types
                </label>
                <div className="flex flex-wrap gap-6">
                  {Object.keys(stimuli).map((type) => (
                    <label
                      key={type}
                      className="inline-flex items-center cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStimulusTypes.includes(type as StimulusType)}
                        onChange={() =>
                          handleStimulusTypeToggle(type as StimulusType)
                        }
                        className="form-checkbox h-5 w-5 text-purple-600 rounded"
                      />
                      <span className="ml-2 capitalize text-gray-800 font-semibold">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting Patterns */}
              <div className="mt-8 grid gap-6">
                {selectedStimulusTypes.map((type) => (
                  <div key={type}>
                    <label
                      htmlFor={`sorting-${type}`}
                     className="block text-gray-700 font-medium mb-2 capitalize"
                    >
                      Sorting Pattern for {type}
                    </label>
                    <select
                      id={`sorting-${type}`}
                      value={sortingPatterns[type]}
                      onChange={(e) =>
                        handleSortingPatternChange(type, e.target.value as SortingPattern)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              {/* Start Button */}
              <div className="mt-10 flex justify-center">
                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
                  aria-label="Start Game"
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Presenting state */}
        {gameState === "presenting" && (
          <section className="flex flex-col items-center gap-6">
            <div className="text-xl font-semibold text-purple-700 select-none">
              Memorize the sequence
            </div>
            <div className="flex gap-6 flex-wrap justify-center">
              {showingStimulus && sequence[currentIndex]
                ? renderStimulus(sequence[currentIndex])
                : (
                  <div className="w-20 h-20 rounded-lg border-4 border-dashed border-purple-300 animate-pulse" />
                )}
            </div>
            <div className="text-gray-600 select-none">Stimulus {currentIndex + 1} / {sequence.length}</div>
          </section>
        )}

        {/* Sorting state */}
        {gameState === "sorting" && (
          <section className="flex flex-col items-center gap-6">
            <div className="text-xl font-semibold text-purple-700 select-none mb-2">
              Sort the stimuli in the correct order
            </div>

            {/* Display all possible stimuli for selected types to pick : AVAILABLE STIMULI */}
            <div className="flex flex-wrap gap-4 justify-center max-w-4xl">
                     {selectedStimulusTypes.map((type) => {
    // Show all stimuli of this type, always
                        return stimuli[type].map((stimulus) => {
                        const stimulusCountInSequence = sequence.filter(
                            (s) => s.id === stimulus.id && s.stimulusType === type
                        ).length;

                        const stimulusCountUserSelected = userSequence.filter(
                            (s) => s.id === stimulus.id && s.stimulusType === type
                        ).length;

                        // Disable if user has already selected as many times as it appears in the sequence
                        const isSelected = false; //stimulusCountUserSelected >= stimulusCountInSequence;

                        return (
                            <button
                            key={`${type}-${stimulus.id}`}
                            onClick={() => handleStimulusClick({ ...stimulus, stimulusType: type })}
                            disabled={isSelected}
                            className={`flex justify-center transition-all ${
                                isSelected
                                ? "opacity-50 cursor-not-allowed transform scale-90"
                                : "hover:scale-105 cursor-pointer"
                            }`}
                            >
                            {renderStimulus(stimulus, "small")}
                            </button>
                        );
                        });
                    }).flat()}
            </div>

            {/* User sequence display */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {userSequence.length > 0 ? (
                userSequence.map((stimulus, i) => (
                  <div
                    key={`${stimulus.stimulusType}-${stimulus.id}-${i}`}
                    className="relative"
                  >
                    {renderStimulus(stimulus, "small")}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 select-none">Your sequence will appear here</div>
              )}
            </div>

            {/* Undo Button */}
            <button
              onClick={removeLastStimulus}
              disabled={userSequence.length === 0}
              className="mt-6 bg-red-500 disabled:bg-red-300 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
              aria-label="Remove last stimulus"
            >
              Undo Last Selection
            </button>
          </section>
        )}

        {/* Result state */}
        {gameState === "result" && (
          <section className="flex flex-col items-center gap-4">
            {renderResultEmoji()}
            <div
              className={`text-2xl font-bold select-none ${
                streak > 0 ? "text-green-600" : "text-red-600"
              }`}
              aria-live="polite"
            >
              {streak > 0
                ? `Correct! Current Streak: ${streak}`
                : "Incorrect! Try again!"}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 select-none">
          <p>
            N-Sort Challenge &mdash; Train your working memory &bull; Created with
            ❤️ by Jay
          </p>
        </footer>
      </div>
    </div>
  );
};

export default NSortGame;
