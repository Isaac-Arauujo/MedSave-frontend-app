import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AdminListingFormModal } from '../../components/shared/AdminListingFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useAdminListings } from '../../hooks/useAdminListings';
import type { ListingResponse } from '../../types/ListingTypes';
import type { ProductCategory } from '../../types/ProductTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export const AdminListingsPage = () => {
  const {
    listings,
    currentPage,
    totalPages,
    pharmacyIdFilter,
    activeFilter,
    categoryFilter,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setPharmacyIdFilter,
    setActiveFilter,
    setCategoryFilter,
    applyFilters,
    updateListing,
    deleteListing,
    refetch,
  } = useAdminListings();

  const [editingListing, setEditingListing] = useState<ListingResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingResponse | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteListing(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (error && listings.length === 0 && !isLoading) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Anúncios" description="Gerencie todos os anúncios da plataforma.">
      <form
        className="mb-6 grid gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <Input
          label="ID da farmácia"
          value={pharmacyIdFilter}
          onChange={(event) => setPharmacyIdFilter(event.target.value)}
          placeholder="Ex.: 12"
        />
        <div>
          <label htmlFor="active-filter" className="mb-1 block text-sm font-medium text-on-surface">
            Status do anúncio
          </label>
          <select
            id="active-filter"
            value={activeFilter}
            onChange={(event) =>
              setActiveFilter(event.target.value as 'all' | 'true' | 'false')
            }
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
        <div>
          <label htmlFor="category-filter" className="mb-1 block text-sm font-medium text-on-surface">
            Categoria
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as ProductCategory | '')}
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todas</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Aplicar filtros
          </Button>
        </div>
      </form>

      {isLoading && listings.length === 0 ? (
        <PageLoader message="Carregando anúncios..." />
      ) : (
        <DataTable
          columns={[
            {
              key: 'product',
              header: 'Produto',
              render: (listing) => listing.product.name,
            },
            {
              key: 'pharmacy',
              header: 'Farmácia',
              render: (listing) => `${listing.pharmacy.name} · ${listing.pharmacy.city}`,
            },
            {
              key: 'prices',
              header: 'Preços',
              render: (listing) => (
                <span>
                  {formatCurrency(listing.discountPrice)}
                  <span className="block text-xs text-on-surface-variant line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                </span>
              ),
            },
            {
              key: 'stock',
              header: 'Estoque',
              render: (listing) => String(listing.availableStock),
            },
            {
              key: 'expiration',
              header: 'Validade',
              render: (listing) => formatDate(listing.expirationDate),
            },
            {
              key: 'active',
              header: 'Ativo',
              render: (listing) => (
                <Badge variant={listing.active ? 'success' : 'neutral'}>
                  {listing.active ? 'Sim' : 'Não'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (listing) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingListing(listing)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(listing)}
                  >
                    Excluir
                  </Button>
                </div>
              ),
            },
          ]}
          data={listings}
          isLoading={isLoading}
          rowKey={(listing) => listing.id}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          emptyTitle="Nenhum anúncio encontrado"
          emptyDescription="Ajuste os filtros ou aguarde novos anúncios."
        />
      )}

      <AdminListingFormModal
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
        listing={editingListing}
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          if (!editingListing) {
            return;
          }

          await updateListing(editingListing.id, data);
          setEditingListing(null);
        }}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir anúncio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmDelete()} isLoading={isSubmitting}>
              Confirmar exclusão
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant">
          Deseja excluir o anúncio de <strong className="text-on-surface">{deleteTarget?.product.name}</strong>{' '}
          da farmácia <strong className="text-on-surface">{deleteTarget?.pharmacy.name}</strong>?
        </p>
      </Modal>
    </PageWrapper>
  );
};
