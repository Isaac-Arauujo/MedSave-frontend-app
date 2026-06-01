import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { getDeliveryOptionLabel } from '../../constants/checkoutOptions';
import { ROUTES } from '../../constants/routes';
import { usePharmacyDashboard } from '../../hooks/usePharmacyDashboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
    <p className="text-sm font-medium text-on-surface-variant">{title}</p>
    <p className="mt-2 font-headline text-3xl font-bold text-on-surface">{value}</p>
  </div>
);

export const PharmacyDashboardPage = () => {
  const { stats, recentOrders, isLoading, error, refetch } = usePharmacyDashboard();

  if (isLoading) {
    return <PageLoader message="Carregando painel da farmácia..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Painel da farmácia"
      description="Acompanhe pedidos e acesse as principais ações do dia."
    >
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Novos pedidos hoje" value={String(stats.newOrdersToday)} />
        <StatCard title="Pedidos para preparar" value={String(stats.ordersToPrepare)} />
        <StatCard title="Prontos para retirada" value={String(stats.readyForPickup)} />
      </section>

      <section className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Link to={ROUTES.PHARMACY_ORDERS}>
          <Button variant="primary">Gerenciar pedidos</Button>
        </Link>
        <Link to={ROUTES.PHARMACY_LISTINGS}>
          <Button variant="secondary">Gerenciar anúncios</Button>
        </Link>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-headline text-xl font-bold text-on-surface">Pedidos recentes</h2>
          <Link to={ROUTES.PHARMACY_ORDERS}>
            <Button variant="ghost" size="sm">
              Ver todos
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            title="Nenhum pedido recente"
            description="Os pedidos recebidos aparecerão aqui."
          />
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-2xl border border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-on-surface">{order.orderNumber}</p>
                  <p className="text-sm text-on-surface-variant">
                    {formatDate(order.createdAt)} · {getDeliveryOptionLabel(order.deliveryType)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <p className="font-semibold text-primary">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
};
