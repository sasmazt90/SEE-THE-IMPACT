import { ProductData, AlternativeBrand } from '@/types/product';

export async function analyzeProduct(productName: string, barcode?: string): Promise<ProductData> {
  try {
    const response = await fetch('/api/analyze-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName, barcode }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze product');
    }

    const data = await response.json();
    return data as ProductData;
  } catch (error) {
    console.error('Error calling analyze product API:', error);
    return {
      product_name: productName,
      brand: 'Unknown Brand',
      score: 50,
      positives: ['Product information is being gathered'],
      negatives: ['Unable to retrieve complete data'],
      summary: `We're currently gathering sustainability information for ${productName}. Please try again in a moment.`,
      referencesPositive: [],
      referencesNegative: [],
    };
  }
}

export async function getAlternatives(productName: string, sector?: string, productScore?: number) {
  try {
    const response = await fetch('/api/get-alternatives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName, sector, productScore }),
    });

    if (!response.ok) {
      throw new Error('Failed to get alternatives');
    }

    const data = await response.json();
    return data.alternatives || [];
  } catch (error) {
    console.error('Error getting alternatives:', error);
    return [];
  }
}

export async function getBrandAlternatives(brandName: string, sector?: string, brandScore?: number): Promise<AlternativeBrand[]> {
  try {
    const response = await fetch('/api/get-brand-alternatives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brandName, sector, brandScore }),
    });

    if (!response.ok) {
      throw new Error('Failed to get brand alternatives');
    }

    const data = await response.json();
    return data.alternatives || [];
  } catch (error) {
    console.error('Error getting brand alternatives:', error);
    return [];
  }
}
