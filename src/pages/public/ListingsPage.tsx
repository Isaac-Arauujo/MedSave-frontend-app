import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { ListingCard } from '../../components/shared/ListingCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { ROLES } from '../../constants/roles';
import { usePublicListings } from '../../hooks/usePublicListings';
import { useCart } from '../../hooks/useCart';
import { useSavedProducts } from '../../hooks/useSavedProducts';
import { useAuthStore } from '../../store/authStore';
import type { ProductCategory } from '../../types/ProductTypes';

export const ListingsPage = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const { isSaved, toggleSave } = useSavedProducts();
  const { addItem } = useCart();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [city, setCity] = useState('');

  const {
    listings,
    currentPage,
    totalPages,
    totalElements,
    isLoading,
    error,
    setCurrentPage,
    applyFilters,
    refetch,
  } = usePublicListings();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    applyFilters({ name, category, city });
  };

  const handleAddToCart = (listingId: number) => {
    void addItem(listingId, 1);
  };

  if (isLoading && listings.length === 0) {
    return <PageLoader message="Carregando anúncios..." />;
  }

  if (error && listings.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Anúncios"
      description="Compare preços de medicamentos em farmácias parceiras."
    >
      <form
        className="mb-6 grid gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-4"
        onSubmit={handleSearch}
      >
        <Input
          label="Buscar por nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Dipirona"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-filter" className="text-sm font-medium text-on-surface">
            Categoria
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value as ProductCategory | '')}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todas</option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Cidade"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
        />
        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Buscar
          </Button>
        </div>
      </form>

      <p className="mb-4 text-sm text-on-surface-variant">
        {totalElements} {totalElements === 1 ? 'resultado encontrado' : 'resultados encontrados'}
      </p>

      {listings.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio encontrado"
          description="Tente ajustar os filtros de busca."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isAuthenticated={isAuthenticated}
                isCustomer={isCustomer}
                isSaved={isSaved(listing.id)}
                onAddToCart={() => handleAddToCart(listing.id)}
                onSave={() => void toggleSave(listing.id)}
              />
            ))}
          </div>
          <Pagination
            className="mt-8"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {error && listings.length > 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </PageWrapper>
  );
};
