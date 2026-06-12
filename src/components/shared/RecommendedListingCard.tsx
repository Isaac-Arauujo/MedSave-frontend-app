import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getCategoryLabel } from '../../constants/productCategories';
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

interface RecommendedListingCardProps {
  listing: ListingResponse;
}

export const RecommendedListingCard = ({ listing }: RecommendedListingCardProps) => {
  const imageUrl = getImageUrl(listing.product.images[0]);
  const detailPath = ROUTES.LISTING_DETAIL.replace(':id', String(listing.id));
  const categoryLabel = listing.product.category
    ? getCategoryLabel(listing.product.category)
    : listing.product.activeIngredient;
  const subtitle = getListingSubtitle(listing.product);
  const prescriptionLabel = getListingPrescriptionLabel(listing.product);

  return (
    <Link
      to={detailPath}
      className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-md sm:w-[190px]"
      aria-label={`Ver ${listing.product.name}`}
    >
      <div className="relative aspect-[4/3] bg-surface-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.product.name}
            className="h-full w-full object-cover"
            width={190}
            height={142}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl" aria-hidden="true">
              medication
            </span>
          </div>
        )}
        <Badge variant="success" className="absolute right-2 top-2 text-[10px]">
          -{listing.discountPercent}%
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="line-clamp-2 font-headline text-sm font-semibold text-on-surface">
          {listing.product.name}
        </h4>
        {subtitle ? (
          <p className="line-clamp-2 text-xs text-on-surface-variant">{subtitle}</p>
        ) : categoryLabel ? (
          <p className="line-clamp-1 text-xs text-on-surface-variant">{categoryLabel}</p>
        ) : null}
        <Badge variant={getPrescriptionBadgeVariant(listing.product)} className="w-fit">
          {prescriptionLabel}
        </Badge>
        <div className="flex flex-wrap items-end gap-1.5">
          <p className="font-headline text-base font-bold text-primary">
            {formatCurrency(listing.discountPrice)}
          </p>
          <p className="text-xs text-on-surface-variant line-through">
            {formatCurrency(listing.originalPrice)}
          </p>
        </div>
        <p className="text-[11px] text-on-surface-variant">
          Economia de {listing.discountPercent}%
        </p>
        <p className="text-[11px] text-on-surface-variant">
          Validade: {formatDate(listing.expirationDate)}
        </p>
        <p className="line-clamp-1 text-[11px] text-on-surface-variant">
          {listing.pharmacy.name}
        </p>
      </div>
    </Link>
  );
};
