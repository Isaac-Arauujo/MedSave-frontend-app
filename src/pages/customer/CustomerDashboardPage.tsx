import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ROUTES } from '../../constants/routes';
import { useCustomerDashboard } from '../../hooks/useCustomerDashboard';
import type { OrderStatus } from '../../types/DashboardTypes';
import { isActiveOrderStatus } from '../../types/DashboardTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const orderStatusConfig: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  PAID: { label: 'Pago', variant: 'neutral' },
  CONFIRMED: { label: 'Confirmado', variant: 'success' },
  SHIPPED: { label: 'Enviado', variant: 'success' },
  DELIVERED: { label: 'Entregue', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'danger' },
  EXPIRED: { label: 'Expirado', variant: 'neutral' },
};

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = orderStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

interface StatCardProps {
  title: string;
  value: string;
  to?: string;
  actionLabel?: string;
}

const StatCard = ({ title, value, to, actionLabel }: StatCardProps) => {
  const content = (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-on-surface-variant">{title}</p>
      <p className="font-headline text-2xl font-bold text-on-surface">{value}</p>
      {actionLabel && to && (
        <span className="mt-auto text-sm font-medium text-primary">{actionLabel}</span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export const CustomerDashboardPage = () => {
  const { dashboard, isLoading, error, refetch } = useCustomerDashboard();

  if (isLoading) {
    return <PageLoader message="Carregando painel..." />;
  }

  if (error || !dashboard) {
    return (
      <ErrorState
        message={error ?? 'Não foi possível carregar o painel.'}
        onRetry={() => void refetch()}
      />
    );
  }

  const activeOrdersCount = dashboard.recentOrders.filter((order) =>
    isActiveOrderStatus(order.status)
  ).length;
  const recentOrders = dashboard.recentOrders.slice(0, 5);
  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <PageWrapper title={`Olá, ${dashboard.firstName}!`} description={todayLabel}>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Produtos salvos"
          value={String(dashboard.favoritesCount)}
          to={ROUTES.SAVED_PRODUCTS}
          actionLabel="Ver produtos salvos"
        />
        <StatCard title="Pedidos ativos" value={String(activeOrdersCount)} />
        <StatCard
          title="Endereço padrão"
          value={
            dashboard.mainAddress
              ? `${dashboard.mainAddress.city} · ${dashboard.mainAddress.state}`
              : 'Nenhum endereço'
          }
          to={ROUTES.CUSTOMER_ADDRESSES}
          actionLabel={dashboard.mainAddress ? 'Gerenciar endereços' : 'Adicionar endereço'}
        />
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">Pedidos recentes</h2>
          <Link to={ROUTES.CUSTOMER_ORDERS}>
            <Button variant="secondary" size="sm">
              Ver todos os pedidos
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            title="Nenhum pedido ainda"
            description="Quando você fizer compras, os pedidos mais recentes aparecerão aqui."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-outline-variant">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Farmácia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {recentOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {order.pharmacyName}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.LISTINGS}>
            <Button variant="primary">Ver anúncios</Button>
          </Link>
          <Link to={ROUTES.CUSTOMER_ADDRESSES}>
            <Button variant="secondary">Meus endereços</Button>
          </Link>
          <Link to={ROUTES.CUSTOMER_PROFILE}>
            <Button variant="secondary">Meu perfil</Button>
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
};
