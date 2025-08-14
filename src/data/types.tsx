export type StimulusType = "colors" | "numbers" | "letters" | "shapes";
export type UserSequences = Record<StimulusType, Stimulus[]>;

export interface Stimulus {
  id: string;
  display: string;
  type: string;
  sortValue: number;
  stimulusType?: StimulusType;
}

export type SortingPattern =
  | "forward"
  | "reverse"
  | "rainbow"
  | "alphabet"
  | "reverse_alphabet";

export const stimuli: Record<StimulusType, Stimulus[]> = {
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
    { id: "10", display: "10", type: "number", sortValue: 10 },
    { id: "11", display: "11", type: "number", sortValue: 11 },
    { id: "12", display: "12", type: "number", sortValue: 12 },
    { id: "13", display: "13", type: "number", sortValue: 13 },
    { id: "14", display: "14", type: "number", sortValue: 14 },
    { id: "15", display: "15", type: "number", sortValue: 15 },
    { id: "16", display: "16", type: "number", sortValue: 16 },
    { id: "17", display: "17", type: "number", sortValue: 17 },
    { id: "18", display: "18", type: "number", sortValue: 18 },
    { id: "19", display: "19", type: "number", sortValue: 19 },
    { id: "20", display: "20", type: "number", sortValue: 20 },
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
    { id: "circle", display: "●", type: "shape", sortValue: 0 },     // 0 sides
    { id: "triangle", display: "▲", type: "shape", sortValue: 3 },   // 3 sides
    { id: "square", display: "■", type: "shape", sortValue: 4 },     // 4 sides
   // { id: "diamond", display: "♦", type: "shape", sortValue: 4 },    // 4 sides
    { id: "pentagon", display: "⬟", type: "shape", sortValue: 5 },   // 5 sides
    { id: "hexagon", display: "⬢", type: "shape", sortValue: 6 },  // 6 sides
  ],
};

export const availableSortingPatterns: Record<
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
    { key: "forward", label: "Number of Sides Ascending (●→⬢)" },
    { key: "reverse", label: "Number of Sides Descending (⬢→●)" },
  ],
};


export const rainbowOrder = ["red", "orange", "yellow", "green", "blue", "purple"];