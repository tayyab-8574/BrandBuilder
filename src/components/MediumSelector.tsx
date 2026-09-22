import React from "react";
import { AVAILABLE_MEDIUMS } from "../data/presets";
import { MediumType } from "../types";
import {
  Monitor,
  Newspaper,
  Share2,
  Train,
  BookOpen,
  Store,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
  EyeOff,
} from "lucide-react";

interface MediumSelectorProps {
  selectedMediums: MediumType[];
  onToggleMedium: (medium: MediumType) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  environmentMood: string;
  onEnvironmentMoodChange: (mood: string) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
  hasAnchor: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  billboard: <Monitor className="w-5 h-5" />,
  newspaper: <Newspaper className="w-5 h-5" />,
  social_post: <Share2 className="w-5 h-5" />,
  transit_poster: <Train className="w-5 h-5" />,
  magazine_spread: <BookOpen className="w-5 h-5" />,
  storefront: <Store className="w-5 h-5" />,
};

export const MediumSelector: React.FC<MediumSelectorProps> = ({
  selectedMediums,
  onToggleMedium,
  onSelectAll,
  onDeselectAll,
  environmentMood,
  onEnvironmentMoodChange,
  onGenerateAll,
  isGenerating,
  hasAnchor,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-stone-900">
              2. Select Advertising Mediums
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Choose where to imagine the consistent product (no people in any shot)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1 rounded-lg text-stone-600 bg-stone-100 hover:bg-stone-200 font-medium transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={onDeselectAll}
            className="px-2.5 py-1 rounded-lg text-stone-500 hover:text-stone-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid of Mediums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {AVAILABLE_MEDIUMS.map((medium) => {
          const isSelected = selectedMediums.includes(medium.id);
          return (
            <div
              key={medium.id}
              onClick={() => onToggleMedium(medium.id)}
              className={`relative cursor-pointer p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-amber-50/40 border-amber-400 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-amber-500 text-stone-950"
                      : "bg-white text-stone-600 border border-stone-200"
                  }`}
                >
                  {ICONS[medium.id] || <Monitor className="w-5 h-5" />}
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-amber-500 border-amber-600 text-stone-950"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {medium.title}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-600">
                    {medium.defaultAspectRatio}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {medium.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Environment lighting & mood customization */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Environment Mood &amp; Lighting (Optional)
            </label>
            <input
              type="text"
              value={environmentMood}
              onChange={(e) => onEnvironmentMoodChange(e.target.value)}
              placeholder="e.g. Cinematic golden hour twilight with modern architectural spotlights"
              className="w-full px-3.5 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col items-end justify-center self-end sm:self-auto">
            <button
              type="button"
              disabled={isGenerating || selectedMediums.length === 0}
              onClick={onGenerateAll}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-950 hover:bg-stone-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing Mediums with Nano-Banana...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Imagine Across {selectedMediums.length} Medium{selectedMediums.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </button>
            <span className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
              <EyeOff className="w-3 h-3 text-emerald-600" />
              {hasAnchor ? "Using Anchor for 100% consistency" : "Anchor will be created on the fly"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
