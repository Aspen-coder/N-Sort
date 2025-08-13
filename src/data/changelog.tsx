export interface ChangelogPopupProps {
  onClose: () => void;
}

export function ChangelogPopup({ onClose }: ChangelogPopupProps) {
  const updates = [
    {
      version: "v1",
      description: "Initial version of app launched",
    },
    {
      version: "v1.1",
      description:
        "Multiple stimuli now supported. UI updated to be more stylish. Animations included. Footer size increased so my beautiful name is shown more",
    },
    {
      version: "v1.2",
      description:
        "Advanced settings button added. Advanced settings contains distinction slider as per user Dominic's request. Distinction functions like interference for N-back or scrambling factor for RRT, it increases the chance of distinct stimuli appearing, forcing you to track more. A stats tracker was added that tracks stimuli answered / sec. Stats saves locally. Lowered minimum time on slider as per Tim's Request.",
    },
    {
      version: "v1.3",
      description:
        "Settings now save locally also, so you don't have to constantly change them whenever you open the app. Don't erase your cookies tho :). Also added a disable animation feature to advanced settings as per user Tim's request and lowered overall animation times from 0.3 -> 0.1 seconds.",
    },

    {
        version: "v1.4",
        description:
        "Changelog added :D, Also fixed shape sort so you can now sort based on number of sides per shape as per user Icybanny's request"
    },
    {
        version: "v1.5",
        description:
        "Optimization and refactoring changes. Dropped build speed from 12.1s to 2.9s and cut file size by almost half for main code"
    },
    {
        version: "v1.6",
        description: "Further refactoring for readability. Main code file is now 445 lines long, far cry from max 1.5k. "
    },
    {
      version: "v1.7",
      description: "Added vercel analytics"
      
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-purple-700">Changelog</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {updates.map((u) => (
            <div key={u.version} className="border-b border-gray-200 pb-2">
              <h3 className="font-semibold text-purple-600">{u.version}</h3>
              <p className="text-gray-700 text-sm">{u.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-right">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}