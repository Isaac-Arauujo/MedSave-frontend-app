import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateListingRequest, ListingResponse } from '../../types/ListingTypes';
import type { ProductResponse } from '../../types/ProductTypes';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

const listingSchema = z
  .object({
    productId: z.coerce.number().min(1, 'Selecione um produto'),
    originalPrice: z.coerce.number().positive('Preço original deve ser maior que zero'),
    discountPrice: z.coerce.number().positive('Preço com desconto deve ser maior que zero'),
    expirationDate: z.string().min(1, 'Data de validade é obrigatória'),
    stock: z.coerce.number().int('Estoque deve ser um número inteiro').min(1, 'Estoque mínimo: 1'),
  })
  .refine((data) => data.discountPrice <= data.originalPrice, {
    message: 'Preço com desconto não pode ser maior que o original',
    path: ['discountPrice'],
  });

type ListingFormData = z.input<typeof listingSchema>;

interface PharmacyListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductResponse[];
  isProductsLoading?: boolean;
  initialListing?: ListingResponse;
  onSubmit: (data: CreateListingRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: ListingFormData = {
  productId: 0,
  originalPrice: 0,
  discountPrice: 0,
  expirationDate: '',
  stock: 1,
};

export const PharmacyListingFormModal = ({
  isOpen,
  onClose,
  products,
  isProductsLoading = false,
  initialListing,
  onSubmit,
  isSubmitting = false,
}: PharmacyListingFormModalProps) => {
  const isEditing = Boolean(initialListing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEditing && isProductsLoading) {
      return;
    }

    if (initialListing) {
      reset({
        productId: initialListing.product.id,
        originalPrice: initialListing.originalPrice,
        discountPrice: initialListing.discountPrice,
        expirationDate: initialListing.expirationDate.slice(0, 10),
        stock: initialListing.availableStock,
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, initialListing, isEditing, isProductsLoading, reset]);

  const handleFormSubmit = async (data: ListingFormData) => {
    const parsed = listingSchema.parse(data);
    await onSubmit({
      productId: parsed.productId,
      originalPrice: parsed.originalPrice,
      discountPrice: parsed.discountPrice,
      expirationDate: parsed.expirationDate,
      stock: parsed.stock,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar anúncio' : 'Novo anúncio'}
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
            {isEditing ? 'Salvar alterações' : 'Criar anúncio'}
          </Button>
        </>
      }
    >
      <form
        className="relative grid gap-4"
        onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}
      >
        {isProductsLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface-container-lowest/80"
            aria-busy="true"
          >
            <Spinner size="lg" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="productId" className="text-sm font-medium text-on-surface">
            Produto
          </label>
          <select
            id="productId"
            {...register('productId', { valueAsNumber: true })}
            disabled={isEditing || isProductsLoading}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!isEditing && <option value={0}>Selecione um produto</option>}
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="text-sm text-[var(--color-danger)]">{errors.productId.message}</p>
          )}
        </div>

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
          min="1"
          step="1"
          error={errors.stock?.message}
          {...register('stock')}
        />
      </form>
    </Modal>
  );
};
