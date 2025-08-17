import React, { useEffect, useRef } from "react";
import { StimulusType, Stimulus, SortingPattern } from "@/data/types";
import { getSortedSequences } from "@/utils/sequences";

interface ResultSectionProps {
  streak: number;
  score: number;
  selectedStimulusTypes: StimulusType[];
  userSequences: Record<StimulusType, Stimulus[]>;
  sequencesByType: Record<StimulusType, Stimulus[]>;
  sortingPatterns: Record<StimulusType, SortingPattern>;
  startGame: () => void;
  restartGame: () => void;
  autoNextRound: boolean;
  setGameState: React.Dispatch<React.SetStateAction<"setup" | "stimulusSelection" | "presenting" | "sorting" | "result">>;
  sectionCard: string;
  renderStimulus:  (stimulus: Stimulus, size: "small" | "large", extra?: string) => React.JSX.Element;
}

export default function ResultSection({
  streak,
  score,
  selectedStimulusTypes,
  userSequences,
  sequencesByType,
  sortingPatterns,
  renderStimulus,
  startGame,
  restartGame,
  autoNextRound,
  setGameState,
  sectionCard,
}: ResultSectionProps) {
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if(autoNextRound){
      console.log("IN RESULTS", selectedStimulusTypes);
      timerRef.current = window.setTimeout(() => {restartGame();}, 200);
    }
    return () => {
      clearTimeout(timerRef.current);
    }
  }, [autoNextRound, restartGame]

  );
  return (
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
                    const correctSeq = getSortedSequences(selectedStimulusTypes, sequencesByType, sortingPatterns)[type];
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
  );
}
