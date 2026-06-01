import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type OpenFoodFactsProduct = {
  product_name?: string;
  generic_name?: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  image_url?: string;
};

const barcodeSources = [
  {
    name: "Open Food Facts",
    baseUrl: "https://world.openfoodfacts.org",
  },
  {
    name: "Open Beauty Facts",
    baseUrl: "https://world.openbeautyfacts.org",
  },
  {
    name: "Open Products Facts",
    baseUrl: "https://world.openproductsfacts.org",
  },
  {
    name: "Open Pet Food Facts",
    baseUrl: "https://world.openpetfoodfacts.org",
  },
];

async function fetchProductFromBarcode(
  barcode: string,
): Promise<{ product: OpenFoodFactsProduct; source: string } | null> {
  let lastError: unknown = null;

  for (const source of barcodeSources) {
    try {
      const res = await fetch(
        `${source.baseUrl}/api/v0/product/${encodeURIComponent(barcode)}.json`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        lastError = new Error(`${source.name} returned ${res.status}`);
        continue;
      }

      const data = await res.json();

      if (data.status === 1 && data.product) {
        return {
          product: data.product as OpenFoodFactsProduct,
          source: source.name,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn("Barcode lookup warning:", lastError);
  }

  return null;
}

function buildBarcodeQuery(product: OpenFoodFactsProduct) {
  const productName = product.product_name || product.generic_name;

  if (!productName) {
    return null;
  }

  return [
    `Product: ${productName}`,
    product.brands ? `Brand: ${product.brands}` : null,
    product.categories ? `Categories: ${product.categories}` : null,
    product.ingredients_text ? `Ingredients: ${product.ingredients_text}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseOpenAIJson(content: string) {
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function validateProductData(productData: any) {
  const score = Number(productData?.score);

  if (
    !productData ||
    typeof productData.product_name !== "string" ||
    !productData.product_name.trim() ||
    typeof productData.brand !== "string" ||
    !productData.brand.trim() ||
    !Number.isFinite(score) ||
    !Array.isArray(productData.positives) ||
    !Array.isArray(productData.negatives) ||
    typeof productData.summary !== "string"
  ) {
    throw new Error("Product analysis returned incomplete data");
  }

  return {
    product_name: productData.product_name.trim(),
    brand: productData.brand.trim(),
    product_image:
      typeof productData.product_image === "string"
        ? productData.product_image
        : undefined,
    sector:
      typeof productData.sector === "string" ? productData.sector : undefined,
    category:
      typeof productData.category === "string"
        ? productData.category
        : undefined,
    ingredients: Array.isArray(productData.ingredients)
      ? productData.ingredients
      : [],
    score: Math.max(0, Math.min(100, score)),
    positives: productData.positives.slice(0, 3),
    negatives: productData.negatives.slice(0, 3),
    summary: productData.summary,
    referencesPositive: Array.isArray(productData.referencesPositive)
      ? productData.referencesPositive
      : [],
    referencesNegative: Array.isArray(productData.referencesNegative)
      ? productData.referencesNegative
      : [],
  };
}

const productAnalysisSchema = `
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

async function analyzeProductText(query: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a product sustainability analyst. Analyze only the product provided by the user. Do not guess a different product if the input is incomplete. ${productAnalysisSchema}`,
      },
      { role: "user", content: `Analyze this product:\n${query}` },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return parseOpenAIJson(completion.choices[0]?.message?.content || "");
}

async function analyzeProductImage(imageData: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You identify the exact visible product from the image and analyze its sustainability. If the product or brand cannot be identified, return {"error":"Product could not be identified from image"}. Do not invent missing product details. ${productAnalysisSchema}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify and analyze the product in this image.",
          },
          {
            type: "image_url",
            image_url: { url: imageData },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  });

  return parseOpenAIJson(completion.choices[0]?.message?.content || "");
}

export async function POST(request: NextRequest) {
  try {
    const { productName, barcode, imageData } = await request.json();

    let productData: any;
    let productImage: string | undefined;

    if (barcode) {
      const barcodeResult = await fetchProductFromBarcode(String(barcode));

      if (!barcodeResult) {
        return NextResponse.json(
          { error: "Barcode was not found in supported product databases" },
          { status: 404 },
        );
      }

      const { product, source } = barcodeResult;
      const query = buildBarcodeQuery(product);

      if (!query) {
        return NextResponse.json(
          { error: "Barcode record does not include a product name" },
          { status: 422 },
        );
      }

      productImage = product.image_url;
      productData = await analyzeProductText(
        `${query}\nBarcode source: ${source}`,
      );
    } else if (imageData) {
      productData = await analyzeProductImage(String(imageData));

      if (productData?.error) {
        return NextResponse.json({ error: productData.error }, { status: 422 });
      }
    } else if (productName && typeof productName === "string") {
      productData = await analyzeProductText(productName);
    } else {
      return NextResponse.json(
        { error: "Product name, barcode, or image is required" },
        { status: 400 },
      );
    }

    const sanitized = validateProductData(productData);

    return NextResponse.json({
      ...sanitized,
      product_image: sanitized.product_image || productImage,
    });
  } catch (error) {
    console.error("Product analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze product" },
      { status: 500 },
    );
  }
}
