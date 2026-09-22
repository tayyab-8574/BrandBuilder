import React from "react";
import { GeneratedMediumResult } from "../types";
import { X, Download, Copy, Check, EyeOff, Cpu, Maximize2 } from "lucide-react";

interface ImageModalProps {
  item: GeneratedMediumResult | null;
  onClose: () => void;
  productName: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  item,
  onClose,
  productName,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.promptUsed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    link.download = `${productName.toLowerCase().replace(/\s+/g, "-")}-${item.medium}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 capitalize">
                {item.medium.replace("_", " ")} Medium
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                Nano-Banana
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {productName} &bull; Aspect Ratio {item.aspectRatio}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 bg-stone-950/95 overflow-auto flex items-center justify-center p-4 relative min-h-[360px]">
          <img
            src={item.imageUrl}
            alt={item.medium}
            referrerPolicy="no-referrer"
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
          />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5" />
              Zero People Verified
            </span>
          </div>
        </div>

        {/* Footer Prompt Details */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-600">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              Nano-Banana Prompt &amp; Conditioning:
            </span>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
          <p className="text-stone-500 line-clamp-3 bg-white p-2.5 rounded-lg border border-stone-200 font-mono text-[11px]">
            {item.promptUsed}
          </p>
        </div>
      </div>
    </div>
  );
};
