import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { usePublicListing } from '../../hooks/usePublicListing';
import { useCart } from '../../hooks/useCart';
import { useSavedProducts } from '../../hooks/useSavedProducts';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getImageUrl } from '../../utils/getImageUrl';

export const ListingDetailPage = () => {
  const { id } = useParams();
  const listingId = id ? Number(id) : null;
  const { listing, isLoading, error, refetch } = usePublicListing(
    Number.isNaN(listingId) ? null : listingId
  );
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const { isSaved, toggleSave, isSubmitting: isSaving } = useSavedProducts();
  const { addItem, isSubmitting: isCartSubmitting } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <PageLoader message="Carregando anúncio..." />;
  }

  if (error || !listing) {
    return (
      <ErrorState
        message={error ?? 'Anúncio não encontrado.'}
        onRetry={() => void refetch()}
      />
    );
  }

  const imageUrl = getImageUrl(listing.product.images[0]);
  const daysToExpire = differenceInDays(parseISO(listing.expirationDate), new Date());
  const isExpiringSoon = daysToExpire >= 0 && daysToExpire < 30;
  const maxQuantity = Math.max(1, listing.availableStock);

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.min(Math.max(1, value), maxQuantity));
  };

  const handleAddToCart = () => {
    void addItem(listing.id, quantity);
  };

  const saved = isSaved(listing.id);

  return (
    <PageWrapper title={listing.product.name}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.product.name}
              className="aspect-square w-full object-cover"
              width={600}
              height={600}
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-8xl" aria-hidden="true">
                medication
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-on-surface-variant">
              {listing.pharmacy.name} · {listing.pharmacy.city}
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-sm text-on-surface-variant line-through">
              {formatCurrency(listing.originalPrice)}
            </p>
            <p className="font-headline text-3xl font-bold text-primary">
              {formatCurrency(listing.discountPrice)}
            </p>
            <Badge variant="success" className="mt-2">
              Economia de {listing.discountPercent}%
            </Badge>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-on-surface-variant">Disponibilidade</dt>
              <dd className="font-medium text-on-surface">
                {listing.availableStock > 0
                  ? `${listing.availableStock} unidade(s)`
                  : 'Indisponível'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Validade</dt>
              <dd className="font-medium text-on-surface">{formatDate(listing.expirationDate)}</dd>
            </div>
          </dl>

          {isExpiringSoon && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-[var(--color-warning)]" role="alert">
              Atenção: este produto vence em {daysToExpire} dia(s).
            </p>
          )}

          {isCustomer && (
            <Button
              variant="secondary"
              onClick={() => void toggleSave(listing.id)}
                  isLoading={isSaving}
            >
              {saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            </Button>
          )}

          {listing.availableStock > 0 && isCustomer && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantity" className="text-sm font-medium text-on-surface">
                  Quantidade
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(event) => handleQuantityChange(Number(event.target.value))}
                  className="w-full max-w-[120px] rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleAddToCart}
                isLoading={isCartSubmitting}
              >
                Adicionar ao carrinho
              </Button>
            </div>
          )}

          {!isAuthenticated && (
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary">Faça login para comprar</Button>
            </Link>
          )}

          {isAuthenticated && !isCustomer && (
            <p className="text-sm text-on-surface-variant">
              Apenas clientes podem adicionar produtos ao carrinho.
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
