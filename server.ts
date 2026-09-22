import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits to support base64 reference images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your environment secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    model: "gemini-3.1-flash-lite-image (Nano-Banana)",
  });
});

// Helper to sanitize base64 data strings
function cleanBase64(dataUrlOrBase64: string): { data: string; mimeType: string } {
  if (dataUrlOrBase64.startsWith("data:")) {
    const match = dataUrlOrBase64.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  return { mimeType: "image/png", data: dataUrlOrBase64 };
}

// Helper to format and classify API errors
function parseApiError(error: any) {
  const rawMsg = error?.message || (typeof error === "string" ? error : JSON.stringify(error));
  const status = error?.status;
  const code = error?.code;

  const isQuota =
    status === "RESOURCE_EXHAUSTED" ||
    code === 429 ||
    rawMsg.includes("429") ||
    rawMsg.includes("RESOURCE_EXHAUSTED") ||
    rawMsg.includes("Quota exceeded") ||
    rawMsg.includes("quota");

  const isFreeTierZeroLimit =
    rawMsg.includes("limit: 0") ||
    rawMsg.includes("free_tier_requests") ||
    rawMsg.includes("FreeTier");

  let friendlyMessage = rawMsg;
  if (isQuota) {
    if (isFreeTierZeroLimit) {
      friendlyMessage =
        "The Nano-Banana model (gemini-3.1-flash-lite-image) requires a project with a Paid API key / Billing enabled. The free tier has a quota limit of 0 for this model.";
    } else {
      friendlyMessage =
        "API quota or rate limit exceeded. Please wait a moment before retrying.";
    }
  }

  return {
    isQuota,
    isFreeTierZeroLimit,
    message: friendlyMessage,
    rawMsg,
  };
}

// 1. Generate Anchor / Hero Product Image
app.post("/api/generate-anchor", async (req: Request, res: Response) => {
  try {
    const {
      productName,
      category,
      description,
      brandName,
      colorPalette,
      materialStyle,
      aspectRatio = "1:1",
    } = req.body;

    if (!description && !productName) {
      return res.status(400).json({ error: "Product name or description is required" });
    }

    const ai = getGenAI();

    const prompt = `Professional master product studio photograph of ${productName || "a product"}${
      brandName ? ` branded with "${brandName}"` : ""
    }${category ? `, category: ${category}` : ""}.
Visual Details: ${description || "Sleek, iconic industrial product design"}.
Color Palette: ${colorPalette || "harmonious and striking brand colors"}.
Materials & Finish: ${materialStyle || "high-end premium textures, pristine craftsmanship"}.
Lighting & Setup: Minimalist architectural studio podium, clean neutral background, crisp softbox lighting, sharp macro product focus, 8k resolution, ultra-detailed.
CRITICAL MANDATES:
1. STRICTLY NO PEOPLE, NO HUMANS, NO FACES, NO HANDS, NO BODY PARTS, NO SILHOUETTES, NO PASSERSBY. Completely unpopulated.
2. Isolated, clean master product hero view suitable as a brand reference anchor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio) ? aspectRatio : "1:1") as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let textResponse: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: "No image was returned by the Nano-Banana model.",
        details: textResponse || "Model may have filtered the prompt or returned text only.",
      });
    }

    res.json({
      success: true,
      imageUrl,
      modelUsed: "gemini-3.1-flash-lite-image (Nano-Banana)",
      promptUsed: prompt,
    });
  } catch (error: any) {
    console.error("Error generating anchor image:", error);
    const parsed = parseApiError(error);
    res.status(parsed.isQuota ? 429 : 500).json({
      error: parsed.message,
      isQuota: parsed.isQuota,
      isFreeTierZeroLimit: parsed.isFreeTierZeroLimit,
      details: parsed.rawMsg,
    });
  }
});

// Medium prompt generators
function buildMediumPrompt(
  medium: string,
  productName: string,
  productDescription: string,
  hasAnchorImage: boolean,
  environmentStyle?: string
): string {
  const consistencyPrefix = hasAnchorImage
    ? "CRITICAL PRODUCT CONSISTENCY MANDATE: The attached reference image contains the exact product. You MUST reproduce the EXACT SAME product (identical shape, geometry, packaging, colors, logos, and materials) into this new advertising scene. Do not alter or redesign the product."
    : `Hero Product: ${productName}. Description: ${productDescription}.`;

  const noPeopleRule = "STRICT CONSTRAINT: ABSOLUTELY NO PEOPLE, NO HUMANS, NO FACES, NO HANDS, NO BODIES, NO PASSERSBY, NO SILHOUETTES, NO CROWDS. The scene MUST BE completely devoid of people. Pure focus on the product and its advertising medium.";

  switch (medium.toLowerCase()) {
    case "billboard":
      return `${consistencyPrefix}
SCENE: Massive high-impact outdoor roadside billboard display.
The billboard prominently displays the product in an ultra-clean advertising campaign.
Setting: ${environmentStyle || "Modern metropolis urban highway or architectural downtown plaza at golden hour twilight, dramatic architectural skyline in the background, dramatic spotlighting on the billboard canvas"}.
Camera Angle: Low-angle dramatic wide architectural shot looking up at the monumental billboard structure.
${noPeopleRule}
Photorealistic architectural and commercial photography, 8k resolution, crisp clean advertisement print.`;

    case "newspaper":
      return `${consistencyPrefix}
SCENE: Classic broadsheet newspaper advertisement.
A printed vintage or high-end financial daily newspaper folded open on a rich dark oak or marble editorial desk.
The printed advertisement takes up the prominent center page, featuring a detailed, crisp editorial advertisement of the exact product.
Details: Authentic fibrous newsprint paper texture, delicate halftone ink dots, legible editorial typography headlines around the ad border, subtle natural morning window sunlight casting soft angled shadows across the newspaper.
${noPeopleRule}
Macro editorial still-life photography, high tactile paper realism, unpopulated workspace.`;

    case "social_post":
    case "social":
      return `${consistencyPrefix}
SCENE: High-converting aesthetic social media campaign post (Instagram/TikTok feed aesthetic).
A vibrant, modern lifestyle still-life shot centering the exact product on a curated pastel or textured travertine podium.
Details: Crisp studio lighting, gentle colored glass prism caustics, soft geometric props (minimalist arch, stone cube, organic dry botanical branch in vase), clean composition with space for headline copy.
${noPeopleRule}
High-end commercial brand social media campaign photography, trending aesthetic, sharp details, flawless presentation.`;

    case "transit_poster":
    case "subway":
      return `${consistencyPrefix}
SCENE: Backlit glowing advertisement lightbox poster mounted on a sleek polished metro transit station wall.
Details: Polished concrete, brushed aluminum frame, glossy glass reflection, ultra-sharp backlit print of the product campaign.
${noPeopleRule}
Quiet, sleek, pristine subway terminal corridor at night, empty and motionless. Cinematic architectural lighting.`;

    case "magazine_spread":
    case "magazine":
      return `${consistencyPrefix}
SCENE: Luxurious glossy high-fashion design magazine double-page spread lying open on a minimalist concrete table.
The spread features the product in a full-bleed editorial layout with crisp Swiss-style graphic design accents.
Details: Subtle paper sheen, gentle curved page binding, premium art book production quality.
${noPeopleRule}
Sophisticated still life, serene overhead studio shot, unpopulated.`;

    case "storefront":
    case "retail_window":
      return `${consistencyPrefix}
SCENE: Luxury flagship boutique retail window display.
The product is showcased on an illuminated pedestal behind gleaming anti-reflective glass, with custom minimalist sculptural set design and directional gallery spotlights.
${noPeopleRule}
Exterior sidewalk view looking into the illuminated boutique window display at dusk. No pedestrians, no reflection of people.`;

    default:
      return `${consistencyPrefix}
SCENE: Commercial advertising campaign shot for ${medium}.
Featuring the exact product prominently displayed in a high-end, artistic context matching ${medium}.
${noPeopleRule}
Ultra-realistic commercial product photography.`;
  }
}

// 2. Generate Medium Image (Billboard, Newspaper, Social Post, etc.)
app.post("/api/generate-medium", async (req: Request, res: Response) => {
  try {
    const {
      medium,
      productName = "Product",
      productDescription = "",
      anchorImageBase64,
      aspectRatio,
      environmentStyle,
    } = req.body;

    if (!medium) {
      return res.status(400).json({ error: "Medium name is required" });
    }

    const ai = getGenAI();
    const hasAnchor = Boolean(anchorImageBase64);

    // Map medium to recommended aspect ratios
    let chosenAspectRatio = aspectRatio;
    if (!chosenAspectRatio) {
      if (medium === "billboard") chosenAspectRatio = "16:9";
      else if (medium === "newspaper") chosenAspectRatio = "3:4";
      else if (medium === "social_post" || medium === "social") chosenAspectRatio = "1:1";
      else if (medium === "transit_poster" || medium === "subway") chosenAspectRatio = "3:4";
      else if (medium === "magazine_spread" || medium === "magazine") chosenAspectRatio = "16:9";
      else if (medium === "storefront") chosenAspectRatio = "4:3";
      else chosenAspectRatio = "1:1";
    }

    const promptText = buildMediumPrompt(
      medium,
      productName,
      productDescription,
      hasAnchor,
      environmentStyle
    );

    const parts: any[] = [];

    // If anchor image is available, pass it first for visual conditioning and consistency!
    if (hasAnchor) {
      const { data, mimeType } = cleanBase64(anchorImageBase64);
      parts.push({
        inlineData: {
          data,
          mimeType,
        },
      });
    }

    parts.push({
      text: promptText,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(chosenAspectRatio) ? chosenAspectRatio : "1:1") as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let textResponse: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: `No image was returned for ${medium} by the Nano-Banana model.`,
        details: textResponse || "Model may have filtered the prompt or returned text only.",
      });
    }

    res.json({
      success: true,
      medium,
      imageUrl,
      aspectRatio: chosenAspectRatio,
      modelUsed: "gemini-3.1-flash-lite-image (Nano-Banana)",
      promptUsed: promptText,
    });
  } catch (error: any) {
    console.error("Error generating medium image:", error);
    const parsed = parseApiError(error);
    res.status(parsed.isQuota ? 429 : 500).json({
      error: parsed.message,
      isQuota: parsed.isQuota,
      isFreeTierZeroLimit: parsed.isFreeTierZeroLimit,
      details: parsed.rawMsg,
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brand builder app server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
