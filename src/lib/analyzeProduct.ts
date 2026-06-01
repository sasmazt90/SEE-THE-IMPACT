import { ProductData, AlternativeBrand } from '@/types/product';

export async function analyzeProduct(
  productName: string,
  barcode?: string,
  imageData?: string,
): Promise<ProductData> {
  const response = await fetch('/api/analyze-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productName, barcode, imageData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to analyze product');
  }

  const data = await response.json();
  return data as ProductData;
}

export async function analyzeProductImage(imageData: string): Promise<ProductData> {
  return analyzeProduct('', undefined, imageData);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

export function validateProductImageFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 8 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WEBP image.');
  }

  if (file.size > maxSize) {
    throw new Error('Image must be smaller than 8MB.');
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
