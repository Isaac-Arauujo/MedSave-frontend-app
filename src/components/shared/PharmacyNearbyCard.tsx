import { Badge } from '../ui/Badge';
import type { PharmacyNearbyResponse, PharmacyStatus } from '../../types/PharmacyTypes';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const statusConfig: Record<PharmacyStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovada', variant: 'success' },
  SUSPENDED: { label: 'Suspensa', variant: 'danger' },
};

interface PharmacyNearbyCardProps {
  pharmacy: PharmacyNearbyResponse;
}

const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
};

export const PharmacyNearbyCard = ({ pharmacy }: PharmacyNearbyCardProps) => {
  const status = statusConfig[pharmacy.status];
  const addressLine = `${pharmacy.city} - ${pharmacy.state}`;

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-headline text-lg font-bold text-on-surface">{pharmacy.name}</h3>
        <Badge variant="neutral">{formatDistance(pharmacy.distanceKm)}</Badge>
      </div>

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="sr-only">Endereço</dt>
          <dd className="text-on-surface-variant">{addressLine}</dd>
        </div>
        {pharmacy.phone && (
          <div>
            <dt className="sr-only">Telefone</dt>
            <dd className="text-on-surface">{pharmacy.phone}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
    </article>
  );
};
