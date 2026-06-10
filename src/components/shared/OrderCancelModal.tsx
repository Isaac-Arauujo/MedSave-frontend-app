import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const cancelOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Informe um motivo com pelo menos 5 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
});

type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

interface OrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onConfirm: (reason: string) => Promise<void>;
  description?: string;
}

export const OrderCancelModal = ({
  isOpen,
  onClose,
  isSubmitting = false,
  onConfirm,
  description = 'Informe o motivo do cancelamento. Essa mensagem será enviada ao cliente.',
}: OrderCancelModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: { reason: '' },
  });

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    reset({ reason: '' });
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    await onConfirm(data.reason.trim());
    reset({ reason: '' });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancelar pedido"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={() => void onSubmit()}
            isLoading={isSubmitting}
          >
            Confirmar cancelamento
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <p className="text-sm text-on-surface-variant">{description}</p>
        <Input
          label="Motivo do cancelamento"
          placeholder="Ex: Produto indisponível no estoque"
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
};
