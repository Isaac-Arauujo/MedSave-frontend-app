import type { ProductResponse } from '../types/ProductTypes';

export const getProductPrescriptionLabel = (product: ProductResponse): string => {
  if (!product.requiresPrescription) {
    return 'Sem receita';
  }

  switch (product.prescriptionType) {
    case 'SIMPLE':
      return 'Receita simples';
    case 'ANTIBIOTIC':
      return 'Antibiótico';
    case 'RETAINED':
      return 'Retida';
    case 'CONTROLLED_C1':
    case 'CONTROLLED_C5':
    case 'CONTROLLED_OTHER':
      return 'Controlado';
    default:
      return 'Com receita';
  }
};
