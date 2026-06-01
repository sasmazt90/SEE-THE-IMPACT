export interface ProductData {
  product_name: string;
  brand: string;
  product_image?: string;
  ingredients?: string[];
  score: number;
  positives: string[];
  negatives: string[];
  summary: string;
  sector?: string;
  category?: string;
  referencesPositive?: (string | null)[];
  referencesNegative?: (string | null)[];
}

export interface SponsoredProduct {
  id: string;
  product_name: string;
  brand: string;
  sector?: string;
  image_url?: string;
  score?: number;
  impressions_cap: number;
  impressions_count: number;
  active: boolean;
  start_date: string;
  end_date: string;
  url?: string;
}

export interface SponsoredBrand {
  id: string;
  brand_name: string;
  sector?: string;
  logo_url?: string;
  score?: number;
  impressions_cap: number;
  impressions_count: number;
  active: boolean;
  start_date: string;
  end_date: string;
  url?: string;
}

export interface AlternativeProduct {
  product_name: string;
  brand: string;
  explanation: string;
  product_image?: string;
  score: number;
  isSponsored?: boolean;
  sponsoredId?: string;
  url?: string;
  hasHigherScore?: boolean;
}

export interface AlternativeBrand {
  brand_name: string;
  explanation: string;
  logo_url?: string;
  score: number;
  isSponsored?: boolean;
  sponsoredId?: string;
  url?: string;
  hasHigherScore?: boolean;
}
