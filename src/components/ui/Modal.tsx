import clsx from 'clsx';
import { useEffect, useId, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'default' | 'sheet';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  layout = 'default',
}: ModalProps) => {
  const titleId = useId();
  const isSheet = layout === 'sheet';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex',
        isSheet ? 'items-end justify-center sm:items-center sm:p-4' : 'items-center justify-center p-4'
      )}
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[var(--color-neutral-900)]/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          'relative z-10 flex w-full flex-col bg-surface-container-lowest shadow-xl',
          isSheet
            ? 'h-[100dvh] max-h-[100dvh] rounded-t-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:p-6'
            : 'rounded-2xl p-6',
          sizeClasses[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={clsx(
            'flex shrink-0 items-start justify-between gap-4',
            isSheet
              ? 'border-b border-outline-variant px-4 py-3 sm:mb-4 sm:border-0 sm:p-0'
              : 'mb-4'
          )}
        >
          <h2 id={titleId} className="font-headline text-lg font-bold text-on-surface sm:text-xl">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              close
            </span>
          </Button>
        </div>

        <div
          className={clsx(
            'min-h-0 flex-1 text-on-surface',
            isSheet ? 'overflow-y-auto overscroll-contain px-4 py-4 sm:overflow-visible sm:px-0 sm:py-0' : ''
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={clsx(
              'shrink-0',
              isSheet
                ? 'border-t border-outline-variant px-4 py-3 sm:mt-6 sm:border-0 sm:p-0'
                : 'mt-6 flex justify-end gap-3'
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
