import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loadUserSettings, saveUserSettings, UserSettings } from "@/lib/firebase";

export interface AdvancedSettingsPopupProps {
  distinction: number;
  setDistinction: (val: number) => void;
  disableAnimation: boolean;
  setDisableAnimation: (val: boolean) => void;
  autoNextRound: boolean;
  setAutoNextRound: (val: boolean) => void;
  randomizePresentation: boolean;
  setRandomizePresentation: (val: boolean) => void;
  onClose: () => void;
}

export function AdvancedSettingsPopup({
  distinction,
  setDistinction,
  disableAnimation,
  setDisableAnimation,
  autoNextRound,
  setAutoNextRound,
  randomizePresentation,
  setRandomizePresentation,
  onClose,
}: AdvancedSettingsPopupProps) {
  const { user } = useAuth();

  // --- load settings ---
  const [loading, setLoading] = useState(true);

  const [localDistinction, setLocalDistinction] = useState(distinction);
  const [localDisableAnimation, setLocalDisableAnimation] = useState(disableAnimation);
  const [localAutoNextRound, setLocalAutoNextRound] = useState(autoNextRound);
  const [localRandomizePresentation, setLocalRandomizePresentation] = useState(randomizePresentation);

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        const saved = await loadUserSettings(user.uid);
        if (saved) {
          setLocalDistinction(saved.distinction);
          setLocalDisableAnimation(saved.disableAnimation);
          setLocalAutoNextRound(saved.autoNextRound);
          setLocalRandomizePresentation(saved.randomizePresentation);
        }
      } else {
        // fallback to localStorage if not logged in
        const savedDistinction = localStorage.getItem("distinction");
        const savedDisableAnimation = localStorage.getItem("disableAnimation");
        const savedAutoNextRound = localStorage.getItem("autoNextRound");
        const savedRandomize = localStorage.getItem("randomizePresentation");

        if (savedDistinction) setLocalDistinction(Number(savedDistinction));
        if (savedDisableAnimation) setLocalDisableAnimation(savedDisableAnimation === "true");
        if (savedAutoNextRound) setLocalAutoNextRound(savedAutoNextRound === "true");
        if (savedRandomize) setLocalRandomizePresentation(savedRandomize === "true");
      }
      setLoading(false);
    }
    fetchSettings();
  }, [user]);

  const handleClose = async () => {
    // push to parent state
    setDistinction(localDistinction);
    setDisableAnimation(localDisableAnimation);
    setAutoNextRound(localAutoNextRound);
    setRandomizePresentation(localRandomizePresentation);

    if (user) {
      const newSettings: UserSettings = {
        distinction: localDistinction,
        disableAnimation: localDisableAnimation,
        autoNextRound: localAutoNextRound,
        randomizePresentation: localRandomizePresentation,
      };
      await saveUserSettings(user.uid, newSettings);
    } else {
      localStorage.setItem("distinction", localDistinction.toString());
      localStorage.setItem("disableAnimation", localDisableAnimation.toString());
      localStorage.setItem("autoNextRound", localAutoNextRound.toString());
      localStorage.setItem("randomizePresentation", localRandomizePresentation.toString());
    }

    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Advanced Settings</h2>

        {/* Distinction slider */}
        <label className="block mb-4">
          <span className="text-gray-700">Distinction: {localDistinction}%</span>
          <input
            type="range"
            min={1}
            max={100}
            value={localDistinction}
            onChange={(e) => setLocalDistinction(Number(e.target.value))}
            className="w-full mt-2"
          />
        </label>

        {/* Disable animation */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={localDisableAnimation}
            onChange={(e) => setLocalDisableAnimation(e.target.checked)}
          />
          <span className="text-gray-700">Disable stimulus fade-in animation</span>
        </label>

        {/* Auto next round */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={localAutoNextRound}
            onChange={(e) => setLocalAutoNextRound(e.target.checked)}
          />
          <span className="text-gray-700">Automatically move to next round</span>
        </label>

        {/* Randomize presentation */}
        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={localRandomizePresentation}
            onChange={(e) => setLocalRandomizePresentation(e.target.checked)}
          />
          <span className="text-gray-700">Randomize stimuli presentation order</span>
        </label>

        <div className="mt-6 text-right">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
