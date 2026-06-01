import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ROUTES } from '../../constants/routes';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

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

const quickLinks = [
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Clientes', icon: 'group' },
  { to: ROUTES.ADMIN_PHARMACIES, label: 'Farmácias', icon: 'local_pharmacy' },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Produtos', icon: 'medication' },
  { to: ROUTES.ADMIN_LISTINGS, label: 'Anúncios', icon: 'inventory_2' },
  { to: ROUTES.ADMIN_COUPONS, label: 'Cupons', icon: 'sell' },
  { to: ROUTES.ADMIN_ORDERS, label: 'Pedidos', icon: 'receipt_long' },
];

export const AdminDashboardPage = () => {
  const { stats, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return <PageLoader message="Carregando painel administrativo..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Painel administrativo" description="Visão geral da plataforma MedSave.">
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de clientes" value={String(stats.totalCustomers)} />
        <StatCard title="Total de farmácias" value={String(stats.totalPharmacies)} />
        <StatCard title="Aprovações pendentes" value={String(stats.pendingApprovals)} />
        <StatCard
          title="Pedidos hoje"
          value={stats.totalOrdersToday === null ? 'Em breve' : String(stats.totalOrdersToday)}
        />
      </section>

      <section>
        <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Acesso rápido</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-shadow hover:shadow-md"
            >
              <span className="material-symbols-outlined text-primary" aria-hidden="true">
                {link.icon}
              </span>
              <span className="font-medium text-on-surface">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};
