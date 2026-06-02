const DEFAULT_DEV_API = 'http://localhost:8080';

/**
 * URL da API Spring Boot (Railway em produção).
 * Definida em build time via VITE_API_BASE_URL na Vercel.
 */
export const getApiBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();

  if (raw) {
    return raw.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEV_API;
  }

  console.error(
    '[MediSave] VITE_API_BASE_URL não definida no build da Vercel. ' +
      'Configure: https://medsave-app-production.up.railway.app'
  );
  return '';
};
