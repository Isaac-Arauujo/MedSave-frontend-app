import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import * as pharmacyProductApi from '../../api/pharmacyProductApi';
import type { CreateListingRequest, ListingResponse } from '../../types/ListingTypes';
import type { PharmacyProductSummary } from '../../types/ProductTypes';
import { handleApiError } from '../../utils/handleApiError';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { ProductMasterSearchSelect } from './ProductMasterSearchSelect';

const listingSchema = z
  .object({
    productId: z.coerce.number().min(1, 'Selecione um produto do catálogo mestre.'),
    batchNumber: z
      .string()
      .trim()
      .min(1, 'Informe o lote do medicamento.')
      .max(80, 'Lote deve ter no máximo 80 caracteres.')
      .regex(/^[A-Za-z0-9\-/. ]+$/, 'Lote contém caracteres inválidos.'),
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
  initialListing?: ListingResponse;
  onSubmit: (data: CreateListingRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: ListingFormData = {
  productId: 0,
  batchNumber: '',
  originalPrice: 0,
  discountPrice: 0,
  expirationDate: '',
  stock: 1,
};

export const PharmacyListingFormModal = ({
  isOpen,
  onClose,
  initialListing,
  onSubmit,
  isSubmitting = false,
}: PharmacyListingFormModalProps) => {
  const isEditing = Boolean(initialListing);
  const [selectedProduct, setSelectedProduct] = useState<PharmacyProductSummary | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedProduct(null);
      setProductLoadError(null);
      return;
    }

    if (initialListing) {
      reset({
        productId: initialListing.product.id,
        batchNumber: initialListing.batchNumber ?? '',
        originalPrice: initialListing.originalPrice,
        discountPrice: initialListing.discountPrice,
        expirationDate: initialListing.expirationDate.slice(0, 10),
        stock: initialListing.availableStock,
      });

      let isMounted = true;
      setIsProductLoading(true);
      setProductLoadError(null);

      void pharmacyProductApi
        .getPharmacyProduct(initialListing.product.id)
        .then((product) => {
          if (isMounted) {
            setSelectedProduct(product);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setProductLoadError(handleApiError(err));
            setSelectedProduct({
              id: initialListing.product.id,
              name: initialListing.product.name,
              activeIngredient: initialListing.product.activeIngredient,
              category: initialListing.product.category ?? 'OTHER',
              requiresPrescription: initialListing.product.requiresPrescription ?? false,
              allowOnlineSale: true,
              imageUrl: initialListing.product.images?.[0],
            });
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsProductLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }

    reset(emptyValues);
    setSelectedProduct(null);
    setProductLoadError(null);
  }, [isOpen, initialListing, reset]);

  const handleProductChange = (product: PharmacyProductSummary | null) => {
    setSelectedProduct(product);
    setValue('productId', product?.id ?? 0, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: ListingFormData) => {
    const parsed = listingSchema.parse(data);
    await onSubmit({
      productId: parsed.productId,
      batchNumber: parsed.batchNumber.trim(),
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
      size="lg"
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
        {isProductLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface-container-lowest/80"
            aria-busy="true"
          >
            <Spinner size="lg" />
          </div>
        )}

        <input type="hidden" {...register('productId', { valueAsNumber: true })} />

        <ProductMasterSearchSelect
          value={selectedProduct}
          onChange={handleProductChange}
          disabled={isEditing}
          error={errors.productId?.message}
        />

        {productLoadError && isEditing && (
          <p className="text-sm text-on-surface-variant" role="status">
            {productLoadError}
          </p>
        )}

        <div>
          <Input
            label="Lote do medicamento"
            placeholder="Ex: ABC123"
            maxLength={80}
            error={errors.batchNumber?.message}
            {...register('batchNumber')}
          />
          <p className="mt-1 text-xs text-on-surface-variant">
            Informe o lote impresso na embalagem. Ele será usado para rastreabilidade e importação por
            planilha.
          </p>
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
