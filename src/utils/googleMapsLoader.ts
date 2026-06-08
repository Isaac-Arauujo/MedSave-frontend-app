let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key não configurada.'));
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google Maps.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Google Maps.'));
    document.head.appendChild(script);
  });

  return loadPromise;
};
