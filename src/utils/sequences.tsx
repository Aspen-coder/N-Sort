// utils/sequences.ts
import { Stimulus, StimulusType, stimuli, SortingPattern, rainbowOrder } from "@/data/types";

export const generateSequences = (
  selectedStimulusTypes: StimulusType[],
  level: number,
  distinction: number
): Record<StimulusType, Stimulus[]> => {
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
      let candidate: Stimulus;
      if (Math.random() < distinction / 100) {
        const unused = pool.filter((s) => !seq.some((x) => x.id === s.id));
        candidate =
          unused.length > 0
            ? unused[Math.floor(Math.random() * unused.length)]
            : pool[Math.floor(Math.random() * pool.length)];
      } else {
        candidate = pool[Math.floor(Math.random() * pool.length)];
      }
      seq.push({ ...candidate, stimulusType: type });
    }

    newSequences[type] = seq;
  });

  return newSequences;
};


export const sortSequenceByPattern = (
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

  export const getSortedSequences = (
  selectedStimulusTypes: StimulusType[],
  sequencesByType: Record<StimulusType, Stimulus[]>,
  sortingPatterns: Record<StimulusType, SortingPattern>
):  Record<StimulusType, Stimulus[]> => {
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
  