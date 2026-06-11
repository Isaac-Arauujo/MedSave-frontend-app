import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadPrescription } from '../../api/prescriptionApi';
import { getPrescriptionRequirementStatusLabel } from '../../constants/prescriptionOptions';
import type { CartItemResponse } from '../../types/CartTypes';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { handleApiError } from '../../utils/handleApiError';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

interface PrescriptionUploadCardProps {
  item: CartItemResponse;
  checkoutSessionToken?: string;
  resumeFromEmail?: boolean;
  onUploadSuccess: () => Promise<void> | void;
  onRemoveItem: () => Promise<void> | void;
  isRemoving?: boolean;
}

const statusBadgeVariant = (status?: CartItemResponse['prescriptionStatus']) => {
  switch (status) {
    case 'APPROVED':
      return 'success' as const;
    case 'REJECTED':
      return 'danger' as const;
    case 'PENDING':
    case 'UNDER_REVIEW':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

const validateFile = (file: File): string | null => {
  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ACCEPTED_MIME_TYPES.includes(file.type);

  if (!hasValidExtension && !hasValidMime) {
    return 'Arquivo inválido. Envie JPG, PNG ou PDF.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Arquivo excede o limite máximo permitido.';
  }

  return null;
};

export const PrescriptionUploadCard = ({
  item,
  checkoutSessionToken,
  resumeFromEmail = false,
  onUploadSuccess,
  onRemoveItem,
  isRemoving = false,
}: PrescriptionUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAcknowledged, setUploadAcknowledged] = useState(false);

  const status = item.prescriptionStatus ?? 'REQUIRED_NOT_UPLOADED';
  const canUploadAgain =
    status === 'REQUIRED_NOT_UPLOADED' ||
    status === 'PENDING' ||
    status === 'UNDER_REVIEW' ||
    status === 'REJECTED';
  const canRemove =
    status === 'PENDING' ||
    status === 'UNDER_REVIEW' ||
    status === 'REJECTED' ||
    status === 'REQUIRED_NOT_UPLOADED';
  const showUploadConfirmation =
    uploadAcknowledged || status === 'PENDING' || status === 'UNDER_REVIEW';

  const handleSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsUploading(true);
      await uploadPrescription({
        file,
        listingId: item.listingId,
        checkoutSessionToken,
      });
      setUploadAcknowledged(true);
      toast.success('Receita enviada para análise da farmácia.');
      await onUploadSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>Você já pode continuar com o pagamento.</p>
            {resumeFromEmail && (
              <p className="font-medium text-on-surface">
                Sua receita foi aprovada. Finalize o pedido para continuar.
              </p>
            )}
          </div>
        );
      case 'PENDING':
      case 'UNDER_REVIEW':
        return (
          <div className="space-y-2 text-sm text-on-surface-variant">
            <p>Aguardando análise da farmácia.</p>
            <p>
              Você será avisado por e-mail quando a receita for aprovada ou recusada.
            </p>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="space-y-2 text-sm text-on-surface-variant">
            {item.prescriptionRejectionReason && (
              <p>
                <span className="font-medium text-on-surface">Motivo:</span>{' '}
                {item.prescriptionRejectionReason}
              </p>
            )}
            <p>Envie uma nova receita válida ou remova o item para continuar.</p>
          </div>
        );
      default:
        return (
          <p className="text-sm text-on-surface-variant">
            Envie uma foto ou PDF da receita para que a farmácia possa analisar.
          </p>
        );
    }
  };

  return (
    <article className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-headline text-base font-semibold text-on-surface">
            {item.productName}
          </h3>
          <p className="mt-1 text-sm font-medium text-on-surface">
            {getPrescriptionRequirementStatusLabel(status)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(status)} className="self-start">
          {getPrescriptionRequirementStatusLabel(status)}
        </Badge>
      </div>

      {showUploadConfirmation && (
        <div
          className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface"
          role="status"
        >
          <p className="font-medium">Receita enviada para análise.</p>
          <p className="mt-2 text-on-surface-variant">
            A farmácia irá analisar sua receita. Você receberá o resultado por e-mail.
          </p>
          <p className="mt-2 text-on-surface-variant">
            Verifique também sua caixa de spam, promoções e lixo eletrônico.
          </p>
          <p className="mt-2 text-on-surface-variant">
            Enquanto a receita estiver em análise, sua compra ficará aguardando e você poderá
            voltar para continuar depois.
          </p>
        </div>
      )}

      {renderStatusMessage()}

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canUploadAgain && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(event) => void handleSelectFile(event)}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {status === 'REQUIRED_NOT_UPLOADED' ? 'Enviar receita' : 'Enviar nova receita'}
            </Button>
          </>
        )}

        {canRemove && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            isLoading={isRemoving}
            onClick={() => void onRemoveItem()}
          >
            Remover item
          </Button>
        )}
      </div>
    </article>
  );
};
