export type MediumType =
  | "billboard"
  | "newspaper"
  | "social_post"
  | "transit_poster"
  | "magazine_spread"
  | "storefront";

export interface MediumOption {
  id: MediumType;
  title: string;
  tagline: string;
  defaultAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  iconName: string;
  description: string;
  recommendedSetting: string;
}

export interface ProductProfile {
  name: string;
  brandName: string;
  category: string;
  description: string;
  colorPalette: string;
  materialStyle: string;
  anchorImageBase64?: string;
}

export interface GeneratedMediumResult {
  medium: MediumType;
  imageUrl: string;
  aspectRatio: string;
  promptUsed: string;
  timestamp: number;
}

export interface GenerationState {
  status: "idle" | "generating-anchor" | "generating-mediums" | "completed" | "error";
  currentMedium?: string;
  progressPercent: number;
  errorMessage?: string;
  isQuotaError?: boolean;
  isPaidKeyRequired?: boolean;
}
