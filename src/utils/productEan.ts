const ALLOWED_EAN_LENGTHS = [8, 12, 13, 14] as const;

export const normalizeEan = (value: string): string => value.replace(/\D/g, '');

export const isValidEanLength = (value: string): boolean => {
  const normalized = normalizeEan(value);
  if (!normalized) {
    return true;
  }
  return ALLOWED_EAN_LENGTHS.includes(normalized.length as (typeof ALLOWED_EAN_LENGTHS)[number]);
};

export const EAN_INVALID_MESSAGE =
  'EAN/GTIN inválido. Informe um código com 8, 12, 13 ou 14 dígitos.';
