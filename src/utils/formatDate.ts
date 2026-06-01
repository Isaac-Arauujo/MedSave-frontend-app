import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (isoDate: string): string => {
  const parsed = parseISO(isoDate);

  if (!isValid(parsed)) {
    return '';
  }

  return format(parsed, 'dd/MM/yyyy');
};

export const formatDateTime = (isoDate: string): string => {
  const parsed = parseISO(isoDate);

  if (!isValid(parsed)) {
    return '';
  }

  return format(parsed, 'dd/MM/yyyy HH:mm');
};
