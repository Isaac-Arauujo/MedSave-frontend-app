export const PRESCRIPTION_REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
  CANCELLED: 'Cancelada',
};

export const getPrescriptionReviewStatusLabel = (status: string): string =>
  PRESCRIPTION_REVIEW_STATUS_LABELS[status] ?? status;
