import clsx from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export const Spinner = ({
  size = 'md',
  className,
  label = 'Carregando',
}: SpinnerProps) => (
  <div
    role="status"
    aria-label={label}
    className={clsx(
      'animate-spin rounded-full border-primary border-t-transparent',
      sizeClasses[size],
      className
    )}
  />
);
