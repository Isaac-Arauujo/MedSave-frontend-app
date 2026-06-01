import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { ROUTES } from '../../constants/routes';
import { useSavedProducts } from '../../hooks/useSavedProducts';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getImageUrl } from '../../utils/getImageUrl';

export const SavedProductsPage = () => {
  const {
    savedProducts,
    isLoading,
    isSubmitting,
    error,
    totalPages,
    currentPage,
    setCurrentPage,
    unsave,
    refetch,
  } = useSavedProducts();

  const handleRemove = async (listingId: number) => {
    await unsave(listingId);
  };

  if (isLoading && savedProducts.length === 0) {
    return <PageLoader message="Carregando produtos salvos..." />;
  }

  if (error && savedProducts.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Produtos salvos"
      description="Seus anúncios favoritos em um só lugar."
    >
      {savedProducts.length === 0 ? (
        <EmptyState
          title="Nenhum produto salvo ainda"
          description="Explore os anúncios e salve os produtos que mais interessam."
          action={
            <Link to={ROUTES.LISTINGS}>
              <Button variant="primary">Ver anúncios</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {savedProducts.map((product) => {
              const imageUrl = getImageUrl(product.productImages[0]);
              const detailPath = ROUTES.LISTING_DETAIL.replace(
                ':id',
                String(product.listingId)
              );

              return (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
                >
                  <Link
                    to={detailPath}
                    className="relative block aspect-[4/3] bg-surface-container"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.productName}
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
                  </Link>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <Link to={detailPath}>
                        <h3 className="font-headline font-semibold text-on-surface hover:text-primary">
                          {product.productName}
                        </h3>
                      </Link>
                      <p className="text-sm text-on-surface-variant">{product.pharmacyName}</p>
                    </div>

                    <div className="flex items-end gap-2">
                      <p className="text-sm text-on-surface-variant line-through">
                        {formatCurrency(product.originalPrice)}
                      </p>
                      <p className="font-headline text-lg font-bold text-primary">
                        {formatCurrency(product.discountPrice)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                      <span>Validade: {formatDate(product.expirationDate)}</span>
                      <Badge variant="neutral">Salvo em {formatDate(product.savedAt)}</Badge>
                    </div>

                    <div className="mt-auto pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => void handleRemove(product.listingId)}
                        isLoading={isSubmitting}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            className="mt-8"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {error && savedProducts.length > 0 && (
        <p
          className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </PageWrapper>
  );
};
