import { useMemo, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PharmacyListingFormModal } from '../../components/shared/PharmacyListingFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { usePharmacyListings } from '../../hooks/usePharmacyListings';
import type { CreateListingRequest, ListingResponse } from '../../types/ListingTypes';
import type { ProductCategory, ProductResponse } from '../../types/ProductTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export const PharmacyListingsPage = () => {
  const {
    listings,
    products,
    currentPage,
    totalPages,
    isLoading,
    isProductsLoading,
    isSubmitting,
    error,
    setCurrentPage,
    loadProducts,
    createListing,
    updateListing,
    deleteListing,
    refetch,
  } = usePharmacyListings();

  const [formOpen, setFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingResponse | null>(null);

  const formProducts = useMemo((): ProductResponse[] => {
    if (!editingListing) {
      return products;
    }

    const listingProductId = editingListing.product.id;
    if (products.some((product) => product.id === listingProductId)) {
      return products;
    }

    const fallbackCategory = 'ANALGESIC' as ProductCategory;
    const fallbackProduct: ProductResponse = {
      id: listingProductId,
      name: editingListing.product.name,
      category: fallbackCategory,
      requiresPrescription: false,
      images: editingListing.product.images,
      active: true,
    };

    return [fallbackProduct, ...products];
  }, [products, editingListing]);

  const handleOpenCreate = () => {
    setEditingListing(null);
    setFormOpen(true);
    void loadProducts();
  };

  const handleOpenEdit = (listing: ListingResponse) => {
    setEditingListing(listing);
    setFormOpen(true);
    void loadProducts();
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingListing(null);
  };

  const handleFormSubmit = async (data: CreateListingRequest) => {
    if (editingListing) {
      await updateListing(editingListing.id, {
        originalPrice: data.originalPrice,
        discountPrice: data.discountPrice,
        expirationDate: data.expirationDate,
        stock: data.stock,
      });
    } else {
      await createListing(data);
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteListing(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading && listings.length === 0) {
    return <PageLoader message="Carregando anúncios..." />;
  }

  if (error && listings.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Meus anúncios"
      description="Gerencie os produtos disponíveis na sua farmácia."
    >
      <div className="mb-6 flex justify-end">
        <Button variant="primary" onClick={handleOpenCreate}>
          Novo anúncio
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="Nenhum anúncio cadastrado"
          description="Crie seu primeiro anúncio para exibir produtos no marketplace."
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Criar anúncio
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Preço original
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Preço com desconto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Estoque
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Validade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">
                      {listing.product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatCurrency(listing.originalPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">
                      {formatCurrency(listing.discountPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {listing.availableStock}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatDate(listing.expirationDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={listing.active ? 'success' : 'neutral'}>
                        {listing.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(listing)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(listing)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            className="mt-6"
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

      <PharmacyListingFormModal
        isOpen={formOpen}
        onClose={handleCloseForm}
        products={formProducts}
        isProductsLoading={isProductsLoading}
        initialListing={editingListing ?? undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
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
          Confirma a exclusão do anúncio de &quot;{deleteTarget?.product.name}&quot;? Esta ação pode ser
          revertida pelo administrador.
        </p>
      </Modal>
    </PageWrapper>
  );
};
