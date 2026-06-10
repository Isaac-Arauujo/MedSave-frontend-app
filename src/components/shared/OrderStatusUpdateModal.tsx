import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const statusUpdateSchema = z.object({
  reason: z.string().optional(),
});

const requiredReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Informe um motivo com pelo menos 5 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
});

type StatusUpdateFormData = z.input<typeof statusUpdateSchema>;
type RequiredReasonFormData = z.infer<typeof requiredReasonSchema>;

interface OrderStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  requireReason?: boolean;
  onConfirm: (reason?: string) => Promise<void>;
}

export const OrderStatusUpdateModal = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  requireReason = false,
  onConfirm,
}: OrderStatusUpdateModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusUpdateFormData | RequiredReasonFormData>({
    resolver: zodResolver(requireReason ? requiredReasonSchema : statusUpdateSchema),
    defaultValues: { reason: '' },
  });

  const handleClose = () => {
    reset({ reason: '' });
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    const reason = data.reason?.trim();
    await onConfirm(requireReason ? reason : reason || undefined);
    reset({ reason: '' });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void onSubmit()} isLoading={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <p className="text-sm text-on-surface-variant">{description}</p>
        <Input
          label={requireReason ? 'Motivo da intervenção *' : 'Motivo (opcional)'}
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
};
