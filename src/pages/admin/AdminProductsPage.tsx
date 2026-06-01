import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { ProductFormModal } from '../../components/shared/ProductFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { getCategoryLabel } from '../../constants/productCategories';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type { CreateProductRequest, ProductResponse } from '../../types/ProductTypes';

export const AdminProductsPage = () => {
  const {
    products,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  } = useAdminProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (data: CreateProductRequest) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await createProduct(data);
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading && products.length === 0) {
    return <PageLoader message="Carregando produtos..." />;
  }

  if (error && products.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Produtos"
      description="Gerencie o catálogo de produtos disponíveis para anúncios."
    >
      <div className="mb-6 flex justify-end">
        <Button variant="primary" onClick={handleOpenCreate}>
          Novo produto
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre produtos para que as farmácias possam criar anúncios."
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Criar produto
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
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Receita
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {getCategoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.requiresPrescription ? 'warning' : 'neutral'}>
                        {product.requiresPrescription ? 'Sim' : 'Não'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.active ? 'success' : 'neutral'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(product)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(product)}>
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

      {error && products.length > 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <ProductFormModal
        isOpen={formOpen}
        onClose={handleCloseForm}
        initialProduct={editingProduct ?? undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir produto"
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
          Confirma a exclusão do produto &quot;{deleteTarget?.name}&quot;? O produto será desativado do
          catálogo.
        </p>
      </Modal>
    </PageWrapper>
  );
};
