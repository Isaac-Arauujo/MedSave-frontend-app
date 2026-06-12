import type { ListingProductSummary } from '../types/ListingTypes';
import type { PrescriptionType } from '../types/ProductTypes';
import { getProductPrescriptionLabel } from './productPrescriptionLabel';

export const DEFAULT_SAFETY_NOTICE =
  'As informações deste produto não substituem a orientação de um profissional de saúde. Consulte a bula antes de usar.';

export const getListingSubtitle = (product: ListingProductSummary): string | null => {
  const parts = [product.manufacturer, product.presentation ?? product.dosage].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
};

export const getPrescriptionBadgeVariant = (
  product: Pick<ListingProductSummary, 'requiresPrescription' | 'prescriptionType'>
): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (!product.requiresPrescription) {
    return 'success';
  }

  switch (product.prescriptionType) {
    case 'RETAINED':
    case 'CONTROLLED_C1':
    case 'CONTROLLED_C5':
    case 'CONTROLLED_OTHER':
      return 'danger';
    case 'ANTIBIOTIC':
    case 'SIMPLE':
      return 'warning';
    default:
      return 'warning';
  }
};

export const getListingPrescriptionLabel = (product: {
  requiresPrescription?: boolean;
  prescriptionType?: PrescriptionType;
}): string => {
  return getProductPrescriptionLabel({
    requiresPrescription: product.requiresPrescription ?? false,
    prescriptionType: product.prescriptionType,
  });
};

export const getListingRestrictionNotes = (
  product: ListingProductSummary
): string[] => {
  const notes: string[] = [];

  if (product.requiresPharmacistReview) {
    notes.push('Análise da farmácia necessária antes da dispensação.');
  }

  if (product.requiresPrescription && product.allowPickupWithPrescription === false) {
    notes.push('Apenas retirada na farmácia não está disponível para este medicamento.');
  } else if (product.requiresPrescription && product.allowDeliveryWithPrescription === false) {
    notes.push('Entrega não disponível para este medicamento com receita.');
  }

  if (product.requiresOriginalPrescriptionAtPickup) {
    notes.push('É necessário apresentar a receita original na retirada.');
  }

  if (product.allowOnlineSale === false) {
    notes.push('Produto indisponível para venda online.');
  }

  return notes;
};

export const getStockLabel = (availableStock: number): string => {
  if (availableStock <= 0) {
    return 'Indisponível';
  }
  if (availableStock <= 3) {
    return `Últimas ${availableStock} unidade(s)`;
  }
  return `${availableStock} unidade(s) disponível(is)`;
};

export interface ProductDetailField {
  label: string;
  value: string;
}

export const getProductDetailFields = (product: ListingProductSummary): ProductDetailField[] => {
  const fields: ProductDetailField[] = [];

  const addField = (label: string, value?: string | null) => {
    if (value?.trim()) {
      fields.push({ label, value: value.trim() });
    }
  };

  addField('Princípio ativo', product.activeIngredient);
  addField('Dosagem', product.dosage);
  addField('Forma farmacêutica', product.pharmaceuticalForm);
  addField('Apresentação', product.presentation);
  addField('Quantidade', product.packageQuantity);
  addField('Via de administração', product.administrationRoute);
  addField('Classe terapêutica', product.therapeuticClass);
  addField('Composição', product.composition);

  return fields;
};

export const getRegulatoryDetailFields = (product: ListingProductSummary): ProductDetailField[] => {
  const fields: ProductDetailField[] = [];

  const addField = (label: string, value?: string | null) => {
    if (value?.trim()) {
      fields.push({ label, value: value.trim() });
    }
  };

  addField('Registro MS/Anvisa', product.msRegistration);
  addField('EAN/GTIN', product.ean);

  return fields;
};

export const getSafetyNotice = (product: ListingProductSummary): string => {
  return product.safetyNotice?.trim() || DEFAULT_SAFETY_NOTICE;
};
