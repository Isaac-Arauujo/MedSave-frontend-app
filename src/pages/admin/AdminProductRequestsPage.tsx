import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { ROUTES } from '../../constants/routes';
import { useAdminProductCatalogRequests } from '../../hooks/useAdminProductCatalogRequests';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type { CreateProductRequest, ProductResponse } from '../../types/ProductTypes';
import type {
  ProductCatalogRequestResponse,
  ProductCatalogRequestStatus,
} from '../../types/ProductCatalogRequestTypes';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const statusConfig: Record<
  ProductCatalogRequestStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  RESOLVED: { label: 'Resolvido', variant: 'success' },
  REJECTED: { label: 'Recusado', variant: 'danger' },
};

const statusFilterOptions: { value: ProductCatalogRequestStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'RESOLVED', label: 'Resolvidos' },
  { value: 'REJECTED', label: 'Recusados' },
];

const formatCellValue = (value?: string | null) => value?.trim() || '—';

const RequestStatusBadge = ({ status }: { status: ProductCatalogRequestStatus }) => {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const AdminProductRequestsPage = () => {
  const {
    requests,
    currentPage,
    totalPages,
    statusFilter,
    search,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setStatusFilter,
    setSearch,
    resolveRequest,
    rejectRequest,
    refetch,
  } = useAdminProductCatalogRequests();

  const { products, search: productSearch, setSearch: setProductSearch, createProduct } =
    useAdminProducts();

  const [resolveTarget, setResolveTarget] = useState<ProductCatalogRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ProductCatalogRequestResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [confirmEanMismatch, setConfirmEanMismatch] = useState(false);
  const [createProductTarget, setCreateProductTarget] =
    useState<ProductCatalogRequestResponse | null>(null);

  useEffect(() => {
    if (!resolveTarget) {
      setSelectedProduct(null);
      setConfirmEanMismatch(false);
      setProductSearch('');
    }
  }, [resolveTarget, setProductSearch]);

  const filteredProducts = useMemo(() => {
    if (!resolveTarget) {
      return products;
    }
    const normalizedSearch = productSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return products;
    }
    return products.filter((product) => {
      const haystack = [product.name, product.ean, product.manufacturer, product.activeIngredient]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [products, productSearch, resolveTarget]);

  const handleConfirmResolve = async () => {
    if (!resolveTarget || !selectedProduct) {
      return;
    }

    const eanMismatch =
      selectedProduct.ean &&
      resolveTarget.ean &&
      selectedProduct.ean.replace(/\D/g, '') !== resolveTarget.ean.replace(/\D/g, '');

    if (eanMismatch && !confirmEanMismatch) {
      setConfirmEanMismatch(true);
      return;
    }

    await resolveRequest(resolveTarget.id, { productId: selectedProduct.id });
    setResolveTarget(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) {
      return;
    }

    await rejectRequest(rejectTarget.id, { reason: rejectReason.trim() });
    setRejectTarget(null);
    setRejectReason('');
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    await createProduct(data);
    setCreateProductTarget(null);
    await refetch();
  };

  if (isLoading && requests.length === 0) {
    return <PageLoader message="Carregando solicitações..." />;
  }

  if (error && requests.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Solicitações de produtos"
      description="Revise EANs desconhecidos enviados pelas farmácias na importação CSV."
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <Input
              label="Buscar solicitações"
              placeholder="EAN, produto, fabricante ou farmácia"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Status
            </label>
            <select
              className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ProductCatalogRequestStatus | '')
              }
            >
              {statusFilterOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          description="Quando uma farmácia importar um EAN desconhecido, a pendência aparecerá aqui."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-outline-variant md:block">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    EAN
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Farmácia
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Produto informado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Fabricante
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Preço promo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Estoque
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Validade
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Lote
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                    Criado em
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-on-surface-variant">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{request.ean}</td>
                    <td className="px-4 py-3 text-sm text-on-surface">{request.pharmacyName}</td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatCellValue(request.productNameSnapshot)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatCellValue(request.manufacturerSnapshot)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {request.discountPrice != null
                        ? formatCurrency(request.discountPrice)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {request.stock ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {request.expirationDate ? formatDate(request.expirationDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatCellValue(request.batchNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <RequestStatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {request.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCreateProductTarget(request)}
                          >
                            Criar produto
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setResolveTarget(request)}
                          >
                            Resolver
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setRejectTarget(request);
                              setRejectReason('');
                            }}
                          >
                            Recusar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-on-surface-variant">
                          {request.resolvedProductName
                            ? `Produto: ${request.resolvedProductName}`
                            : request.rejectionReason || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-on-surface">{request.ean}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{request.pharmacyName}</p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <dt className="text-on-surface-variant">Produto informado</dt>
                    <dd className="font-medium text-on-surface">
                      {formatCellValue(request.productNameSnapshot)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Fabricante</dt>
                    <dd className="font-medium text-on-surface">
                      {formatCellValue(request.manufacturerSnapshot)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Preço promo</dt>
                    <dd className="font-medium text-on-surface">
                      {request.discountPrice != null
                        ? formatCurrency(request.discountPrice)
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Estoque</dt>
                    <dd className="font-medium text-on-surface">{request.stock ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Validade</dt>
                    <dd className="font-medium text-on-surface">
                      {request.expirationDate ? formatDate(request.expirationDate) : '—'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-on-surface-variant">Lote</dt>
                    <dd className="font-medium text-on-surface">
                      {formatCellValue(request.batchNumber)}
                    </dd>
                  </div>
                </dl>
                {request.status === 'PENDING' ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="secondary" onClick={() => setCreateProductTarget(request)}>
                      Criar produto no catálogo
                    </Button>
                    <Button variant="primary" onClick={() => setResolveTarget(request)}>
                      Resolver
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setRejectTarget(request);
                        setRejectReason('');
                      }}
                    >
                      Recusar
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-on-surface-variant">
                    {request.resolvedProductName
                      ? `Produto vinculado: ${request.resolvedProductName}`
                      : request.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        title="Resolver solicitação"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleConfirmResolve()}
              isLoading={isSubmitting}
              disabled={!selectedProduct}
            >
              {confirmEanMismatch ? 'Confirmar mesmo assim' : 'Confirmar resolução'}
            </Button>
          </>
        }
      >
        {resolveTarget && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Vincule a solicitação do EAN <strong>{resolveTarget.ean}</strong> a um produto do
              catálogo mestre.
            </p>
            <Input
              label="Buscar produto"
              placeholder="Nome, EAN, fabricante ou princípio ativo"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            {confirmEanMismatch && selectedProduct && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                O produto selecionado tem EAN {selectedProduct.ean || '—'}, diferente do EAN
                solicitado ({resolveTarget.ean}). Confirme apenas se tiver certeza.
              </div>
            )}
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-outline-variant p-2">
              {filteredProducts.length === 0 ? (
                <p className="px-2 py-4 text-sm text-on-surface-variant">
                  Nenhum produto encontrado. Você pode{' '}
                  <Link
                    to={`${ROUTES.ADMIN_PRODUCTS}?prefillEan=${encodeURIComponent(resolveTarget.ean)}`}
                    className="font-medium text-primary"
                  >
                    criar um produto no catálogo
                  </Link>
                  .
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product);
                        setConfirmEanMismatch(false);
                      }}
                      className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      <p className="font-medium text-on-surface">{product.name}</p>
                      <p className="mt-1 text-on-surface-variant">
                        EAN: {product.ean || '—'} · {product.manufacturer || 'Fabricante não informado'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Recusar solicitação"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleConfirmReject()}
              isLoading={isSubmitting}
              disabled={rejectReason.trim().length < 5}
            >
              Confirmar recusa
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Informe o motivo da recusa. Mínimo de 5 caracteres.
          </p>
          <Input
            label="Motivo"
            placeholder="Explique por que esta solicitação foi recusada"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
        </div>
      </Modal>

      <ProductFormModal
        isOpen={Boolean(createProductTarget)}
        onClose={() => setCreateProductTarget(null)}
        onSubmit={handleCreateProduct}
        isSubmitting={isSubmitting}
        prefill={
          createProductTarget
            ? {
                ean: createProductTarget.ean,
                name: createProductTarget.productNameSnapshot ?? '',
                manufacturer: createProductTarget.manufacturerSnapshot ?? '',
              }
            : undefined
        }
      />
    </PageWrapper>
  );
};
