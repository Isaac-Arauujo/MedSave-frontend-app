import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CouponResponse, CreateCouponRequest, CouponType } from '../../types/CouponTypes';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const couponSchema = z
  .object({
    code: z.string().min(1, 'Código é obrigatório'),
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.coerce.number().positive('Valor deve ser maior que zero'),
    minOrderValue: z.coerce.number().positive('Valor mínimo deve ser maior que zero').optional().or(z.literal('')),
    maxUses: z.coerce.number().int('Limite deve ser um número inteiro').min(1, 'Limite mínimo: 1').optional().or(z.literal('')),
    expiresAt: z.string().min(1, 'Data de expiração é obrigatória'),
  })
  .refine(
    (data) => data.type !== 'PERCENT' || data.value <= 100,
    { message: 'Desconto percentual não pode ser maior que 100', path: ['value'] }
  );

type CouponFormData = z.input<typeof couponSchema>;

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoupon?: CouponResponse;
  onSubmit: (data: CreateCouponRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: CouponFormData = {
  code: '',
  type: 'PERCENT',
  value: 0,
  minOrderValue: '',
  maxUses: '',
  expiresAt: '',
};

const couponTypeOptions: { value: CouponType; label: string }[] = [
  { value: 'PERCENT', label: 'Percentual (%)' },
  { value: 'FIXED', label: 'Valor fixo (R$)' },
];

export const CouponFormModal = ({
  isOpen,
  onClose,
  initialCoupon,
  onSubmit,
  isSubmitting = false,
}: CouponFormModalProps) => {
  const isEditing = Boolean(initialCoupon);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: emptyValues,
  });

  const couponType = watch('type');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialCoupon) {
      reset({
        code: initialCoupon.code,
        type: initialCoupon.type,
        value: initialCoupon.value,
        minOrderValue: initialCoupon.minOrderValue ?? '',
        maxUses: initialCoupon.maxUses ?? '',
        expiresAt: initialCoupon.expiresAt.slice(0, 10),
      });
    } else {
      reset(emptyValues);
    }
  }, [isOpen, initialCoupon, reset]);

  const handleFormSubmit = async (data: CouponFormData) => {
    const parsed = couponSchema.parse(data);
    await onSubmit({
      code: parsed.code.trim().toUpperCase(),
      type: parsed.type,
      value: parsed.value,
      minOrderValue:
        parsed.minOrderValue === '' || parsed.minOrderValue === undefined
          ? undefined
          : Number(parsed.minOrderValue),
      maxUses:
        parsed.maxUses === '' || parsed.maxUses === undefined
          ? undefined
          : Number(parsed.maxUses),
      expiresAt: parsed.expiresAt,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar cupom' : 'Novo cupom'}
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
            {isEditing ? 'Salvar alterações' : 'Criar cupom'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}>
        <Input
          label="Código"
          error={errors.code?.message}
          className="sm:col-span-2"
          {...register('code')}
        />

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="coupon-type" className="text-sm font-medium text-on-surface">
            Tipo
          </label>
          <select
            id="coupon-type"
            {...register('type')}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {couponTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={couponType === 'PERCENT' ? 'Desconto (%)' : 'Desconto (R$)'}
          type="number"
          step={couponType === 'PERCENT' ? '1' : '0.01'}
          min="0"
          error={errors.value?.message}
          {...register('value')}
        />

        <Input
          label="Pedido mínimo (R$)"
          type="number"
          step="0.01"
          min="0"
          error={errors.minOrderValue?.message}
          {...register('minOrderValue')}
        />

        <Input
          label="Limite de usos"
          type="number"
          min="1"
          step="1"
          error={errors.maxUses?.message}
          {...register('maxUses')}
        />

        <Input
          label="Data de expiração"
          type="date"
          error={errors.expiresAt?.message}
          {...register('expiresAt')}
        />
      </form>
    </Modal>
  );
};
