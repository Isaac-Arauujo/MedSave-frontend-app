import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, 'Informe uma observação com pelo menos 5 caracteres')
    .max(1000, 'Observação deve ter no máximo 1000 caracteres'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface AdminOrderNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onConfirm: (note: string) => Promise<void>;
}

export const AdminOrderNoteModal = ({
  isOpen,
  onClose,
  isSubmitting = false,
  onConfirm,
}: AdminOrderNoteModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
  });

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    reset({ note: '' });
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    await onConfirm(data.note.trim());
    reset({ note: '' });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar observação interna"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void onSubmit()} isLoading={isSubmitting}>
            Salvar observação
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <p className="text-sm text-on-surface-variant">
          Essa observação será visível apenas para administradores.
        </p>
        <Input
          label="Observação interna *"
          placeholder="Ex: Cliente entrou em contato pelo suporte."
          error={errors.note?.message}
          {...register('note')}
        />
      </form>
    </Modal>
  );
};
