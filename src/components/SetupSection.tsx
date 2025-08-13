import { StimulusType, SortingPattern, Stimulus } from "@/data/types";
import { Settings } from "lucide-react";

 interface SetupSectionProps {
  level: number;
  setLevel: (level: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  selectedStimulusTypes: StimulusType[];
  handleStimulusTypeToggle: (type: StimulusType) => void;
  sortingPatterns: Record<StimulusType, SortingPattern>;
  handleSortingPatternChange: (type: StimulusType, pattern: SortingPattern) => void;
  startGame: () => void;
  setShowAdvanced: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setShowChangelog: (show: boolean) => void;
  sectionCard?: string;
  stimuli: Record<StimulusType, Stimulus[]>;
  availableSortingPatterns: Record<StimulusType, { key: SortingPattern; label: string }[]>;
}

export function SetupSection({
  level,
  setLevel,
  speed,
  setSpeed,
  selectedStimulusTypes,
  handleStimulusTypeToggle,
  sortingPatterns,
  handleSortingPatternChange,
  startGame,
  setShowAdvanced,
  setShowStats,
  setShowChangelog,
  sectionCard,
  stimuli,
  availableSortingPatterns,
}: SetupSectionProps) {
  return (
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

        <button
            onClick={() => setShowChangelog(true)} // <-- new state for your popup
            className="px-5 py-2.5 bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
            📝 View Changelog
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
  );
}

 
 
 
 
 