import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ListingResponse, UpdateListingRequest } from '../../types/ListingTypes';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const adminListingSchema = z
  .object({
    originalPrice: z.coerce.number().positive('Preço original deve ser maior que zero'),
    discountPrice: z.coerce.number().positive('Preço com desconto deve ser maior que zero'),
    expirationDate: z.string().min(1, 'Data de validade é obrigatória'),
    stock: z.coerce.number().int('Estoque deve ser um número inteiro').min(0, 'Estoque mínimo: 0'),
    active: z.boolean(),
  })
  .refine((data) => data.discountPrice <= data.originalPrice, {
    message: 'Preço com desconto não pode ser maior que o original',
    path: ['discountPrice'],
  });

type AdminListingFormData = z.input<typeof adminListingSchema>;

interface AdminListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingResponse | null;
  onSubmit: (data: UpdateListingRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const AdminListingFormModal = ({
  isOpen,
  onClose,
  listing,
  onSubmit,
  isSubmitting = false,
}: AdminListingFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminListingFormData>({
    resolver: zodResolver(adminListingSchema),
    defaultValues: {
      originalPrice: 0,
      discountPrice: 0,
      expirationDate: '',
      stock: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (!isOpen || !listing) {
      return;
    }

    reset({
      originalPrice: listing.originalPrice,
      discountPrice: listing.discountPrice,
      expirationDate: listing.expirationDate.slice(0, 10),
      stock: listing.availableStock,
      active: listing.active,
    });
  }, [isOpen, listing, reset]);

  const handleFormSubmit = async (data: AdminListingFormData) => {
    const parsed = adminListingSchema.parse(data);
    await onSubmit({
      originalPrice: parsed.originalPrice,
      discountPrice: parsed.discountPrice,
      expirationDate: parsed.expirationDate,
      stock: parsed.stock,
      active: parsed.active,
    });
  };

  if (!listing) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar anúncio"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSubmit(handleFormSubmit)()}
            isLoading={isSubmitting}
          >
            Salvar alterações
          </Button>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}>
        <p className="text-sm text-on-surface-variant">
          {listing.product.name} · {listing.pharmacy.name}
        </p>

        <Input
          label="Preço original (R$)"
          type="number"
          step="0.01"
          min="0"
          error={errors.originalPrice?.message}
          {...register('originalPrice')}
        />

        <Input
          label="Preço com desconto (R$)"
          type="number"
          step="0.01"
          min="0"
          error={errors.discountPrice?.message}
          {...register('discountPrice')}
        />

        <Input
          label="Data de validade"
          type="date"
          error={errors.expirationDate?.message}
          {...register('expirationDate')}
        />

        <Input
          label="Estoque disponível"
          type="number"
          min="0"
          step="1"
          error={errors.stock?.message}
          {...register('stock')}
        />

        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4 rounded text-primary" {...register('active')} />
          <span className="text-sm font-medium text-on-surface">Anúncio ativo</span>
        </label>
      </form>
    </Modal>
  );
};
