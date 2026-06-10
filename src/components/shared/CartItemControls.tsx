import clsx from 'clsx';
import { Button } from '../ui/Button';

interface CartItemControlsProps {
  quantity: number;
  maxQuantity?: number;
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  compact?: boolean;
}

export const CartItemControls = ({
  quantity,
  maxQuantity,
  disabled = false,
  onIncrease,
  onDecrease,
  onRemove,
  compact = false,
}: CartItemControlsProps) => {
  const atMax = maxQuantity !== undefined && quantity >= maxQuantity;

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-2',
        compact ? 'justify-start' : 'justify-end sm:justify-start'
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          className="min-h-9 min-w-9 px-0"
          aria-label="Diminuir quantidade"
          onClick={onDecrease}
          disabled={disabled}
        >
          -
        </Button>
        <span
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-outline-variant px-2 text-sm font-medium text-on-surface"
          aria-label={`Quantidade: ${quantity}`}
        >
          {quantity}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="min-h-9 min-w-9 px-0"
          aria-label="Aumentar quantidade"
          onClick={onIncrease}
          disabled={disabled || atMax}
        >
          +
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="min-h-9 text-[var(--color-danger)]"
        aria-label="Remover item do carrinho"
        onClick={onRemove}
        disabled={disabled}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          delete
        </span>
        <span className="hidden sm:inline">Remover</span>
      </Button>
    </div>
  );
};
