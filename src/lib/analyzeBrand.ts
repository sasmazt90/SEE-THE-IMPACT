import { BrandData } from '@/types';

export async function analyzeBrand(brandName: string): Promise<BrandData> {
  const response = await fetch('/api/analyze-brand', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brandName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to analyze brand');
  }

  const data = await response.json();
  return data as BrandData;
}
