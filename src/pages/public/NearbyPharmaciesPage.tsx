import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PharmacyNearbyCard } from '../../components/shared/PharmacyNearbyCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import {
  DEFAULT_NEARBY_RADIUS_KM,
  NEARBY_RADIUS_OPTIONS,
  type NearbyRadiusKm,
} from '../../constants/pharmacyOptions';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbyPharmacies } from '../../hooks/useNearbyPharmacies';

const searchSchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180'),
  radiusKm: z.coerce
    .number()
    .refine(
      (value): value is NearbyRadiusKm =>
        NEARBY_RADIUS_OPTIONS.includes(value as NearbyRadiusKm),
      'Selecione um raio válido'
    ),
});

type SearchFormData = z.input<typeof searchSchema>;

export const NearbyPharmaciesPage = () => {
  const { pharmacies, isLoading, error, search } = useNearbyPharmacies();
  const {
    coords,
    isLoading: isGeolocationLoading,
    error: geolocationError,
    isSupported,
    requestLocation,
  } = useGeolocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      latitude: '',
      longitude: '',
      radiusKm: DEFAULT_NEARBY_RADIUS_KM,
    },
  });

  const runSearch = async (data: SearchFormData) => {
    const parsed = searchSchema.parse(data);
    await search(parsed.latitude, parsed.longitude, parsed.radiusKm);
  };

  const handleUseMyLocation = async () => {
    const location = await requestLocation();

    if (!location) {
      return;
    }

    setValue('latitude', location.lat);
    setValue('longitude', location.lng);
    await search(location.lat, location.lng, DEFAULT_NEARBY_RADIUS_KM);
  };

  useEffect(() => {
    if (!coords) {
      return;
    }

    setValue('latitude', coords.lat);
    setValue('longitude', coords.lng);
  }, [coords, setValue]);

  return (
    <PageWrapper
      title="Farmácias próximas"
      description="Encontre farmácias parceiras perto de você."
    >
      <section className="mb-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-6">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            void handleSubmit(runSearch)(event);
          }}
          noValidate
        >
          <Input
            label="Latitude"
            type="number"
            step="any"
            error={errors.latitude?.message}
            {...register('latitude')}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            error={errors.longitude?.message}
            {...register('longitude')}
          />
          <div>
            <label htmlFor="radiusKm" className="mb-1 block text-sm font-medium text-on-surface">
              Raio de busca
            </label>
            <select
              id="radiusKm"
              className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('radiusKm')}
            >
              {NEARBY_RADIUS_OPTIONS.map((radius) => (
                <option key={radius} value={radius}>
                  {radius} km
                </option>
              ))}
            </select>
            {errors.radiusKm?.message && (
              <p className="mt-1 text-sm text-[var(--color-danger)]" role="alert">
                {errors.radiusKm.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1 lg:justify-end">
            {isSupported && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleUseMyLocation()}
                isLoading={isGeolocationLoading}
              >
                Usar minha localização
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Buscar farmácias
            </Button>
          </div>
        </form>

        {geolocationError && (
          <p className="mt-4 text-sm text-[var(--color-warning)]" role="alert">
            {geolocationError}
          </p>
        )}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            void handleSubmit(runSearch)();
          }}
        />
      ) : pharmacies.length === 0 ? (
        <EmptyState
          title="Nenhuma farmácia encontrada"
          description="Ajuste a localização ou aumente o raio de busca para ver mais resultados."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((pharmacy) => (
            <PharmacyNearbyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
