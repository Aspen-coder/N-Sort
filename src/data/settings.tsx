import React, { useState } from "react";

export interface AdvancedSettingsPopupProps {
  distinction: number;
  setDistinction: (val: number) => void;
  disableAnimation: boolean;
  setDisableAnimation: (val: boolean) => void;
  autoNextRound : boolean;
  setAutoNextRound : (val : boolean) => void;
  onClose: () => void;
}


export function AdvancedSettingsPopup({
  distinction,
  setDistinction,
  disableAnimation,
  setDisableAnimation,
  autoNextRound,
  setAutoNextRound,
  onClose,
}: AdvancedSettingsPopupProps) {
  // Load saved values from localStorage first, fallback to global variables
  const savedDistinction = localStorage.getItem("distinction");
  const savedDisableAnimation = localStorage.getItem("disableAnimation");
  const savedAutoNextRound = localStorage.getItem("autoNextRound");

  const [localDistinction, setLocalDistinction] = useState(
    savedDistinction !== null ? Number(savedDistinction) : distinction
  );

  const [localDisableAnimation, setLocalDisableAnimation] = useState(
    savedDisableAnimation !== null ? savedDisableAnimation === "true" : disableAnimation
  );

  const [localAutoNextRound, setLocalAutoNextRound] = useState(
    savedAutoNextRound !== null ? savedAutoNextRound === "true" : autoNextRound
  );

  // Commit changes when closing
  const handleClose = () => {
    setDistinction(localDistinction); // update global
    setDisableAnimation(localDisableAnimation); // update global
    setAutoNextRound(localAutoNextRound); // update global
    localStorage.setItem("distinction", localDistinction.toString());
    localStorage.setItem("disableAnimation", localDisableAnimation.toString());
    localStorage.setItem("autoNextRound", localAutoNextRound.toString());
    onClose();
  };

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

        {/* Disable animation checkbox */}
        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={localDisableAnimation}
            onChange={(e) => setLocalDisableAnimation(e.target.checked)}
          />
          <span className="text-gray-700">Disable stimulus fade-in animation</span>
        </label>
        {/* Go to next round check box */}
        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={localAutoNextRound}
            onChange={(e) => setLocalAutoNextRound(e.target.checked)}
          />
          <span className="text-gray-700">Automatically move to next round(reload page to stop)</span>
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