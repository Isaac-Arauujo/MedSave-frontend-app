import { useState, useEffect } from 'react';
import { getUserLocation } from '../services/location';

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userLocation = await getUserLocation();
      setLocation(userLocation);
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    } catch (err) {
      setError(err.message);
      console.error('Erro de localização:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar localização salva:', e);
      }
    }
  }, []);

  return { location, error, loading, requestLocation };
};