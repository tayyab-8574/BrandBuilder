import React, { useState } from "react";
import { GeneratedMediumResult, MediumType } from "../types";
import { ImageModal } from "./ImageModal";
import {
  Maximize2,
  Download,
  RefreshCw,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

interface CampaignGalleryProps {
  results: Record<string, GeneratedMediumResult>;
  productName: string;
  isGenerating: boolean;
  activeMedium?: string;
  onRegenerateMedium: (medium: MediumType) => void;
  anchorImageUrl?: string;
}

export const CampaignGallery: React.FC<CampaignGalleryProps> = ({
  results,
  productName,
  isGenerating,
  activeMedium,
  onRegenerateMedium,
  anchorImageUrl,
}) => {
  const [selectedItem, setSelectedItem] = useState<GeneratedMediumResult | null>(null);

  const resultsList = Object.values(results);

  const handleDownload = (item: GeneratedMediumResult) => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    link.download = `${productName.toLowerCase().replace(/\s+/g, "-")}-${item.medium}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-stone-900">
              3. Campaign Imagined Across Mediums
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Consistent product placement without people &bull; Powered by Nano-Banana
          </p>
        </div>

        {resultsList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">
              {resultsList.length} medium shots rendered
            </span>
          </div>
        )}
      </div>

      {resultsList.length === 0 ? (
        <div className="py-16 px-4 text-center border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">
            No Campaign Shots Generated Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Define your product above and click &quot;Imagine Across Selected Mediums&quot; to synthesize consistent billboard, newspaper, and social post visuals.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Consistency banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong>Product Consistency Enforced:</strong> Each shot replicates the design, materials, and colors from your anchor reference without human subjects.
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-800">
              <EyeOff className="w-3.5 h-3.5" />
              0 Humans Detected
            </span>
          </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultsList.map((item) => {
              const isItemGenerating = isGenerating && activeMedium === item.medium;

              return (
                <div
                  key={item.medium}
                  className="group bg-stone-50/70 border border-stone-200 rounded-xl overflow-hidden flex flex-col hover:border-amber-300 hover:shadow-md transition-all"
                >
                  {/* Top Bar */}
                  <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      {item.medium.replace("_", " ")}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {item.aspectRatio}
                    </span>
                  </div>

                  {/* Image Canvas */}
                  <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden flex items-center justify-center">
                    {isItemGenerating ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mb-2" />
                        <span className="text-xs font-medium text-stone-700">
                          Re-synthesizing {item.medium}...
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.medium}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="p-2 rounded-lg bg-white/95 text-stone-900 shadow hover:bg-white transition-transform hover:scale-105"
                            title="Expand view"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(item)}
                            className="p-2 rounded-lg bg-white/95 text-stone-900 shadow hover:bg-white transition-transform hover:scale-105"
                            title="Download shot"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isGenerating}
                            onClick={() => onRegenerateMedium(item.medium)}
                            className="p-2 rounded-lg bg-amber-500 text-stone-950 shadow hover:bg-amber-400 transition-transform hover:scale-105"
                            title="Re-generate this medium shot"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Zero Humans pill */}
                        <div className="absolute bottom-2 left-2 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            No People
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Caption & Actions */}
                  <div className="p-3 bg-white flex items-center justify-between text-xs text-stone-500">
                    <span className="truncate max-w-[180px]">
                      {productName}
                    </span>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => onRegenerateMedium(item.medium)}
                      className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1"
                    >
                      Re-roll
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        productName={productName}
      />
    </div>
  );
};
