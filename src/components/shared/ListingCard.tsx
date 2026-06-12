import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';
import type { ListingResponse } from '../../types/ListingTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getImageUrl } from '../../utils/getImageUrl';
import {
  getListingPrescriptionLabel,
  getListingSubtitle,
  getPrescriptionBadgeVariant,
} from '../../utils/listingProductDisplayUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ListingCardProps {
  listing: ListingResponse;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isSaved?: boolean;
  onAddToCart?: () => void;
  onSave?: () => void;
}

export const ListingCard = ({
  listing,
  isAuthenticated,
  isCustomer,
  isSaved = false,
  onAddToCart,
  onSave,
}: ListingCardProps) => {
  const imageUrl = getImageUrl(listing.product.images[0]);
  const detailPath = ROUTES.LISTING_DETAIL.replace(':id', String(listing.id));
  const subtitle = getListingSubtitle(listing.product);
  const prescriptionLabel = getListingPrescriptionLabel(listing.product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-md">
      <Link to={detailPath} className="relative block aspect-[4/3] bg-surface-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.product.name}
            className="h-full w-full object-cover"
            width={320}
            height={240}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl" aria-hidden="true">
              medication
            </span>
          </div>
        )}
        <Badge variant="success" className="absolute right-3 top-3">
          -{listing.discountPercent}%
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={detailPath} className="hover:text-primary" aria-label={`Ver detalhes de ${listing.product.name}`}>
              <h3 className="font-headline font-semibold text-on-surface">
                {listing.product.name}
              </h3>
            </Link>
            {subtitle && (
              <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{subtitle}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={getPrescriptionBadgeVariant(listing.product)}>
                {prescriptionLabel}
              </Badge>
            </div>
            <Link
              to={detailPath}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver detalhes
            </Link>
            <p className="text-sm text-on-surface-variant">
              {listing.pharmacy.name} · {listing.pharmacy.city}
            </p>
          </div>
          {isCustomer && onSave && (
            <button
              type="button"
              className={clsx(
                'rounded-full p-2 transition-colors hover:bg-surface-container',
                isSaved ? 'text-[var(--color-danger)]' : 'text-on-surface-variant'
              )}
              aria-label={isSaved ? 'Remover dos favoritos' : 'Salvar produto'}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSave();
              }}
            >
              <span
                className={clsx('material-symbols-outlined', isSaved && 'text-[var(--color-danger)]')}
                aria-hidden="true"
              >
                {isSaved ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-end gap-2">
          <p className="text-sm text-on-surface-variant line-through">
            {formatCurrency(listing.originalPrice)}
          </p>
          <p className="font-headline text-lg font-bold text-primary">
            {formatCurrency(listing.discountPrice)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
          <span>Validade: {formatDate(listing.expirationDate)}</span>
          <span>·</span>
          <span>Estoque: {listing.availableStock}</span>
        </div>

        <div className="mt-auto pt-2">
          {!isAuthenticated || isCustomer ? (
            <Button variant="primary" size="sm" className="w-full" onClick={onAddToCart}>
              Adicionar ao carrinho
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              Apenas clientes podem comprar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
