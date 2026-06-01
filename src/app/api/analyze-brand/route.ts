import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { brandName } = await request.json();

    if (!brandName || typeof brandName !== 'string') {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a sustainability analyst. Analyze brands for their environmental and social impact. 
    
    Return ONLY valid JSON in this exact format (no markdown, no code blocks):
    {
      "score": <number 0-100>,
      "sector": "<brand sector e.g. 'Personal Care', 'Food & Beverage', 'Fashion', 'Technology', 'Automotive', 'Retail', etc.>",
      "category": "<specific category if applicable e.g. 'Skincare', 'Fast Food', 'Sportswear', etc.>",
      "positives": ["<positive impact 1>", "<positive impact 2>", ...],
      "negatives": ["<area of concern 1>", "<area of concern 2>", ...],
      "sustainabilityActions": ["<recommended action 1>", "<recommended action 2>", ...],
      "industryContext": "<paragraph about the brand's position in its industry regarding sustainability>"
    }
    
    Guidelines:
    - Score 80-100: Industry leader in sustainability
    - Score 60-79: Making good progress
    - Score 40-59: Average, room for improvement
    - Score 0-39: Significant concerns
    - Provide 3-5 positives and 3-5 negatives
    - ALWAYS identify the sector and category - this is critical for matching alternative brands
    - Do NOT include any URLs or reference links - only provide the analysis text
    - Be factual and balanced in your assessment`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze the sustainability and environmental impact of the brand: ${brandName}` }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    let brandData;
    try {
      // Remove any potential markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      brandData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const score = Number(brandData.score);

    if (
      !Number.isFinite(score) ||
      !Array.isArray(brandData.positives) ||
      !Array.isArray(brandData.negatives) ||
      !Array.isArray(brandData.sustainabilityActions) ||
      typeof brandData.industryContext !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Brand analysis returned incomplete data' },
        { status: 502 }
      );
    }

    // Validate and sanitize the response
    const sanitizedData = {
      score: Math.max(0, Math.min(100, score)),
      sector: typeof brandData.sector === 'string' ? brandData.sector : undefined,
      category: typeof brandData.category === 'string' ? brandData.category : undefined,
      positives: Array.isArray(brandData.positives) ? brandData.positives.slice(0, 5) : [],
      negatives: Array.isArray(brandData.negatives) ? brandData.negatives.slice(0, 5) : [],
      sustainabilityActions: Array.isArray(brandData.sustainabilityActions) ? brandData.sustainabilityActions.slice(0, 5) : [],
      industryContext: brandData.industryContext,
    };

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error('Error analyzing brand:', error);
    return NextResponse.json(
      { error: 'Failed to analyze brand' },
      { status: 500 }
    );
  }
}
