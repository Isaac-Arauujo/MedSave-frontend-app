import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as addressApi from '../api/addressApi';
import type {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../types/AddressTypes';
import { handleApiError } from '../utils/handleApiError';

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await addressApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await addressApi.getAddresses();
        if (isMounted) {
          setAddresses(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(handleApiError(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  const createAddress = useCallback(
    async (data: CreateAddressRequest, setAsDefault = false) => {
      try {
        setIsLoading(true);
        setError(null);
        const created = await addressApi.createAddress(data);

        if (setAsDefault) {
          await addressApi.setDefaultAddress(created.id);
        }

        await refetch();
        toast.success('Endereço adicionado com sucesso.');
        return created;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  const updateAddress = useCallback(
    async (id: number, data: UpdateAddressRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        await addressApi.updateAddress(id, data);
        await refetch();
        toast.success('Endereço atualizado com sucesso.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        setError(null);
        await addressApi.deleteAddress(id);
        await refetch();
        toast.success('Endereço excluído com sucesso.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  const setDefault = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        setError(null);
        await addressApi.setDefaultAddress(id);
        await refetch();
        toast.success('Endereço padrão atualizado.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refetch]
  );

  return {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    refetch,
  };
};
