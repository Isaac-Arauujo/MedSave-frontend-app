import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import type { CreateProductRequest, ProductResponse } from '../../types/ProductTypes';
import { ProductImageUploader } from '../admin/ProductImageUploader';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  activeIngredient: z.string().optional(),
  category: z.enum([
    'ANALGESIC',
    'ANTIBIOTIC',
    'ANTIHYPERTENSIVE',
    'VITAMIN',
    'DERMATOLOGICAL',
  ]),
  requiresPrescription: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ProductResponse;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: ProductFormData = {
  name: '',
  activeIngredient: '',
  category: 'ANALGESIC',
  requiresPrescription: false,
};

export const ProductFormModal = ({
  isOpen,
  onClose,
  initialProduct,
  onSubmit,
  isSubmitting = false,
}: ProductFormModalProps) => {
  const isEditing = Boolean(initialProduct);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialProduct) {
      reset({
        name: initialProduct.name,
        activeIngredient: initialProduct.activeIngredient ?? '',
        category: initialProduct.category,
        requiresPrescription: initialProduct.requiresPrescription,
      });
      setImageUrls(initialProduct.images ?? []);
    } else {
      reset(emptyValues);
      setImageUrls([]);
    }
  }, [isOpen, initialProduct, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit({
      name: data.name,
      activeIngredient: data.activeIngredient?.trim() || undefined,
      category: data.category,
      requiresPrescription: data.requiresPrescription,
      images: imageUrls,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar produto' : 'Novo produto'}
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
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}>
        <Input
          label="Nome"
          error={errors.name?.message}
          className="sm:col-span-2"
          {...register('name')}
        />

        <Input
          label="Princípio ativo"
          error={errors.activeIngredient?.message}
          className="sm:col-span-2"
          {...register('activeIngredient')}
        />

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="category" className="text-sm font-medium text-on-surface">
            Categoria
          </label>
          <select
            id="category"
            {...register('category')}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-[var(--color-danger)]">{errors.category.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
            {...register('requiresPrescription')}
          />
          <span className="text-sm text-on-surface">Requer receita médica</span>
        </label>

        <ProductImageUploader
          value={imageUrls}
          onChange={setImageUrls}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
};
