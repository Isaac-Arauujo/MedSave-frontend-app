import clsx from 'clsx';
import type { DeliveryType } from '../../types/CheckoutTypes';
import {
  DELIVERY_OPTION_ICONS,
  getDeliveryOptionLabel,
} from '../../constants/checkoutOptions';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';

interface DeliveryOptionCardProps {
  deliveryType: DeliveryType;
  price: number;
  estimateLabel: string;
  estimateDays: number;
  isSelected: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

export const DeliveryOptionCard = ({
  deliveryType,
  price,
  estimateLabel,
  estimateDays,
  isSelected,
  disabled = false,
  disabledReason,
  onSelect,
}: DeliveryOptionCardProps) => {
  const priceLabel = price === 0 ? 'Grátis' : formatCurrency(price);
  const daysBadge =
    estimateDays === 0 ? 'Retirada imediata' : `${estimateDays} ${estimateDays === 1 ? 'dia' : 'dias'}`;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={clsx(
        'flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : !disabled
            ? 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
            : 'border-outline-variant bg-surface-container-lowest'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={clsx(
              'material-symbols-outlined rounded-xl p-2',
              isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
            )}
            aria-hidden="true"
          >
            {DELIVERY_OPTION_ICONS[deliveryType]}
          </span>
          <div>
            <p className="font-semibold text-on-surface">{getDeliveryOptionLabel(deliveryType)}</p>
            <p className="text-sm text-on-surface-variant">{estimateLabel}</p>
          </div>
        </div>
        <p className="font-headline font-bold text-primary">{priceLabel}</p>
      </div>
      <Badge variant={isSelected ? 'success' : 'neutral'}>{daysBadge}</Badge>
    </button>
  );
};
