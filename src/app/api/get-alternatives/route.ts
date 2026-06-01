import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createOptionalSupabaseClient } from "@/lib/serverSupabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Sector normalization (AI çıktısını senin kullandığın üst kategoriye çevir)
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

// Sponsor Öncelik Algoritması
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
    const { productName, sector, productScore } = await request.json();
    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    const normalizedSector = normalizeSector(sector);
    let sponsoredProduct = null;
    const supabase = createOptionalSupabaseClient();

    // 1) Sector bazlı sponsor
    if (supabase && normalizedSector) {
      const { data } = await supabase
        .from("sponsored_products")
        .select("*")
        .ilike("sector", `%${normalizedSector}%`);

      const best = selectBestSponsor(data || []);
      if (best) sponsoredProduct = best;
    }

    // 2) Hiç bulunamazsa global sponsor
    if (supabase && !sponsoredProduct) {
      const { data } = await supabase.from("sponsored_products").select("*");

      const best = selectBestSponsor(data || []);
      if (best) sponsoredProduct = best;
    }

    // ❗ SELF-SPONSOR PREVENTION (ÜRÜN KENDİSİNİ ALTERNATİFTE GÖSTERMEZ)
    if (
      sponsoredProduct &&
      sponsoredProduct.product_name.toLowerCase() === productName.toLowerCase()
    ) {
      sponsoredProduct = null;
    }

    // 3) Impression artır
    if (supabase && sponsoredProduct) {
      await supabase
        .from("sponsored_products")
        .update({
          impressions_count: (sponsoredProduct.impressions_count || 0) + 1,
        })
        .eq("id", sponsoredProduct.id);
    }

    // 4) AI alternatif sayısı
    const aiCount = sponsoredProduct ? 4 : 5;

    const systemPrompt = `
You are a sustainable product recommendation expert.
Return ONLY valid JSON:

{
  "alternatives": [
    {
      "product_name": "...",
      "brand": "...",
      "explanation": "...",
      "score": 0-100
    }
  ]
}

Sector: ${normalizedSector || "General"}
Return exactly ${aiCount} items.
All alternatives must be more eco-friendly than: ${productName}.
Ensure none of the returned alternatives is the same product as: ${productName}.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Suggest ${aiCount} alternatives for ${productName}`,
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

    if (sponsoredProduct) {
      const hasHigherScore =
        productScore &&
        sponsoredProduct.score &&
        sponsoredProduct.score > productScore;

      alternatives.push({
        product_name: sponsoredProduct.product_name,
        brand: sponsoredProduct.brand,
        explanation: "Sponsored eco-friendly alternative",
        product_image: sponsoredProduct.image_url,
        score: sponsoredProduct.score || 85,
        isSponsored: true,
        sponsoredId: sponsoredProduct.id,
        url: sponsoredProduct.url,
        hasHigherScore,
      });
    }

    if (Array.isArray(aiData.alternatives)) {
      aiData.alternatives.slice(0, aiCount).forEach((alt: any) => {
        if (alt.product_name.toLowerCase() === productName.toLowerCase()) {
          return; // skip same product
        }

        alternatives.push({
          product_name: alt.product_name,
          brand: alt.brand,
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
