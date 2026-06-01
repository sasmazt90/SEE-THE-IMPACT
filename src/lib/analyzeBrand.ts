import { BrandData } from '@/types';

export async function analyzeBrand(brandName: string): Promise<BrandData> {
  try {
    const response = await fetch('/api/analyze-brand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brandName }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze brand');
    }

    const data = await response.json();
    return data as BrandData;
  } catch (error) {
    console.error('Error calling analyze API:', error);
    // Return fallback data if API fails
    return {
      score: 50,
      positives: [
        'Brand information is being gathered',
        'Sustainability data is being analyzed'
      ],
      negatives: [
        'Unable to retrieve complete sustainability data',
        'Further analysis may be needed'
      ],
      sustainabilityActions: [
        'Check back later for updated information'
      ],
      industryContext: `We're currently gathering sustainability information for ${brandName}. Please try again in a moment.`,
    };
  }
}
