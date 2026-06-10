import clsx from 'clsx';
import { useEffect, useId, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'default' | 'sheet';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
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

    const ignorePacPointer = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.pac-container')) {
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', ignorePacPointer, true);
    document.addEventListener('touchstart', ignorePacPointer, true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', ignorePacPointer, true);
      document.removeEventListener('touchstart', ignorePacPointer, true);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[60] flex',
        isSheet
          ? 'items-end justify-center p-2 sm:items-center sm:p-4'
          : 'items-center justify-center p-3 sm:p-4'
      )}
      role="presentation"
      onClick={(event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('.pac-container')) {
          return;
        }
        onClose();
      }}
    >
      <div className="absolute inset-0 bg-[var(--color-neutral-900)]/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          'relative z-10 flex w-full flex-col overflow-hidden bg-surface-container-lowest shadow-xl',
          'max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] sm:max-h-[90vh]',
          isSheet
            ? 'h-[100dvh] rounded-t-2xl sm:h-auto sm:max-w-none sm:rounded-2xl'
            : 'rounded-2xl',
          sizeClasses[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={clsx(
            'flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant px-4 py-3 sm:px-6 sm:py-4',
            !isSheet && 'sm:pt-6'
          )}
        >
          <h2
            id={titleId}
            className="min-w-0 break-words font-headline text-lg font-bold text-on-surface sm:text-xl"
          >
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal" className="shrink-0">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              close
            </span>
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 text-on-surface sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-outline-variant px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
