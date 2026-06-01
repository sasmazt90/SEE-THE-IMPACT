import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sector normalization
function normalizeSector(raw?: string | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();

  if (
    s.includes("fashion") ||
    s.includes("apparel") ||
    s.includes("clothing")
  ) {
    return "Fashion";
  }
  if (
    s.includes("personal care") ||
    s.includes("cosmetic") ||
    s.includes("beauty") ||
    s.includes("skincare")
  ) {
    return "Personal Care";
  }
  if (s.includes("cleaning") || s.includes("household")) {
    return "Cleaning Products";
  }
  if (s.includes("food") || s.includes("beverage")) {
    return "Food";
  }
  if (s.includes("automotive") || s.includes("transport")) {
    return "Automotive";
  }
  if (s.includes("technology") || s.includes("electronics")) {
    return "Technology";
  }
  if (s.includes("retail")) {
    return "Retail";
  }

  return raw;
}

// Unified Sponsor Selection
function selectBestSponsor(rows: any[]) {
  if (!rows || rows.length === 0) return null;

  const now = new Date().toISOString();

  const activeRows = rows.filter(
    (sp) =>
      sp.active &&
      sp.start_date <= now &&
      sp.end_date >= now &&
      (sp.impressions_cap === 0 || sp.impressions_count < sp.impressions_cap),
  );

  if (activeRows.length === 0) return null;

  const unlimited = activeRows.filter((sp) => sp.impressions_cap === 0);
  if (unlimited.length > 0) {
    return unlimited.sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime(),
    )[0];
  }

  return activeRows.sort((a, b) => {
    const remainA = a.impressions_cap - a.impressions_count;
    const remainB = b.impressions_cap - b.impressions_count;
    return remainB - remainA;
  })[0];
}

export async function POST(request: NextRequest) {
  try {
    const { brandName, sector, brandScore } = await request.json();
    if (!brandName) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 },
      );
    }

    const normalizedSector = normalizeSector(sector);
    let sponsoredBrand = null;

    // 1) Sector-based sponsor
    if (normalizedSector) {
      const { data } = await supabase
        .from("sponsored_brands")
        .select("*")
        .ilike("sector", `%${normalizedSector}%`);

      const best = selectBestSponsor(data || []);
      if (best) sponsoredBrand = best;
    }

    // 2) If none, global sponsor
    if (!sponsoredBrand) {
      const { data } = await supabase.from("sponsored_brands").select("*");

      const best = selectBestSponsor(data || []);
      if (best) sponsoredBrand = best;
    }

    // ❗ PREVENT SPONSORED BRAND FROM BEING THE SAME AS MAIN BRAND
    if (
      sponsoredBrand &&
      sponsoredBrand.brand_name.toLowerCase() === brandName.toLowerCase()
    ) {
      sponsoredBrand = null; // do NOT show same brand as alternative
    }

    // 3) Increment impressions
    if (sponsoredBrand) {
      await supabase
        .from("sponsored_brands")
        .update({
          impressions_count: (sponsoredBrand.impressions_count || 0) + 1,
        })
        .eq("id", sponsoredBrand.id);
    }

    // 4) AI count
    const aiCount = sponsoredBrand ? 4 : 5;

    const prompt = `
You are a sustainable brand recommendation expert.
Return ONLY valid JSON:

{
  "alternatives": [
    {
      "brand_name": "...",
      "explanation": "...",
      "score": 0-100
    }
  ]
}

Sector: ${normalizedSector || "General"}
Return exactly ${aiCount} items.
All alternatives must be more eco-friendly than: ${brandName}.
Also ensure none of the returned alternatives is the same brand as: ${brandName}.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `Suggest brand alternatives for: ${brandName}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    let raw = completion.choices[0]?.message?.content || "";
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiData;
    try {
      aiData = JSON.parse(raw);
    } catch (err) {
      console.error("AI Parse Error:", raw);
      return NextResponse.json({ error: "AI parse failed" }, { status: 500 });
    }

    const alternatives: any[] = [];

    if (sponsoredBrand) {
      const hasHigherScore =
        brandScore && sponsoredBrand.score && sponsoredBrand.score > brandScore;

      alternatives.push({
        brand_name: sponsoredBrand.brand_name,
        explanation: "Sponsored eco-friendly alternative",
        logo_url: sponsoredBrand.logo_url,
        score: sponsoredBrand.score || 85,
        isSponsored: true,
        sponsoredId: sponsoredBrand.id,
        url: sponsoredBrand.url,
        hasHigherScore,
      });
    }

    if (Array.isArray(aiData.alternatives)) {
      aiData.alternatives.slice(0, aiCount).forEach((alt: any) => {
        if (alt.brand_name.toLowerCase() === brandName.toLowerCase()) {
          return; // skip same brand
        }

        alternatives.push({
          brand_name: alt.brand_name,
          explanation: alt.explanation,
          score: Math.max(0, Math.min(100, Number(alt.score) || 70)),
          isSponsored: false,
        });
      });
    }

    return NextResponse.json({ alternatives });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
