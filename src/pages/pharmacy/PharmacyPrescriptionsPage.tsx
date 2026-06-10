import { PageWrapper } from '../../components/layout/PageWrapper';
import { PrescriptionReviewModal } from '../../components/shared/PrescriptionReviewModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { getPrescriptionReviewStatusLabel } from '../../constants/prescriptionOptions';
import { usePharmacyPrescriptions } from '../../hooks/usePharmacyPrescriptions';
import type { PharmacyPrescriptionTab } from '../../types/PrescriptionTypes';
import { formatDate } from '../../utils/formatDate';

const TABS: { key: PharmacyPrescriptionTab; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'approved', label: 'Aprovadas' },
  { key: 'rejected', label: 'Recusadas' },
  { key: 'all', label: 'Todas' },
];

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'success' as const;
    case 'REJECTED':
      return 'danger' as const;
    case 'UNDER_REVIEW':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
};

export const PharmacyPrescriptionsPage = () => {
  const {
    activeTab,
    currentPage,
    reviews,
    totalPages,
    totalElements,
    isLoading,
    isSubmitting,
    isDetailLoading,
    error,
    selectedReview,
    setCurrentPage,
    changeTab,
    openReview,
    closeReview,
    approveReview,
    rejectReview,
    refetch,
  } = usePharmacyPrescriptions();

  const emptyMessage =
    activeTab === 'pending'
      ? 'Nenhuma receita pendente no momento.'
      : 'Nenhuma receita encontrada para este filtro.';

  if (isLoading && reviews.length === 0) {
    return (
      <PageWrapper title="Receitas" description="Analise receitas médicas enviadas pelos clientes.">
        <PageLoader />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Receitas" description="Analise receitas médicas enviadas pelos clientes.">
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            variant={activeTab === tab.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => changeTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error && reviews.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              {totalElements} receita{totalElements === 1 ? '' : 's'}
            </p>
            {isLoading && <Spinner size="sm" />}
          </div>

          {error && reviews.length > 0 && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {reviews.length === 0 ? (
            <EmptyState title="Nenhuma receita" description={emptyMessage} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                        Enviada em
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                        Arquivo
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-on-surface-variant">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {reviews.map((review) => (
                      <tr key={review.reviewId}>
                        <td className="px-4 py-4 text-sm text-on-surface">{review.productName}</td>
                        <td className="px-4 py-4 text-sm text-on-surface">{review.customerName}</td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {formatDate(review.uploadedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={statusBadgeVariant(review.status)}>
                            {getPrescriptionReviewStatusLabel(review.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {review.originalFileName}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void openReview(review.reviewId)}
                          >
                            Analisar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

      <PrescriptionReviewModal
        review={selectedReview}
        isOpen={selectedReview !== null || isDetailLoading}
        isLoading={isDetailLoading}
        isSubmitting={isSubmitting}
        onClose={closeReview}
        onApprove={approveReview}
        onReject={rejectReview}
      />
    </PageWrapper>
  );
};
