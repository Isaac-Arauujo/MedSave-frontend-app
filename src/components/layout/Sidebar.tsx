import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const customerNav: NavItem[] = [
  { to: ROUTES.CUSTOMER_DASHBOARD, label: 'Painel', icon: 'dashboard' },
  { to: ROUTES.SAVED_PRODUCTS, label: 'Produtos salvos', icon: 'favorite' },
  { to: ROUTES.CART, label: 'Carrinho', icon: 'shopping_cart' },
  { to: ROUTES.CUSTOMER_ORDERS, label: 'Pedidos', icon: 'receipt_long' },
  { to: ROUTES.CUSTOMER_PROFILE, label: 'Perfil', icon: 'person' },
  { to: ROUTES.CUSTOMER_ADDRESSES, label: 'Endereços', icon: 'location_on' },
];

const pharmacyNav: NavItem[] = [
  { to: ROUTES.PHARMACY_DASHBOARD, label: 'Painel', icon: 'dashboard' },
  { to: ROUTES.PHARMACY_LISTINGS, label: 'Anúncios', icon: 'inventory_2' },
  { to: ROUTES.PHARMACY_ORDERS, label: 'Pedidos', icon: 'receipt_long' },
  { to: ROUTES.PHARMACY_PROFILE, label: 'Perfil', icon: 'store' },
];

const adminNav: NavItem[] = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Painel', icon: 'dashboard' },
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Clientes', icon: 'group' },
  { to: ROUTES.ADMIN_USERS, label: 'Usuários', icon: 'manage_accounts' },
  { to: ROUTES.ADMIN_PHARMACIES, label: 'Farmácias', icon: 'local_pharmacy' },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Produtos', icon: 'medication' },
  { to: ROUTES.ADMIN_LISTINGS, label: 'Anúncios', icon: 'inventory_2' },
  { to: ROUTES.ADMIN_COUPONS, label: 'Cupons', icon: 'sell' },
  { to: ROUTES.ADMIN_ORDERS, label: 'Pedidos', icon: 'receipt_long' },
];

const getNavItems = (role: string | null): NavItem[] => {
  switch (role) {
    case ROLES.PHARMACY:
      return pharmacyNav;
    case ROLES.ADMIN:
      return adminNav;
    case ROLES.CUSTOMER:
      return customerNav;
    default:
      return [];
  }
};

export const Sidebar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, isAuthenticated } = useAuthStore();
  const navItems = getNavItems(role);

  if (!isAuthenticated || navItems.length === 0) {
    return null;
  }

  const navContent = (
    <nav className="flex flex-col gap-1 p-4" aria-label="Navegação lateral">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-primary-light)] text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg lg:hidden"
        aria-label="Abrir menu lateral"
        onClick={() => setMobileOpen(true)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          menu
        </span>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-neutral-900)]/50 lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-outline-variant bg-surface-container-lowest transition-transform lg:static lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-4 lg:hidden">
          <span className="font-headline font-bold text-primary">Menu</span>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-surface-container"
            aria-label="Fechar menu lateral"
            onClick={() => setMobileOpen(false)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
};
