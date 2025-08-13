import React from "react";
import type { Stimulus, UserSequences, StimulusType} from "@/data/types";

interface SortingSectionProps {
  sectionCard: string;
  selectedStimulusTypes: StimulusType[];
  availableSortingPatterns: Record<string, { key: string; label: string }[]>;
  sortingPatterns: Record<string, string>;
  userSequences: UserSequences;
  setUserSequences: React.Dispatch<
    React.SetStateAction<UserSequences>
  >;
  selectionHistory: { type: StimulusType; stimulus: Stimulus }[];
  setSelectionHistory: React.Dispatch<
    React.SetStateAction<{ type: StimulusType; stimulus: Stimulus }[]>
  >;
  undoLastSelection: () => void;
  checkAnswers: () => void;
  getCombinedPool: () => Stimulus[];
  sequencesByType: Record<string, Stimulus[]>;
  handleStimulusClick: (stimulus: Stimulus) => void;
  renderStimulus: (stimulus: Stimulus, size: "large" | "small", extraClass?: string) => React.JSX.Element;
}

const SortingSection: React.FC<SortingSectionProps> = ({
  sectionCard,
  selectedStimulusTypes,
  availableSortingPatterns,
  sortingPatterns,
  userSequences,
  setUserSequences,
  selectionHistory,
  setSelectionHistory,
  undoLastSelection,
  checkAnswers,
  getCombinedPool,
  sequencesByType,
  handleStimulusClick,
  renderStimulus,
}) => {
  return (
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
            const disabled = false; // Adjust if you want tile limit logic

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
  );
};

export default SortingSection;
