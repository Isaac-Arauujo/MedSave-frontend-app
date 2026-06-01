import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuthHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useAuthStore.persist.hasHydrated());

    return unsubscribe;
  }, []);

  return hydrated;
};
