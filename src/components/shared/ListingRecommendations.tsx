import clsx from 'clsx';
import { useListingRecommendations } from '../../hooks/useListingRecommendations';
import type { ListingResponse } from '../../types/ListingTypes';
import { RecommendedListingCard } from './RecommendedListingCard';

interface ListingRecommendationsProps {
  listingId: number;
  className?: string;
}

interface RecommendationSectionProps {
  title: string;
  listings: ListingResponse[];
}

const RecommendationSection = ({ title, listings }: RecommendationSectionProps) => {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby={title.replace(/\s+/g, '-').toLowerCase()}>
      <h2
        id={title.replace(/\s+/g, '-').toLowerCase()}
        className="font-headline text-lg font-semibold text-on-surface md:text-xl"
      >
        {title}
      </h2>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex gap-3 md:gap-4">
          {listings.map((listing) => (
            <RecommendedListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

const RecommendationSkeleton = () => (
  <div className="space-y-4" aria-hidden="true">
    <div className="h-7 w-64 animate-pulse rounded-lg bg-surface-container" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] w-[168px] shrink-0 animate-pulse rounded-2xl bg-surface-container sm:w-[190px]"
        />
      ))}
    </div>
  </div>
);

export const ListingRecommendations = ({ listingId, className }: ListingRecommendationsProps) => {
  const { similarProducts, samePharmacyProducts, isLoading, error } =
    useListingRecommendations(listingId);

  const hasResults = similarProducts.length > 0 || samePharmacyProducts.length > 0;

  if (!isLoading && !hasResults && !error) {
    return null;
  }

  return (
    <div className={clsx('space-y-10', className)}>
      {isLoading && <RecommendationSkeleton />}

      {!isLoading && error && (
        <p className="text-sm text-on-surface-variant" role="status">
          {error}
        </p>
      )}

      {!isLoading && (
        <>
          <RecommendationSection
            title="Similares que você pode se interessar"
            listings={similarProducts}
          />
          <RecommendationSection
            title="Mais produtos desta farmácia"
            listings={samePharmacyProducts}
          />
        </>
      )}
    </div>
  );
};
