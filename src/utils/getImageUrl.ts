import { getApiBaseUrl } from '../config/apiBaseUrl';

const apiBaseUrl = getApiBaseUrl();

export const getImageUrl = (path?: string): string | null => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
