import { Stimulus, StimulusType } from "@/data/types";
import React, { useMemo } from "react";

interface PresentingSectionProps {
  selectedStimulusTypes: StimulusType[];
  sequencesByType: Record<StimulusType, Stimulus[]>;
  currentPresentIndex: number;
  showingStimulus: boolean;
  disableAnimation: boolean;
  maxSequenceLength: number;
  sectionCard: string;
  randomizePresentation?: boolean; // ✅ new prop
  renderStimulus: (
    stimulus: Stimulus,
    size: "large" | "small",
    extra?: string
  ) => React.JSX.Element;
}

export function PresentingSection({
  selectedStimulusTypes,
  sequencesByType,
  currentPresentIndex,
  showingStimulus,
  disableAnimation,
  maxSequenceLength,
  renderStimulus,
  sectionCard,
  randomizePresentation = true, // ✅ default true
}: PresentingSectionProps) {
  // shuffle helper (Fisher–Yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // ✅ If randomizePresentation is true, create a shuffled order

  const priority: Record<StimulusType, number> = {
    colors: 0,
    numbers: 1,
    letters: 2,
    shapes: 3,
  }

  const displayStimulusTypes = useMemo(() => {
    if(randomizePresentation){
      return shuffleArray(selectedStimulusTypes);
    }
    return [...selectedStimulusTypes].sort(
      (a,b) => priority[a] - priority[b]
    );
  }, [selectedStimulusTypes, randomizePresentation, currentPresentIndex]);

  return (
    <section className={`mt-8 p-6 ${sectionCard}`}>
      <div className="text-gray-700 text-lg font-semibold select-none text-center">
        Memorize the sequence
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {displayStimulusTypes.map((type) => {
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
                      ? "opacity-100 scale-100 transition-none"
                      : "transition-all duration-100 ease-out scale-95 opacity-0 animate-[fadeIn_0.1s_ease-out_forwards]"
                  }`}
                  key={`${type}-${currentPresentIndex}-${stim.id}-${disableAnimation ? "noanim" : "anim"}`}
                >
                  {renderStimulus(stim, "large", "shadow-md ring-1 ring-purple-500/20")}
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-dashed border-purple-200 bg-white/70" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        Showing item {Math.min(currentPresentIndex + 1, maxSequenceLength)} of {maxSequenceLength}
      </div>
    </section>
  );
}
