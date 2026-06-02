const DEFAULT_DEV_API = 'http://localhost:8080';
const DEFAULT_PROD_API = 'https://medsave-app-production.up.railway.app';

/**
 * URL da API Spring Boot (Railway em produção).
 * Ordem: VITE_API_BASE_URL (Vercel / .env.production) → fallback Railway em prod.
 */
export const getApiBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();

  if (raw) {
    return raw.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEV_API;
  }

  if (import.meta.env.PROD) {
    console.warn(
      '[MediSave] VITE_API_BASE_URL ausente no build; usando fallback Railway. ' +
        'Defina a variável na Vercel para trocar a API sem novo deploy.'
    );
    return DEFAULT_PROD_API;
  }

  return DEFAULT_PROD_API;
};