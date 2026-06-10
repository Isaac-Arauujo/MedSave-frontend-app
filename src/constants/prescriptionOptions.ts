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
