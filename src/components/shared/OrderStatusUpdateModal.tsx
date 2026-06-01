import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const statusUpdateSchema = z.object({
  reason: z.string().optional(),
});

type StatusUpdateFormData = z.input<typeof statusUpdateSchema>;

interface OrderStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  onConfirm: (reason?: string) => Promise<void>;
}

export const OrderStatusUpdateModal = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  onConfirm,
}: OrderStatusUpdateModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusUpdateFormData>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: { reason: '' },
  });

  const handleClose = () => {
    reset({ reason: '' });
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    await onConfirm(data.reason?.trim() || undefined);
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
          label="Motivo (opcional)"
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
};
