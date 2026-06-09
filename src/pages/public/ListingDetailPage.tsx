import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { ListingRecommendations } from '../../components/shared/ListingRecommendations';
import { ProductDeliveryCard } from '../../components/shared/ProductDeliveryCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { getCategoryLabel } from '../../constants/productCategories';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const images = listing.product.images?.length
    ? listing.product.images
    : [];
  const imageUrl = getImageUrl(images[selectedImageIndex] ?? images[0]);
  const daysToExpire = differenceInDays(parseISO(listing.expirationDate), new Date());
  const isExpiringSoon = daysToExpire >= 0 && daysToExpire < 30;
  const maxQuantity = Math.max(1, listing.availableStock);
  const saved = isSaved(listing.id);
  const pharmacy = listing.pharmacy;

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.min(Math.max(1, value), maxQuantity));
  };

  const handleAddToCart = () => {
    if (!isCustomer) {
      toast.error('Faça login como cliente para adicionar ao carrinho.');
      return;
    }
    void addItem(listing.id, quantity);
  };

  const handleFavorite = () => {
    if (!isCustomer) {
      toast.error('Faça login como cliente para salvar produtos.');
      return;
    }
    void toggleSave(listing.id);
  };

  return (
    <PageWrapper title={listing.product.name}>
      <nav className="mb-6 text-sm text-on-surface-variant">
        <Link to={ROUTES.LISTINGS} className="hover:text-primary">
          Anúncios
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-on-surface">{listing.product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
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

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => {
                const thumbUrl = getImageUrl(image);
                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={clsx(
                      'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2',
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-outline-variant'
                    )}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Imagem ${index + 1}`}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <header className="space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
                {listing.product.name}
              </h1>
              {listing.product.requiresPrescription && (
                <Badge variant="warning">Receita obrigatória</Badge>
              )}
            </div>
            {listing.product.category && (
              <p className="text-sm text-on-surface-variant">
                Categoria: {getCategoryLabel(listing.product.category)}
              </p>
            )}
            {listing.product.activeIngredient && (
              <p className="text-sm text-on-surface-variant">
                Princípio ativo: {listing.product.activeIngredient}
              </p>
            )}
          </header>

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
            <p
              className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-[var(--color-warning)]"
              role="alert"
            >
              Atenção: este produto vence em {daysToExpire} dia(s).
            </p>
          )}

          <button
            type="button"
            className={clsx(
              'inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium transition-colors',
              saved
                ? 'bg-red-50 text-[var(--color-danger)]'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
            onClick={handleFavorite}
            disabled={isSaving}
            aria-label={saved ? 'Produto salvo' : 'Salvar produto'}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {saved ? 'favorite' : 'favorite_border'}
            </span>
            {saved ? 'Produto salvo' : 'Salvar produto'}
          </button>

          {listing.availableStock > 0 && (
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

              {isCustomer ? (
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  isLoading={isCartSubmitting}
                >
                  Adicionar ao carrinho
                </Button>
              ) : (
                <Link to={ROUTES.LOGIN}>
                  <Button variant="primary" className="w-full">
                    Faça login para comprar
                  </Button>
                </Link>
              )}

              <ProductDeliveryCard
                listingId={listing.id}
                pharmacy={pharmacy}
                deliveryAvailable={pharmacy.deliveryAvailable ?? true}
              />
            </div>
          )}

          {isAuthenticated && !isCustomer && (
            <p className="text-sm text-on-surface-variant">
              Apenas clientes podem adicionar produtos ao carrinho.
            </p>
          )}
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="font-headline text-lg font-semibold text-on-surface">Farmácia</h2>
        <p className="mt-1 font-medium text-on-surface">{pharmacy.name}</p>
        {pharmacy.addressSummary && (
          <p className="text-sm text-on-surface-variant">{pharmacy.addressSummary}</p>
        )}
        {(pharmacy.neighborhood || pharmacy.city || pharmacy.state) && !pharmacy.addressSummary && (
          <p className="text-sm text-on-surface-variant">
            {[pharmacy.neighborhood, pharmacy.city, pharmacy.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-on-surface-variant">
          {pharmacy.pickupAvailable !== false && <span>Retirada disponível</span>}
          {pharmacy.deliveryAvailable && <span>· Entrega disponível</span>}
        </div>
      </section>

      <ListingRecommendations listingId={listing.id} className="mt-12" />
    </PageWrapper>
  );
};
