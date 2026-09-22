import React, { useRef } from "react";
import { ProductProfile } from "../types";
import { SAMPLE_PRODUCTS } from "../data/presets";
import { Sparkles, Upload, RefreshCw, Layers, Palette, Package } from "lucide-react";

interface ProductFormProps {
  product: ProductProfile;
  onChange: (updated: Partial<ProductProfile>) => void;
  onGenerateAnchor: () => void;
  isGenerating: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onChange,
  onGenerateAnchor,
  isGenerating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange({ anchorImageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange({ anchorImageBase64: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-6">
      {/* Header and Presets */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-stone-900">
              1. Define Your Product
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            Choose a preset or describe your own
          </span>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {SAMPLE_PRODUCTS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                product.name === preset.name
                  ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300"
              }`}
            >
              {preset.name.split(" ")[0]} ({preset.category})
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Aura Nectar Perfume"
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
            Brand Name
          </label>
          <input
            type="text"
            value={product.brandName}
            onChange={(e) => onChange({ brandName: e.target.value })}
            placeholder="e.g. AURA LUXE"
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          Product Category
        </label>
        <input
          type="text"
          value={product.category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="e.g. Luxury Fragrance, Beverage, Consumer Electronics, Ceramic Homeware"
          className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          Detailed Product Description *
        </label>
        <textarea
          rows={3}
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the shape, geometry, container, packaging, logo placement, and distinguishing visual marks..."
          className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-stone-500" />
            Color Palette
          </label>
          <input
            type="text"
            value={product.colorPalette}
            onChange={(e) => onChange({ colorPalette: e.target.value })}
            placeholder="e.g. Smoked obsidian, warm amber gold"
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            Materials & Finish
          </label>
          <input
            type="text"
            value={product.materialStyle}
            onChange={(e) => onChange({ materialStyle: e.target.value })}
            placeholder="e.g. Fluted heavy crystal glass, matte brass"
            className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Anchor Image Upload or Action */}
      <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex-1 border border-dashed border-stone-300 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/30 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Upload className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-medium text-stone-600">
            {product.anchorImageBase64 ? "Replace custom reference photo" : "Upload existing photo as anchor (optional)"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <button
          type="button"
          disabled={isGenerating || !product.description.trim()}
          onClick={onGenerateAnchor}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Anchor...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Product Anchor Shot
            </>
          )}
        </button>
      </div>
    </div>
  );
};
