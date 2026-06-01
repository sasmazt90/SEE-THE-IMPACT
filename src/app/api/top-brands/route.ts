import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AI’den gelen brand tipi
type AIBrand = {
  brand_name: string;
  score: number;
  sector?: string;
  reason?: string;
};

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // ----------------------------------------------------
    // 1) Aktif sponsorları al (max 2 kullanılacak)
    // ----------------------------------------------------
    let sponsoredBrands: any[] = [];

    try {
      const { data } = await supabase
        .from("sponsored_brands")
        .select("*")
        .eq("active", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("score", { ascending: false });

      if (data) {
        sponsoredBrands = data.filter(
          (sb) =>
            sb.impressions_cap === 0 ||
            sb.impressions_count < sb.impressions_cap,
        );
      }
    } catch (err) {
      console.error("Error fetching sponsored brands:", err);
    }

    // ----------------------------------------------------
    // 2) OpenAI'den TOP 10 marka iste
    // ----------------------------------------------------
    const systemPrompt = `
You are a sustainability expert. List the top 10 most sustainable brands globally.

Return ONLY valid JSON:
{
  "brands": [
    {
      "brand_name": "...",
      "score": 0-100,
      "sector": "...",
      "reason": "..."
    }
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "List the top 10 most sustainable brands globally.",
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let aiData;
    try {
      aiData = JSON.parse(cleaned);
    } catch (err) {
      console.error("AI parse error:", cleaned);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    const aiBrandsRaw: AIBrand[] = Array.isArray(aiData.brands)
      ? aiData.brands
      : [];

    // ----------------------------------------------------
    // 3) AI listesinden sponsorları çıkar
    // ----------------------------------------------------
    const sponsoredNames = new Set(
      sponsoredBrands.map((b) => b.brand_name.toLowerCase()),
    );

    const aiBrands = aiBrandsRaw
      .filter((b: AIBrand) => !sponsoredNames.has(b.brand_name.toLowerCase()))
      .slice(0, 10);

    // ----------------------------------------------------
    // 4) Sponsor görünüm sırası (üst + 10 marka + alt)
    // ----------------------------------------------------
    const topSponsor = sponsoredBrands[0]
      ? {
          brand_name: sponsoredBrands[0].brand_name,
          score: sponsoredBrands[0].score,
          sector: sponsoredBrands[0].sector,
          reason: "Sponsored sustainable brand",
          isSponsored: true,
          sponsoredId: sponsoredBrands[0].id,
          url: sponsoredBrands[0].url,
        }
      : null;

    const bottomSponsor = sponsoredBrands[1]
      ? {
          brand_name: sponsoredBrands[1].brand_name,
          score: sponsoredBrands[1].score,
          sector: sponsoredBrands[1].sector,
          reason: "Sponsored sustainable brand",
          isSponsored: true,
          sponsoredId: sponsoredBrands[1].id,
          url: sponsoredBrands[1].url,
        }
      : null;

    // ----------------------------------------------------
    // 5) Sponsor impression sayısını artır
    // ----------------------------------------------------
    for (const sb of sponsoredBrands.slice(0, 2)) {
      await supabase
        .from("sponsored_brands")
        .update({
          impressions_count: sb.impressions_count + 1,
        })
        .eq("id", sb.id);
    }

    // ----------------------------------------------------
    // 6) Final listeyi oluştur
    // ----------------------------------------------------
    const finalList: any[] = [];

    if (topSponsor) finalList.push(topSponsor);

    finalList.push(
      ...aiBrands.map((b: AIBrand) => ({
        brand_name: b.brand_name,
        score: b.score,
        sector: b.sector || "General",
        reason: b.reason || "",
        isSponsored: false,
      })),
    );

    if (bottomSponsor) finalList.push(bottomSponsor);

    return NextResponse.json({ brands: finalList });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to get top brands" },
      { status: 500 },
    );
  }
}
