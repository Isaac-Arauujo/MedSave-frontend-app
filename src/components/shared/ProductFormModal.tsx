import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { PRESCRIPTION_TYPE_OPTIONS } from '../../constants/prescriptionOptions';
import type { CreateProductRequest, PrescriptionType, ProductResponse } from '../../types/ProductTypes';
import { EAN_INVALID_MESSAGE, isValidEanLength, normalizeEan } from '../../utils/productEan';
import { ProductImageUploader } from '../admin/ProductImageUploader';
import { Badge } from '../ui/Badge';
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

const optionalText = (max: number, message: string) =>
  z.string().max(max, message).optional().or(z.literal(''));

const productSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    activeIngredient: optionalText(255, 'Princípio ativo deve ter no máximo 255 caracteres'),
    manufacturer: optionalText(150, 'Fabricante deve ter no máximo 150 caracteres'),
    brand: optionalText(150, 'Marca deve ter no máximo 150 caracteres'),
    dosage: optionalText(100, 'Dosagem deve ter no máximo 100 caracteres'),
    pharmaceuticalForm: optionalText(100, 'Forma farmacêutica deve ter no máximo 100 caracteres'),
    presentation: optionalText(180, 'Apresentação deve ter no máximo 180 caracteres'),
    packageQuantity: optionalText(80, 'Quantidade na embalagem deve ter no máximo 80 caracteres'),
    administrationRoute: optionalText(100, 'Via de administração deve ter no máximo 100 caracteres'),
    therapeuticClass: optionalText(150, 'Classe terapêutica deve ter no máximo 150 caracteres'),
    composition: optionalText(1000, 'Composição deve ter no máximo 1000 caracteres'),
    ean: optionalText(30, 'EAN/GTIN deve ter no máximo 30 caracteres'),
    msRegistration: optionalText(50, 'Registro MS deve ter no máximo 50 caracteres'),
    bulaUrl: optionalText(500, 'URL da bula deve ter no máximo 500 caracteres'),
    shortDescription: optionalText(1000, 'Descrição curta deve ter no máximo 1000 caracteres'),
    safetyNotice: optionalText(1000, 'Aviso de segurança deve ter no máximo 1000 caracteres'),
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
  })
  .superRefine((data, ctx) => {
    if (data.ean && !isValidEanLength(data.ean)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ean'],
        message: EAN_INVALID_MESSAGE,
      });
    }

    const bula = data.bulaUrl?.trim();
    if (bula && !/^https?:\/\//i.test(bula)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bulaUrl'],
        message: 'Informe uma URL válida para a bula.',
      });
    }
  });

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ProductResponse;
  prefill?: {
    ean?: string;
    name?: string;
    manufacturer?: string;
  };
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
  manufacturer: '',
  brand: '',
  dosage: '',
  pharmaceuticalForm: '',
  presentation: '',
  packageQuantity: '',
  administrationRoute: '',
  therapeuticClass: '',
  composition: '',
  ean: '',
  msRegistration: '',
  bulaUrl: '',
  shortDescription: '',
  safetyNotice: '',
  category: 'ANALGESIC',
  requiresPrescription: false,
  prescriptionType: 'NONE',
  requiresPharmacistReview: false,
  allowOnlineSale: true,
  allowDeliveryWithPrescription: true,
  allowPickupWithPrescription: true,
  requiresOriginalPrescriptionAtPickup: false,
};

const trimOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const FormSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="sm:col-span-2">
    <h3 className="mb-3 border-b border-outline-variant pb-2 text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
      {title}
    </h3>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="mt-1 text-xs text-on-surface-variant">{children}</p>
);

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, className, maxLength, rows = 4, hint, id, name, ...props }, ref) => {
    const fieldId = id ?? name;

    return (
      <div className={clsx('flex w-full flex-col gap-1.5', className)}>
        <label htmlFor={fieldId} className="text-sm font-medium text-on-surface">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          className={clsx(
            'w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            error && 'border-[var(--color-danger)]'
          )}
          {...props}
        />
        {hint && <FieldHint>{hint}</FieldHint>}
        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

export const ProductFormModal = ({
  isOpen,
  onClose,
  initialProduct,
  prefill,
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
        manufacturer: initialProduct.manufacturer ?? '',
        brand: initialProduct.brand ?? '',
        dosage: initialProduct.dosage ?? '',
        pharmaceuticalForm: initialProduct.pharmaceuticalForm ?? '',
        presentation: initialProduct.presentation ?? '',
        packageQuantity: initialProduct.packageQuantity ?? '',
        administrationRoute: initialProduct.administrationRoute ?? '',
        therapeuticClass: initialProduct.therapeuticClass ?? '',
        composition: initialProduct.composition ?? '',
        ean: initialProduct.ean ?? '',
        msRegistration: initialProduct.msRegistration ?? '',
        bulaUrl: initialProduct.bulaUrl ?? '',
        shortDescription: initialProduct.shortDescription ?? '',
        safetyNotice: initialProduct.safetyNotice ?? '',
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
    } else if (prefill) {
      reset({
        ...emptyValues,
        ean: prefill.ean ?? '',
        name: prefill.name ?? '',
        manufacturer: prefill.manufacturer ?? '',
      });
      setImageUrls([]);
    } else {
      reset(emptyValues);
      setImageUrls([]);
    }
  }, [isOpen, initialProduct, prefill, reset]);

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
    const normalizedEan = data.ean ? normalizeEan(data.ean) : undefined;

    await onSubmit({
      name: data.name.trim(),
      activeIngredient: trimOptional(data.activeIngredient),
      manufacturer: trimOptional(data.manufacturer),
      brand: trimOptional(data.brand),
      dosage: trimOptional(data.dosage),
      pharmaceuticalForm: trimOptional(data.pharmaceuticalForm),
      presentation: trimOptional(data.presentation),
      packageQuantity: trimOptional(data.packageQuantity),
      administrationRoute: trimOptional(data.administrationRoute),
      therapeuticClass: trimOptional(data.therapeuticClass),
      composition: trimOptional(data.composition),
      ean: normalizedEan,
      msRegistration: trimOptional(data.msRegistration),
      bulaUrl: trimOptional(data.bulaUrl),
      shortDescription: trimOptional(data.shortDescription),
      safetyNotice: trimOptional(data.safetyNotice),
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
      size="xl"
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
            {isEditing ? 'Salvar alterações' : 'Salvar produto'}
          </Button>
        </>
      }
    >
      <form className="grid gap-6" onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}>
        <FormSection title="Dados principais">
          <Input
            label="Nome do produto"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
            {...register('name')}
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

          <Input
            label="Princípio ativo"
            error={errors.activeIngredient?.message}
            className="sm:col-span-2"
            maxLength={255}
            {...register('activeIngredient')}
          />

          <Input
            label="Fabricante/Laboratório"
            error={errors.manufacturer?.message}
            maxLength={150}
            {...register('manufacturer')}
          />

          <Input label="Marca" error={errors.brand?.message} maxLength={150} {...register('brand')} />

          {isEditing && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-on-surface">Produto ativo</p>
              <Badge variant={initialProduct?.active ? 'success' : 'neutral'}>
                {initialProduct?.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          )}
        </FormSection>

        <FormSection title="Informações farmacêuticas">
          <Input label="Dosagem/concentração" error={errors.dosage?.message} maxLength={100} {...register('dosage')} />
          <Input
            label="Forma farmacêutica"
            error={errors.pharmaceuticalForm?.message}
            maxLength={100}
            {...register('pharmaceuticalForm')}
          />
          <Input
            label="Apresentação"
            error={errors.presentation?.message}
            maxLength={180}
            {...register('presentation')}
          />
          <Input
            label="Quantidade da embalagem"
            error={errors.packageQuantity?.message}
            maxLength={80}
            {...register('packageQuantity')}
          />
          <Input
            label="Via de administração"
            error={errors.administrationRoute?.message}
            maxLength={100}
            {...register('administrationRoute')}
          />
          <Input
            label="Classe terapêutica"
            error={errors.therapeuticClass?.message}
            maxLength={150}
            {...register('therapeuticClass')}
          />
          <TextareaField
            label="Composição"
            className="sm:col-span-2"
            maxLength={1000}
            rows={4}
            error={errors.composition?.message}
            {...register('composition')}
          />
        </FormSection>

        <FormSection title="Regulatórios e identificação">
          <div className="sm:col-span-2">
            <Input
              label="EAN/GTIN"
              error={errors.ean?.message}
              maxLength={30}
              placeholder="Ex.: 7891234567890"
              {...register('ean')}
            />
            <FieldHint>
              EAN/GTIN será usado para importação por planilha. Informe apenas números ou cole o código com
              espaços/hífens; o sistema irá normalizar.
            </FieldHint>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Registro MS/Anvisa"
              error={errors.msRegistration?.message}
              maxLength={50}
              {...register('msRegistration')}
            />
            <FieldHint>Número de registro do medicamento na Anvisa, quando disponível.</FieldHint>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="URL da bula"
              error={errors.bulaUrl?.message}
              maxLength={500}
              placeholder="https://..."
              {...register('bulaUrl')}
            />
            <FieldHint>Link público para a bula oficial ou página de bula.</FieldHint>
          </div>
        </FormSection>

        <FormSection title="Receita e venda online">
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
              {...register('requiresPrescription')}
            />
            <span className="text-sm text-on-surface">Exige receita médica</span>
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
                <span className="text-sm text-on-surface">Exige análise da farmácia</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                  {...register('allowOnlineSale')}
                />
                <span className="text-sm text-on-surface">Permite venda online</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                  {...register('allowDeliveryWithPrescription')}
                />
                <span className="text-sm text-on-surface">Permite entrega com receita</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                  {...register('allowPickupWithPrescription')}
                />
                <span className="text-sm text-on-surface">Permite retirada com receita</span>
              </label>

              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                  {...register('requiresOriginalPrescriptionAtPickup')}
                />
                <span className="text-sm text-on-surface">Exige receita original na retirada</span>
              </label>
            </>
          )}
        </FormSection>

        <FormSection title="Descrição e avisos">
          <TextareaField
            label="Descrição curta"
            className="sm:col-span-2"
            maxLength={1000}
            rows={3}
            error={errors.shortDescription?.message}
            {...register('shortDescription')}
          />
          <TextareaField
            label="Aviso de segurança"
            className="sm:col-span-2"
            maxLength={1000}
            rows={4}
            hint="Se vazio, o sistema poderá usar um aviso padrão."
            error={errors.safetyNotice?.message}
            {...register('safetyNotice')}
          />
        </FormSection>

        <FormSection title="Imagens">
          <ProductImageUploader
            value={imageUrls}
            onChange={setImageUrls}
            disabled={isSubmitting}
          />
        </FormSection>
      </form>
    </Modal>
  );
};
