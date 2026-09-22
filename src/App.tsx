import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ProductForm } from "./components/ProductForm";
import { AnchorPreview } from "./components/AnchorPreview";
import { MediumSelector } from "./components/MediumSelector";
import { CampaignGallery } from "./components/CampaignGallery";
import { ProductProfile, MediumType, GeneratedMediumResult, GenerationState } from "./types";
import { SAMPLE_PRODUCTS, AVAILABLE_MEDIUMS } from "./data/presets";
import { AlertCircle, CheckCircle2, RefreshCw, Sparkles, EyeOff, ShieldAlert } from "lucide-react";

export default function App() {
  const [product, setProduct] = useState<ProductProfile>(SAMPLE_PRODUCTS[0]);
  const [selectedMediums, setSelectedMediums] = useState<MediumType[]>([
    "billboard",
    "newspaper",
    "social_post",
  ]);
  const [environmentMood, setEnvironmentMood] = useState<string>(
    "Cinematic golden hour twilight with modern architectural spotlights"
  );
  const [results, setResults] = useState<Record<string, GeneratedMediumResult>>({});
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const [genState, setGenState] = useState<GenerationState>({
    status: "idle",
    progressPercent: 0,
  });

  // Check health and API key on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.error("Health check error:", err);
        setHasApiKey(false);
      });
  }, []);

  const handleProductChange = (updated: Partial<ProductProfile>) => {
    setProduct((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleMedium = (medium: MediumType) => {
    setSelectedMediums((prev) =>
      prev.includes(medium) ? prev.filter((m) => m !== medium) : [...prev, medium]
    );
  };

  const handleSelectAll = () => {
    setSelectedMediums(AVAILABLE_MEDIUMS.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMediums([]);
  };

  // Generate the Master Anchor Shot
  const handleGenerateAnchor = async (): Promise<string | null> => {
    setGenState({
      status: "generating-anchor",
      progressPercent: 15,
      errorMessage: undefined,
    });

    try {
      const res = await fetch("/api/generate-anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          description: product.description,
          brandName: product.brandName,
          colorPalette: product.colorPalette,
          materialStyle: product.materialStyle,
          aspectRatio: "1:1",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const error = new Error(data.error || "Failed to generate anchor product image");
        (error as any).isQuota = data.isQuota;
        (error as any).isFreeTierZeroLimit = data.isFreeTierZeroLimit;
        throw error;
      }

      setProduct((prev) => ({ ...prev, anchorImageBase64: data.imageUrl }));
      setGenState({
        status: "idle",
        progressPercent: 100,
      });
      return data.imageUrl;
    } catch (err: any) {
      console.error(err);
      setGenState({
        status: "error",
        progressPercent: 0,
        errorMessage: err.message || "Failed to generate anchor image",
        isQuotaError: Boolean(err.isQuota),
        isPaidKeyRequired: Boolean(err.isFreeTierZeroLimit),
      });
      return null;
    }
  };

  // Generate a single medium
  const generateSingleMedium = async (
    medium: MediumType,
    anchorImg?: string
  ): Promise<GeneratedMediumResult | null> => {
    const currentAnchor = anchorImg || product.anchorImageBase64;
    const mediumConfig = AVAILABLE_MEDIUMS.find((m) => m.id === medium);

    const res = await fetch("/api/generate-medium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medium,
        productName: product.name,
        productDescription: product.description,
        anchorImageBase64: currentAnchor,
        aspectRatio: mediumConfig?.defaultAspectRatio || "1:1",
        environmentStyle: environmentMood,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const error = new Error(data.error || `Failed to generate image for ${medium}`);
      (error as any).isQuota = data.isQuota;
      (error as any).isFreeTierZeroLimit = data.isFreeTierZeroLimit;
      throw error;
    }

    return {
      medium,
      imageUrl: data.imageUrl,
      aspectRatio: data.aspectRatio,
      promptUsed: data.promptUsed,
      timestamp: Date.now(),
    };
  };

  // Generate All Selected Mediums
  const handleGenerateAll = async () => {
    if (selectedMediums.length === 0) return;

    let currentAnchor = product.anchorImageBase64;

    // Step 1: If no anchor exists, synthesize it first
    if (!currentAnchor) {
      const generatedAnchor = await handleGenerateAnchor();
      if (!generatedAnchor) return; // Halt if anchor failed
      currentAnchor = generatedAnchor;
    }

    // Step 2: Iterate through selected mediums sequentially to condition each with the anchor
    setGenState({
      status: "generating-mediums",
      progressPercent: 20,
      errorMessage: undefined,
    });

    const total = selectedMediums.length;
    let completed = 0;

    for (const medium of selectedMediums) {
      setGenState((prev) => ({
        ...prev,
        currentMedium: medium,
        progressPercent: Math.round(20 + (completed / total) * 75),
      }));

      try {
        const result = await generateSingleMedium(medium, currentAnchor);
        if (result) {
          setResults((prev) => ({ ...prev, [medium]: result }));
        }
      } catch (err: any) {
        console.error(`Error generating ${medium}:`, err);
        setGenState((prev) => ({
          ...prev,
          errorMessage: `Error rendering ${medium}: ${err.message}`,
        }));
      }
      completed++;
    }

    setGenState({
      status: "completed",
      progressPercent: 100,
    });
  };

  // Re-roll a single medium
  const handleRegenerateMedium = async (medium: MediumType) => {
    setGenState({
      status: "generating-mediums",
      currentMedium: medium,
      progressPercent: 50,
      errorMessage: undefined,
    });

    try {
      const result = await generateSingleMedium(medium, product.anchorImageBase64);
      if (result) {
        setResults((prev) => ({ ...prev, [medium]: result }));
      }
      setGenState({
        status: "idle",
        progressPercent: 100,
      });
    } catch (err: any) {
      console.error(err);
      setGenState({
        status: "error",
        progressPercent: 0,
        errorMessage: err.message || `Failed to re-roll ${medium}`,
      });
    }
  };

  const isGenerating =
    genState.status === "generating-anchor" || genState.status === "generating-mediums";

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      <Header hasApiKey={hasApiKey} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* API Key Warning banner if not connected */}
        {hasApiKey === false && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-sm text-amber-900 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                GEMINI_API_KEY environment variable required
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Please add your Gemini API key in the AI Studio <strong>Settings &gt; Secrets</strong> panel to enable live Nano-Banana (gemini-3.1-flash-lite-image) synthesis.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {genState.errorMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm ${
              genState.isPaidKeyRequired
                ? "bg-amber-50/90 border-amber-300 text-amber-950"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  genState.isPaidKeyRequired ? "text-amber-600" : "text-rose-600"
                }`}
              />
              <div>
                <p className="font-semibold">
                  {genState.isPaidKeyRequired
                    ? "Paid API Key / Billing Required for Nano-Banana"
                    : "Generation Notice"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    genState.isPaidKeyRequired ? "text-amber-800" : "text-rose-700"
                  }`}
                >
                  {genState.errorMessage}
                </p>
                {genState.isPaidKeyRequired && (
                  <p className="text-xs text-amber-700 mt-2 bg-amber-100/70 p-2 rounded-lg border border-amber-200/80">
                    <strong>How to resolve:</strong> Select a billing-enabled project or paid API key in Google AI Studio to use the Nano-Banana image generation model.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGenState((prev) => ({ ...prev, errorMessage: undefined }))}
              className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors shrink-0 ${
                genState.isPaidKeyRequired
                  ? "bg-amber-200/70 text-amber-900 hover:bg-amber-200"
                  : "bg-rose-100 text-rose-800 hover:text-rose-950"
              }`}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Generation Progress Bar */}
        {isGenerating && (
          <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                {genState.status === "generating-anchor"
                  ? "Rendering Master Product Anchor Shot..."
                  : `Imagining ${genState.currentMedium?.replace("_", " ") || "medium"} with Nano-Banana...`}
              </span>
              <span className="font-mono text-stone-500">
                {genState.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${genState.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <EyeOff className="w-3 h-3 text-emerald-600" />
                Strict Zero-People Enforcement Active
              </span>
              <span>Model: gemini-3.1-flash-lite-image</span>
            </div>
          </div>
        )}

        {/* Row 1: Product Definition Form & Anchor Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductForm
              product={product}
              onChange={handleProductChange}
              onGenerateAnchor={handleGenerateAnchor}
              isGenerating={genState.status === "generating-anchor"}
            />
          </div>

          <div className="lg:col-span-1">
            <AnchorPreview
              anchorImageUrl={product.anchorImageBase64}
              productName={product.name}
              isGenerating={genState.status === "generating-anchor"}
              onRegenerate={handleGenerateAnchor}
              onClear={() => setProduct((prev) => ({ ...prev, anchorImageBase64: undefined }))}
            />
          </div>
        </div>

        {/* Row 2: Medium Selection */}
        <MediumSelector
          selectedMediums={selectedMediums}
          onToggleMedium={handleToggleMedium}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          environmentMood={environmentMood}
          onEnvironmentMoodChange={setEnvironmentMood}
          onGenerateAll={handleGenerateAll}
          isGenerating={isGenerating}
          hasAnchor={Boolean(product.anchorImageBase64)}
        />

        {/* Row 3: Gallery of Imagined Mediums */}
        <CampaignGallery
          results={results}
          productName={product.name}
          isGenerating={isGenerating}
          activeMedium={genState.currentMedium}
          onRegenerateMedium={handleRegenerateMedium}
          anchorImageUrl={product.anchorImageBase64}
        />
      </main>

      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>Brand builder app</strong> &bull; Multi-Medium Consistency Engine
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Model: Nano-Banana (gemini-3.1-flash-lite-image)</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <EyeOff className="w-3.5 h-3.5" />
              100% Unpopulated / No People
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
