import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { PRESCRIPTION_TYPE_OPTIONS } from '../../constants/prescriptionOptions';
import type { CreateProductRequest, PrescriptionType, ProductResponse } from '../../types/ProductTypes';
import { ProductImageUploader } from '../admin/ProductImageUploader';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const prescriptionTypeSchema = z.enum([
  'NONE',
  'SIMPLE',
  'RETAINED',
  'ANTIBIOTIC',
  'CONTROLLED_C1',
  'CONTROLLED_C5',
  'CONTROLLED_OTHER',
]);

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  activeIngredient: z.string().optional(),
  category: z.enum([
    'ANALGESIC',
    'ANTIBIOTIC',
    'ANTIHYPERTENSIVE',
    'VITAMIN',
    'DERMATOLOGY',
    'OTHER',
  ]),
  requiresPrescription: z.boolean(),
  prescriptionType: prescriptionTypeSchema,
  requiresPharmacistReview: z.boolean(),
  allowOnlineSale: z.boolean(),
  allowDeliveryWithPrescription: z.boolean(),
  allowPickupWithPrescription: z.boolean(),
  requiresOriginalPrescriptionAtPickup: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ProductResponse;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const getDefaultsForPrescriptionType = (
  type: PrescriptionType,
  requiresPrescription: boolean
): Pick<
  ProductFormData,
  | 'requiresPrescription'
  | 'requiresPharmacistReview'
  | 'allowOnlineSale'
  | 'allowDeliveryWithPrescription'
  | 'allowPickupWithPrescription'
  | 'requiresOriginalPrescriptionAtPickup'
> => {
  if (!requiresPrescription || type === 'NONE') {
    return {
      requiresPrescription: false,
      requiresPharmacistReview: false,
      allowOnlineSale: true,
      allowDeliveryWithPrescription: true,
      allowPickupWithPrescription: true,
      requiresOriginalPrescriptionAtPickup: false,
    };
  }

  switch (type) {
    case 'RETAINED':
    case 'CONTROLLED_C1':
    case 'CONTROLLED_C5':
      return {
        requiresPrescription: true,
        requiresPharmacistReview: true,
        allowOnlineSale: true,
        allowDeliveryWithPrescription: false,
        allowPickupWithPrescription: true,
        requiresOriginalPrescriptionAtPickup: true,
      };
    case 'CONTROLLED_OTHER':
      return {
        requiresPrescription: true,
        requiresPharmacistReview: true,
        allowOnlineSale: false,
        allowDeliveryWithPrescription: false,
        allowPickupWithPrescription: false,
        requiresOriginalPrescriptionAtPickup: true,
      };
    default:
      return {
        requiresPrescription: true,
        requiresPharmacistReview: true,
        allowOnlineSale: true,
        allowDeliveryWithPrescription: true,
        allowPickupWithPrescription: true,
        requiresOriginalPrescriptionAtPickup: false,
      };
  }
};

const emptyValues: ProductFormData = {
  name: '',
  activeIngredient: '',
  category: 'ANALGESIC',
  requiresPrescription: false,
  prescriptionType: 'NONE',
  requiresPharmacistReview: false,
  allowOnlineSale: true,
  allowDeliveryWithPrescription: true,
  allowPickupWithPrescription: true,
  requiresOriginalPrescriptionAtPickup: false,
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
  const skipPrescriptionDefaultsRef = useRef(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  const requiresPrescription = watch('requiresPrescription');
  const prescriptionType = watch('prescriptionType');

  useEffect(() => {
    if (!isOpen) {
      skipPrescriptionDefaultsRef.current = true;
      return;
    }

    if (initialProduct) {
      reset({
        name: initialProduct.name,
        activeIngredient: initialProduct.activeIngredient ?? '',
        category: initialProduct.category,
        requiresPrescription: initialProduct.requiresPrescription,
        prescriptionType: initialProduct.prescriptionType ?? 'NONE',
        requiresPharmacistReview: initialProduct.requiresPharmacistReview ?? false,
        allowOnlineSale: initialProduct.allowOnlineSale ?? true,
        allowDeliveryWithPrescription: initialProduct.allowDeliveryWithPrescription ?? true,
        allowPickupWithPrescription: initialProduct.allowPickupWithPrescription ?? true,
        requiresOriginalPrescriptionAtPickup:
          initialProduct.requiresOriginalPrescriptionAtPickup ?? false,
      });
      setImageUrls(initialProduct.images ?? []);
    } else {
      reset(emptyValues);
      setImageUrls([]);
    }
  }, [isOpen, initialProduct, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (skipPrescriptionDefaultsRef.current) {
      skipPrescriptionDefaultsRef.current = false;
      return;
    }

    const defaults = getDefaultsForPrescriptionType(prescriptionType, requiresPrescription);
    setValue('requiresPrescription', defaults.requiresPrescription);
    setValue('requiresPharmacistReview', defaults.requiresPharmacistReview);
    setValue('allowOnlineSale', defaults.allowOnlineSale);
    setValue('allowDeliveryWithPrescription', defaults.allowDeliveryWithPrescription);
    setValue('allowPickupWithPrescription', defaults.allowPickupWithPrescription);
    setValue('requiresOriginalPrescriptionAtPickup', defaults.requiresOriginalPrescriptionAtPickup);
  }, [isOpen, prescriptionType, requiresPrescription, setValue]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit({
      name: data.name,
      activeIngredient: data.activeIngredient?.trim() || undefined,
      category: data.category,
      requiresPrescription: data.requiresPrescription,
      prescriptionType: data.requiresPrescription ? data.prescriptionType : 'NONE',
      requiresPharmacistReview: data.requiresPharmacistReview,
      allowOnlineSale: data.allowOnlineSale,
      allowDeliveryWithPrescription: data.allowDeliveryWithPrescription,
      allowPickupWithPrescription: data.allowPickupWithPrescription,
      requiresOriginalPrescriptionAtPickup: data.requiresOriginalPrescriptionAtPickup,
      images: imageUrls,
    });
  };

  const showPrescriptionWarning =
    prescriptionType === 'RETAINED' ||
    prescriptionType === 'CONTROLLED_C1' ||
    prescriptionType === 'CONTROLLED_C5' ||
    prescriptionType === 'CONTROLLED_OTHER';

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

        {requiresPrescription && (
          <>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="prescriptionType" className="text-sm font-medium text-on-surface">
                Tipo de receita
              </label>
              <select
                id="prescriptionType"
                {...register('prescriptionType')}
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {PRESCRIPTION_TYPE_OPTIONS.filter((option) => option.value !== 'NONE').map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {showPrescriptionWarning && (
              <p className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[var(--color-warning)]">
                Configurações conservadoras serão aplicadas automaticamente para este tipo de receita.
              </p>
            )}

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                {...register('requiresPharmacistReview')}
              />
              <span className="text-sm text-on-surface">Exige revisão farmacêutica</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                {...register('allowOnlineSale')}
              />
              <span className="text-sm text-on-surface">Venda online permitida</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                {...register('allowDeliveryWithPrescription')}
              />
              <span className="text-sm text-on-surface">Entrega permitida</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                {...register('allowPickupWithPrescription')}
              />
              <span className="text-sm text-on-surface">Retirada permitida</span>
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                {...register('requiresOriginalPrescriptionAtPickup')}
              />
              <span className="text-sm text-on-surface">
                Exige conferência da receita original na retirada
              </span>
            </label>
          </>
        )}

        <ProductImageUploader
          value={imageUrls}
          onChange={setImageUrls}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
};
