import { useEffect, useMemo, useState } from 'react';
import { getPrescriptionFileBlob } from '../../api/prescriptionApi';
import { getPrescriptionReviewStatusLabel } from '../../constants/prescriptionOptions';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import type { PharmacyPrescriptionReviewDetail } from '../../types/PrescriptionTypes';
import { formatDate } from '../../utils/formatDate';
import { handleApiError } from '../../utils/handleApiError';

interface PrescriptionReviewModalProps {
  review: PharmacyPrescriptionReviewDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onApprove: (reviewId: number) => Promise<void>;
  onReject: (reviewId: number, reason: string) => Promise<void>;
}

const statusBadgeVariant = (status: PharmacyPrescriptionReviewDetail['status']) => {
  switch (status) {
    case 'APPROVED':
      return 'success' as const;
    case 'REJECTED':
      return 'danger' as const;
    case 'UNDER_REVIEW':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

export const PrescriptionReviewModal = ({
  review,
  isOpen,
  isLoading,
  isSubmitting,
  onClose,
  onApprove,
  onReject,
}: PrescriptionReviewModalProps) => {
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const canDecide = review?.status === 'PENDING' || review?.status === 'UNDER_REVIEW';
  const isReasonValid = reason.trim().length >= 5 && reason.trim().length <= 500;
  const actionsEnabled = responsibilityAccepted && canDecide && !isSubmitting;

  useEffect(() => {
    if (!isOpen) {
      setResponsibilityAccepted(false);
      setReason('');
      setReasonError(null);
      setPreviewError(null);
      setPreviewUrl(null);
      return;
    }
  }, [isOpen, review?.reviewId]);

  useEffect(() => {
    if (!isOpen || !review) {
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const loadPreview = async () => {
      try {
        setIsPreviewLoading(true);
        setPreviewError(null);
        const blob = await getPrescriptionFileBlob(review.documentId);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setPreviewError(handleApiError(err));
          setPreviewUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, review?.documentId]);

  const previewContent = useMemo(() => {
    if (!review) {
      return null;
    }

    if (isPreviewLoading) {
      return (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low">
          <Spinner />
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {previewError}
        </div>
      );
    }

    if (!previewUrl) {
      return null;
    }

    if (review.mimeType.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt={`Receita ${review.originalFileName}`}
          className="max-h-[420px] w-full rounded-xl border border-outline-variant object-contain"
        />
      );
    }

    if (review.mimeType === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          title={`Receita ${review.originalFileName}`}
          className="h-[420px] w-full rounded-xl border border-outline-variant bg-white"
        />
      );
    }

    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
        Pré-visualização indisponível para este tipo de arquivo. Use o botão Baixar receita.
      </div>
    );
  }, [isPreviewLoading, previewError, previewUrl, review]);

  const handleReject = async () => {
    if (!review) {
      return;
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setReasonError('Informe o motivo da recusa.');
      return;
    }
    if (trimmedReason.length > 500) {
      setReasonError('O motivo deve ter entre 5 e 500 caracteres.');
      return;
    }

    setReasonError(null);
    await onReject(review.reviewId, trimmedReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisar receita"
      size="xl"
      layout="sheet"
      footer={
        canDecide ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void handleReject()}
              disabled={!actionsEnabled || !isReasonValid}
            >
              Recusar receita
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => review && void onApprove(review.reviewId)}
              disabled={!actionsEnabled}
            >
              Aprovar receita
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        )
      }
    >
      {isLoading || !review ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-on-surface-variant">Produto</p>
              <p className="font-medium text-on-surface">{review.productName}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Cliente</p>
              <p className="font-medium text-on-surface">{review.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Status</p>
              <Badge variant={statusBadgeVariant(review.status)}>
                {getPrescriptionReviewStatusLabel(review.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Data de envio</p>
              <p className="font-medium text-on-surface">{formatDate(review.uploadedAt)}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-on-surface">Arquivo da receita</p>
            <p className="mb-3 text-sm text-on-surface-variant">
              {review.originalFileName} ({review.mimeType})
            </p>
            {previewContent}
          </div>

          {canDecide && (
            <>
              <div className="rounded-2xl border border-warning/30 bg-amber-50 p-4">
                <p className="font-headline text-base font-bold text-on-surface">Atenção</p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  A análise desta receita deve ser realizada por profissional habilitado da farmácia.
                  Ao aprovar ou recusar, você confirma que verificou as informações da prescrição,
                  validade, legibilidade, medicamento, quantidade e demais critérios aplicáveis à
                  dispensação. Sua decisão ficará registrada com data, hora, usuário responsável e
                  farmácia vinculada.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-outline-variant p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-outline-variant"
                  checked={responsibilityAccepted}
                  onChange={(event) => setResponsibilityAccepted(event.target.checked)}
                />
                <span className="text-sm text-on-surface">
                  Declaro que sou responsável pela análise desta receita e que realizei a conferência
                  necessária.
                </span>
              </label>

              <div>
                <Input
                  label="Motivo da recusa"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setReasonError(null);
                  }}
                  placeholder="Descreva o motivo da recusa"
                  error={reasonError ?? undefined}
                />
              </div>
            </>
          )}

          {review.rejectionReason && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <p className="text-sm font-medium text-on-surface">Motivo da recusa</p>
              <p className="mt-1 text-sm text-on-surface-variant">{review.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
