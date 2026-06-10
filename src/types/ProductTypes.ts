export type ProductCategory =
  | 'ANALGESIC'
  | 'ANTIBIOTIC'
  | 'ANTIHYPERTENSIVE'
  | 'VITAMIN'
  | 'DERMATOLOGY'
  | 'OTHER';

export type PrescriptionType =
  | 'NONE'
  | 'SIMPLE'
  | 'RETAINED'
  | 'ANTIBIOTIC'
  | 'CONTROLLED_C1'
  | 'CONTROLLED_C5'
  | 'CONTROLLED_OTHER';

export interface ProductResponse {
  id: number;
  name: string;
  activeIngredient?: string;
  category: ProductCategory;
  requiresPrescription: boolean;
  prescriptionType?: PrescriptionType;
  requiresPharmacistReview?: boolean;
  allowOnlineSale?: boolean;
  allowDeliveryWithPrescription?: boolean;
  allowPickupWithPrescription?: boolean;
  requiresOriginalPrescriptionAtPickup?: boolean;
  images: string[];
  active: boolean;
}

export interface CreateProductRequest {
  name: string;
  activeIngredient?: string;
  category: ProductCategory;
  requiresPrescription: boolean;
  prescriptionType?: PrescriptionType;
  requiresPharmacistReview?: boolean;
  allowOnlineSale?: boolean;
  allowDeliveryWithPrescription?: boolean;
  allowPickupWithPrescription?: boolean;
  requiresOriginalPrescriptionAtPickup?: boolean;
  images: string[];
}

export interface UpdateProductRequest {
  name?: string;
  activeIngredient?: string;
  category?: ProductCategory;
  requiresPrescription?: boolean;
  prescriptionType?: PrescriptionType;
  requiresPharmacistReview?: boolean;
  allowOnlineSale?: boolean;
  allowDeliveryWithPrescription?: boolean;
  allowPickupWithPrescription?: boolean;
  requiresOriginalPrescriptionAtPickup?: boolean;
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
