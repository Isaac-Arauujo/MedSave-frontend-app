import type { ProductCategory } from '../types/ProductTypes';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'ANALGESIC', label: 'Analgésico' },
  { value: 'ANTIBIOTIC', label: 'Antibiótico' },
  { value: 'ANTIHYPERTENSIVE', label: 'Anti-hipertensivo' },
  { value: 'VITAMIN', label: 'Vitamina' },
  { value: 'DERMATOLOGY', label: 'Dermatológico' },
  { value: 'OTHER', label: 'Outro' },
];

export const getCategoryLabel = (category: ProductCategory): string =>
  PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
