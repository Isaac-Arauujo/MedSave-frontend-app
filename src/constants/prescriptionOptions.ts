export const PRESCRIPTION_TYPE_OPTIONS = [
  { value: 'NONE', label: 'Sem receita' },
  { value: 'SIMPLE', label: 'Receita simples' },
  { value: 'ANTIBIOTIC', label: 'Antibiótico' },
  { value: 'RETAINED', label: 'Receita retida' },
  { value: 'CONTROLLED_C1', label: 'Controlado C1' },
  { value: 'CONTROLLED_C5', label: 'Controlado C5' },
  { value: 'CONTROLLED_OTHER', label: 'Controlado (outros)' },
] as const;

export const getPrescriptionTypeLabel = (type: string): string =>
  PRESCRIPTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

export const PRESCRIPTION_REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
  CANCELLED: 'Cancelada',
};

export const PRESCRIPTION_REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  NOT_REQUIRED: 'Não exigida',
  REQUIRED_NOT_UPLOADED: 'Receita necessária',
  PENDING: 'Receita enviada',
  UNDER_REVIEW: 'Receita em análise',
  APPROVED: 'Receita aprovada',
  REJECTED: 'Receita recusada',
};

export const getPrescriptionReviewStatusLabel = (status: string): string =>
  PRESCRIPTION_REVIEW_STATUS_LABELS[status] ?? status;

export const getPrescriptionRequirementStatusLabel = (status: string): string =>
  PRESCRIPTION_REQUIREMENT_STATUS_LABELS[status] ?? status;
