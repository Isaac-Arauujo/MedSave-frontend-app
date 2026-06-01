import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CouponFormModal } from '../../components/shared/CouponFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { useAdminCoupons } from '../../hooks/useAdminCoupons';
import type { CouponResponse, CouponType, CreateCouponRequest } from '../../types/CouponTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const couponTypeLabels: Record<CouponType, string> = {
  PERCENT: 'Percentual',
  FIXED: 'Valor fixo',
};

const formatCouponValue = (coupon: CouponResponse): string =>
  coupon.type === 'PERCENT' ? `${coupon.value}%` : formatCurrency(coupon.value);

export const AdminCouponsPage = () => {
  const {
    coupons,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch,
  } = useAdminCoupons();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponResponse | null>(null);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (coupon: CouponResponse) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCoupon(null);
  };

  const handleFormSubmit = async (data: CreateCouponRequest) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, data);
    } else {
      await createCoupon(data);
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteCoupon(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading && coupons.length === 0) {
    return <PageLoader message="Carregando cupons..." />;
  }

  if (error && coupons.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Cupons"
      description="Gerencie cupons de desconto para pedidos dos clientes."
    >
      <div className="mb-6 flex justify-end">
        <Button variant="primary" onClick={handleOpenCreate}>
          Novo cupom
        </Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          title="Nenhum cupom cadastrado"
          description="Crie cupons para oferecer descontos aos clientes."
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Criar cupom
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
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Pedido mín.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Usos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Expira em
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
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{coupon.code}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {couponTypeLabels[coupon.type]}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatCouponValue(coupon)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {coupon.minOrderValue ? formatCurrency(coupon.minOrderValue) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.active ? 'success' : 'neutral'}>
                        {coupon.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(coupon)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(coupon)}>
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

      {error && coupons.length > 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <CouponFormModal
        isOpen={formOpen}
        onClose={handleCloseForm}
        initialCoupon={editingCoupon ?? undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir cupom"
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
          Confirma a exclusão do cupom &quot;{deleteTarget?.code}&quot;? O cupom será desativado.
        </p>
      </Modal>
    </PageWrapper>
  );
};
