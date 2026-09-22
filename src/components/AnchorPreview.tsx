import React from "react";
import { Sparkles, RefreshCw, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AnchorPreviewProps {
  anchorImageUrl?: string;
  productName: string;
  isGenerating: boolean;
  onRegenerate: () => void;
  onClear: () => void;
}

export const AnchorPreview: React.FC<AnchorPreviewProps> = ({
  anchorImageUrl,
  productName,
  isGenerating,
  onRegenerate,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-base font-semibold text-stone-900">
              Master Product Anchor
            </h3>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
            Source of Truth
          </span>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          All medium shots (billboards, newspapers, social posts) are conditioned on this anchor image to maintain 100% product design consistency.
        </p>
      </div>

      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center group my-2">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Synthesizing Hero Shot...
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Nano-Banana model is rendering studio photography with zero humans
              </p>
            </div>
          </div>
        ) : anchorImageUrl ? (
          <>
            <img
              src={anchorImageUrl}
              alt={productName || "Product Anchor"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
              <button
                type="button"
                onClick={onRegenerate}
                className="px-3 py-1.5 rounded-lg bg-white/95 text-stone-900 text-xs font-semibold shadow-md hover:bg-white flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-roll Anchor
              </button>
              <button
                type="button"
                onClick={onClear}
                className="px-3 py-1.5 rounded-lg bg-stone-900/90 text-stone-100 text-xs font-medium hover:bg-stone-900 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Anchor Active
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                <EyeOff className="w-3 h-3 text-amber-400" />
                No Humans
              </span>
            </div>
          </>
        ) : (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-200/80 flex items-center justify-center mx-auto text-stone-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-800">
              No anchor generated yet
            </p>
            <p className="text-xs text-stone-400 max-w-[200px] mx-auto">
              Click &quot;Generate Product Anchor Shot&quot; to establish the visual reference for all shots.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Model: gemini-3.1-flash-lite-image
        </span>
        <span>Aspect: 1:1</span>
      </div>
    </div>
  );
};
