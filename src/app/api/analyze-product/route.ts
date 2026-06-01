import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fetch product name from OpenFoodFacts using barcode
async function fetchProductNameFromBarcode(
  barcode: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    );

    const data = await res.json();

    if (data.status === 1) {
      return data.product.product_name || data.product.generic_name || null;
    }
    return null;
  } catch (err) {
    console.error("OpenFoodFacts error:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productName, barcode } = await request.json();

    // STEP 1 — Resolve final query name
    let query = productName;

    if (barcode) {
      const foundName = await fetchProductNameFromBarcode(barcode);
      if (foundName) {
        query = foundName;
      } else {
        // fallback: ask GPT to guess product name
        query = `product with barcode: ${barcode}`;
      }
    }

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Product name or barcode is required" },
        { status: 400 },
      );
    }

    // STEP 2 — Sustainability analysis via GPT
    const systemPrompt = `
You are a product sustainability analyst. Analyze products for environmental impact.

If the input looks like a BARCODE or UNKNOWN PRODUCT, infer the most likely product category and brand based on common global products. Never leave product_name empty.

Return ONLY valid JSON (NO markdown):
{
  "product_name": "",
  "brand": "",
  "sector": "",
  "category": "",
  "ingredients": [],
  "score": 0,
  "positives": [],
  "negatives": [],
  "summary": "",
  "referencesPositive": [],
  "referencesNegative": []
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this product: ${query}` },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let productData;
    try {
      const cleaned = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      productData = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse error:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    // Final sanitized object
    const sanitized = {
      product_name: productData.product_name || query,
      brand: productData.brand || "Unknown Brand",
      sector: productData.sector || "General",
      category: productData.category || "General",
      ingredients: Array.isArray(productData.ingredients)
        ? productData.ingredients
        : [],
      score: Math.max(0, Math.min(100, Number(productData.score) || 50)),
      positives: Array.isArray(productData.positives)
        ? productData.positives.slice(0, 3)
        : [],
      negatives: Array.isArray(productData.negatives)
        ? productData.negatives.slice(0, 3)
        : [],
      summary: productData.summary || "",
      referencesPositive: Array.isArray(productData.referencesPositive)
        ? productData.referencesPositive
        : [],
      referencesNegative: Array.isArray(productData.referencesNegative)
        ? productData.referencesNegative
        : [],
    };

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze product" },
      { status: 500 },
    );
  }
}
