export type ProductCategory =
  | 'ANALGESIC'
  | 'ANTIBIOTIC'
  | 'ANTIHYPERTENSIVE'
  | 'VITAMIN'
  | 'DERMATOLOGICAL';

export interface ProductResponse {
  id: number;
  name: string;
  activeIngredient?: string;
  category: ProductCategory;
  requiresPrescription: boolean;
  images: string[];
  active: boolean;
}

export interface CreateProductRequest {
  name: string;
  activeIngredient?: string;
  category: ProductCategory;
  requiresPrescription: boolean;
  images: string[];
}

export interface UpdateProductRequest {
  name?: string;
  activeIngredient?: string;
  category?: ProductCategory;
  requiresPrescription?: boolean;
  images?: string[];
  active?: boolean;
}

export interface UploadedProductImage {
  url: string;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
}

export interface ProductImageUploadResponse {
  images: UploadedProductImage[];
}
