import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { ProductFormModal } from '../../components/shared/ProductFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { getCategoryLabel } from '../../constants/productCategories';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../../types/ProductTypes';
import { getProductPrescriptionLabel } from '../../utils/productPrescriptionLabel';

const formatCellValue = (value?: string) => value?.trim() || '—';

export const AdminProductsPage = () => {
  const {
    products,
    currentPage,
    totalPages,
    search,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setSearch,
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

  const handleFormSubmit = async (data: CreateProductRequest & { active?: boolean }) => {
    if (editingProduct) {
      const { active, ...updateData } = data;
      await updateProduct(editingProduct.id, {
        ...updateData,
        active,
      } satisfies UpdateProductRequest);
    } else {
      const { active: _active, ...createData } = data;
      await createProduct(createData);
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

  const showEmptyState = products.length === 0 && !search.trim();

  return (
    <PageWrapper
      title="Produtos"
      description="Gerencie o catálogo de produtos disponíveis para anúncios."
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-md">
          <Input
            label="Buscar produtos"
            placeholder="Nome, EAN, fabricante, princípio ativo ou registro MS"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="shrink-0">
          Novo produto
        </Button>
      </div>

      {showEmptyState ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre produtos para que as farmácias possam criar anúncios."
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Criar produto
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Tente outro termo de busca."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-outline-variant md:block">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Fabricante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    EAN/GTIN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Registro MS
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
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-on-surface">{product.name}</p>
                      {product.activeIngredient && (
                        <p className="text-xs text-on-surface-variant">{product.activeIngredient}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-on-surface">{formatCellValue(product.manufacturer)}</p>
                      {product.brand && (
                        <p className="text-xs text-on-surface-variant">{product.brand}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatCellValue(product.ean)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatCellValue(product.msRegistration)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {getCategoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {getProductPrescriptionLabel(product)}
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

          <div className="space-y-3 md:hidden">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-on-surface">{product.name}</h3>
                    {product.activeIngredient && (
                      <p className="text-sm text-on-surface-variant">{product.activeIngredient}</p>
                    )}
                  </div>
                  <Badge variant={product.active ? 'success' : 'neutral'}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <dt className="text-on-surface-variant">Fabricante</dt>
                    <dd className="text-on-surface">
                      {formatCellValue(product.manufacturer)}
                      {product.brand ? ` · ${product.brand}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">EAN/GTIN</dt>
                    <dd className="text-on-surface">{formatCellValue(product.ean)}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Registro MS</dt>
                    <dd className="text-on-surface">{formatCellValue(product.msRegistration)}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Categoria / Receita</dt>
                    <dd className="text-on-surface">
                      {getCategoryLabel(product.category)} · {getProductPrescriptionLabel(product)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(product)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(product)}>
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
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
