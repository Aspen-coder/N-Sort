"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Brain } from "lucide-react";
import { onPracticeComplete, StatsPopup } from "../data/stats";
import { Stimulus, StimulusType, UserSequences, SortingPattern, stimuli, availableSortingPatterns, rainbowOrder } from "@/data/types";
import SortingSection from "@/components/SortingSection";
import { AdvancedSettingsPopup } from "@/data/settings";
import { generateSequences, getSortedSequences } from "@/utils/sequences";
import { ChangelogPopup } from "@/data/changelog";
import "chart.js/auto";
import ResultSection from "./ResultsSection";
import { PresentingSection } from "./PresentingSection";
import { SetupSection } from "./SetupSection";

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
  return generateSequences(selectedStimulusTypes, level, distinction);
}, [selectedStimulusTypes, level, distinction]);

// Changelog helpers
const [showChangelog, setShowChangelog] = useState(false);




// stats helpers

// -- Advanced Settings Popup
const [disableAnimation, setDisableAnimation] = useState<boolean>(false);


  
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


  const lastClickRef = useRef<number>(0);
  // --- Sorting clicks ---
  const handleStimulusClick = (stimulus: Stimulus) => {
    const now = Date.now();
    if (now - lastClickRef.current < 150) return; // 150 ms delay
    lastClickRef.current = now;
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
    const sortedSequences = getSortedSequences(selectedStimulusTypes, sequencesByType, sortingPatterns);
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
    sequenceLength: maxSequenceLength,  // add this
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
                <SetupSection
                level={level}
                setLevel={setLevel}
                speed={speed}
                setSpeed={setSpeed}
                selectedStimulusTypes={selectedStimulusTypes}
                handleStimulusTypeToggle={handleStimulusTypeToggle}
                sortingPatterns={sortingPatterns}
                handleSortingPatternChange={handleSortingPatternChange}
                startGame={startGame}
                setShowAdvanced={setShowAdvanced}
                setShowStats={setShowStats}
                setShowChangelog={setShowChangelog}
                sectionCard={sectionCard}
                stimuli={stimuli}
                availableSortingPatterns={availableSortingPatterns}
            />
    )}

        {/* --- PRESENTING --- */}
        {gameState === "presenting" && (
                  <PresentingSection
                    selectedStimulusTypes={selectedStimulusTypes}
                    sequencesByType={sequencesByType}
                    currentPresentIndex={currentPresentIndex}
                    showingStimulus={showingStimulus}
                    renderStimulus={renderStimulus}
                    disableAnimation={disableAnimation}
                    maxSequenceLength={maxSequenceLength}
                    sectionCard={sectionCard} // optional
                />
            )}

        {/*--- ADVANCED SETTINGS --- */}
               {showAdvanced && (
            <AdvancedSettingsPopup
                distinction={distinction}
                setDistinction={setDistinction}
                disableAnimation={disableAnimation}
                setDisableAnimation={setDisableAnimation}
                onClose={() => setShowAdvanced(false)}
            />
            )}

        {/* --- STATISTICS --- */}
        {showStats && <StatsPopup onClose={() => setShowStats(false)} />}

        {/* --- CHANGELOG --- */}
        {showChangelog && (
            <ChangelogPopup onClose={() => setShowChangelog(false)} />
        )}

        {/* --- SORTING --- */}
        {gameState === "sorting" && (
        <SortingSection
            sectionCard={sectionCard}
            selectedStimulusTypes={selectedStimulusTypes}
            availableSortingPatterns={availableSortingPatterns}
            sortingPatterns={sortingPatterns}
            userSequences={userSequences}
            setUserSequences={setUserSequences}
            selectionHistory={selectionHistory}
            setSelectionHistory={setSelectionHistory}
            undoLastSelection={undoLastSelection}
            checkAnswers={checkAnswers}
            getCombinedPool={getCombinedPool}
            sequencesByType={sequencesByType}
            handleStimulusClick={handleStimulusClick}
            renderStimulus={renderStimulus}
        />
        )}


        {/* --- RESULT --- */}

        

        {gameState === "result" && (
          <ResultSection
            streak={streak}
            score={score}
            selectedStimulusTypes={selectedStimulusTypes}
            userSequences={userSequences}
            sequencesByType={sequencesByType}
            sortingPatterns={sortingPatterns}
            renderStimulus={renderStimulus}
            startGame={startGame}
            setGameState={setGameState} 
            sectionCard={sectionCard}
        />
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
