import React from "react";
import { StimulusType, SortingPattern, Stimulus } from "@/data/types";

interface StimulusSettingsProps {
  selectedStimulusTypes: StimulusType[];
  handleStimulusTypeToggle: (type: StimulusType) => void;
  sortingPatterns: Record<StimulusType, SortingPattern>;
  handleSortingPatternChange: (type: StimulusType, pattern: SortingPattern) => void;
  stimuli: Record<StimulusType, Stimulus[]>;
  availableSortingPatterns: Record<StimulusType, { key: string; label: string }[]>;
  onGoBack: () => void;
  onStartGame: () => void;
}

export const StimulusSettings: React.FC<StimulusSettingsProps> = ({
  selectedStimulusTypes,
  handleStimulusTypeToggle,
  sortingPatterns,
  handleSortingPatternChange,
  stimuli,
  availableSortingPatterns,
  onGoBack,
  onStartGame
}) => {
  return (
    <div className="space-y-8 pt-12"> {/* Added top padding */}
      {/* Stimulus types */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-purple-100 shadow-sm">
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
      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-purple-100 shadow-sm">
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

      {/* Navigation buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onGoBack}
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 shadow-sm"
        >
          Go Back
        </button>
        <button
          onClick={onStartGame}
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow"
        >
          Begin Game
        </button>
      </div>
    </div>
  );
};
