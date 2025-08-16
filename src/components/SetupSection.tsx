import { StimulusType, SortingPattern, Stimulus } from "@/data/types";
import { Settings } from "lucide-react";
import { Card, CardProps } from "@/utils/card";
import { useRouter } from "next/navigation";



 


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
   const router = useRouter();
 const cards: CardProps[] = [
  {
      title: "Statistics",
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
      // textColor: "text-purple-700 group-hover:text-purple-800",
      onClick: () => setShowStats(true),
      color: ""
  },
  {
      title: "Leaderboard",
      icon: "🏆",
      gradient: "from-pink-500 to-rose-500",
      // textColor: "text-pink-700 group-hover:text-pink-800",
      onClick: () => router.push("/leaderboard"),
      color: ""
  },
  {
      title: "Tutorial",
      icon: "🎓",
      gradient: "from-blue-500 to-cyan-500",
      //textColor: "text-blue-700 group-hover:text-blue-800",
      onClick: () => console.log("Open Tutorial"),
      color: ""
  },
];



  return (
    <section className={`mt-6 p-6 ${sectionCard}`}>
       <div className="flex items-center justify-between mb-6">
        {/* Left: Game Settings */}
        <h2 className="flex items-center text-2xl md:text-3xl font-semibold text-purple-700">
            <Settings className="w-7 h-7 mr-3" />
            Game Settings
        </h2>

        {/* Right: Buttons */}
        <div className="flex gap-3">
            <button
            onClick={() => setShowAdvanced(true)}
            className="px-5 py-2.5 bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
            ⚙️ Advanced Settings
            </button>

           {/* <button
            onClick={() => setShowChangelog(true)}
            className="px-5 py-2.5 bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
            📝 View Changelog
            </button> */ }
        </div>
        </div>

        

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
        
        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map((card) => (
                <Card
                key={card.title}
                title={card.title}
                icon={card.icon}
                gradient={card.gradient}
                onClick={card.onClick}
                color={card.color}
                />
            ))}
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

 
 
 
 
 