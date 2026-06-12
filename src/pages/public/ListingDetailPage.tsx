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
import {
  getListingPrescriptionLabel,
  getListingRestrictionNotes,
  getListingSubtitle,
  getPrescriptionBadgeVariant,
  getProductDetailFields,
  getRegulatoryDetailFields,
  getSafetyNotice,
  getStockLabel,
} from '../../utils/listingProductDisplayUtils';

const DetailFieldGrid = ({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string }[];
}) => {
  if (fields.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:p-5">
      <h2 className="font-headline text-lg font-semibold text-on-surface">{title}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-sm text-on-surface-variant">{field.label}</dt>
            <dd className="mt-1 break-words font-medium text-on-surface">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

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

  const product = listing.product;
  const images = product.images?.length ? product.images : [];
  const imageUrl = getImageUrl(images[selectedImageIndex] ?? images[0]);
  const daysToExpire = differenceInDays(parseISO(listing.expirationDate), new Date());
  const isExpiringSoon = daysToExpire >= 0 && daysToExpire < 30;
  const maxQuantity = Math.max(1, listing.availableStock);
  const saved = isSaved(listing.id);
  const pharmacy = listing.pharmacy;
  const subtitle = getListingSubtitle(product);
  const prescriptionLabel = getListingPrescriptionLabel(product);
  const restrictionNotes = getListingRestrictionNotes(product);
  const productDetailFields = getProductDetailFields(product);
  const regulatoryFields = getRegulatoryDetailFields(product);
  const safetyNotice = getSafetyNotice(product);

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.min(Math.max(1, value), maxQuantity));
  };

  const handleAddToCart = () => {
    if (isAuthenticated && !isCustomer) {
      toast.error('Apenas clientes podem adicionar produtos ao carrinho.');
      return;
    }
    void addItem({
      listingId: listing.id,
      quantity,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
    });
  };

  const handleFavorite = () => {
    if (!isCustomer) {
      toast.error('Faça login como cliente para salvar produtos.');
      return;
    }
    void toggleSave(listing.id);
  };

  return (
    <PageWrapper title={product.name}>
      <nav className="mb-6 text-sm text-on-surface-variant">
        <Link to={ROUTES.LISTINGS} className="hover:text-primary">
          Anúncios
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
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
          <header className="space-y-3">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
                {product.name}
              </h1>
              <Badge variant={getPrescriptionBadgeVariant(product)}>{prescriptionLabel}</Badge>
            </div>

            {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}

            {product.brand && (
              <p className="text-sm text-on-surface-variant">Marca: {product.brand}</p>
            )}

            {product.category && (
              <p className="text-sm text-on-surface-variant">
                Categoria: {getCategoryLabel(product.category)}
              </p>
            )}

            {product.shortDescription && (
              <p className="text-sm leading-relaxed text-on-surface">{product.shortDescription}</p>
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
              <dt className="text-sm text-on-surface-variant">Estoque disponível</dt>
              <dd className="font-medium text-on-surface">
                {getStockLabel(listing.availableStock)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Validade</dt>
              <dd className="font-medium text-on-surface">{formatDate(listing.expirationDate)}</dd>
            </div>
            {listing.batchNumber && (
              <div>
                <dt className="text-sm text-on-surface-variant">Lote</dt>
                <dd className="font-medium text-on-surface">{listing.batchNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-on-surface-variant">Farmácia</dt>
              <dd className="font-medium text-on-surface">{pharmacy.name}</dd>
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

          {restrictionNotes.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">Receita e restrições</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {restrictionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
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

              {!isAuthenticated || isCustomer ? (
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  isLoading={isCartSubmitting}
                >
                  Adicionar ao carrinho
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Apenas clientes podem comprar
                </Button>
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

      <div className="mt-8 space-y-4">
        <DetailFieldGrid title="Informações do medicamento" fields={productDetailFields} />

        {(regulatoryFields.length > 0 || product.bulaUrl) && (
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:p-5">
            <h2 className="font-headline text-lg font-semibold text-on-surface">Regulatórios</h2>
            {regulatoryFields.length > 0 && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {regulatoryFields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-sm text-on-surface-variant">{field.label}</dt>
                    <dd className="mt-1 break-words font-medium text-on-surface">{field.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {product.bulaUrl && (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => window.open(product.bulaUrl, '_blank', 'noopener,noreferrer')}
                >
                  Ver bula
                </Button>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:p-5">
          <h2 className="font-headline text-lg font-semibold text-on-surface">Aviso de segurança</h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{safetyNotice}</p>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:p-5">
          <h2 className="font-headline text-lg font-semibold text-on-surface">Anúncio da farmácia</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-on-surface-variant">Farmácia</dt>
              <dd className="font-medium text-on-surface">{pharmacy.name}</dd>
            </div>
            {listing.batchNumber && (
              <div>
                <dt className="text-sm text-on-surface-variant">Lote</dt>
                <dd className="font-medium text-on-surface">{listing.batchNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-on-surface-variant">Validade</dt>
              <dd className="font-medium text-on-surface">{formatDate(listing.expirationDate)}</dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Estoque disponível</dt>
              <dd className="font-medium text-on-surface">
                {getStockLabel(listing.availableStock)}
              </dd>
            </div>
          </dl>
          {pharmacy.addressSummary && (
            <p className="mt-3 text-sm text-on-surface-variant">{pharmacy.addressSummary}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-on-surface-variant">
            {pharmacy.pickupAvailable !== false && <span>Retirada disponível</span>}
            {pharmacy.deliveryAvailable && <span>· Entrega disponível</span>}
          </div>
        </section>
      </div>

      <ListingRecommendations listingId={listing.id} className="mt-12" />
    </PageWrapper>
  );
};
