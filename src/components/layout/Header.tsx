import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import { getDashboardPath } from '../../utils/getDashboardPath';
import { MiniCart } from '../shared/MiniCart';
import { Button } from '../ui/Button';

export const Header = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const { isAuthenticated, role } = useAuthStore();
  const { itemCount } = useCart();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const showCart = !isAuthenticated || isCustomer;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const dashboardPath = getDashboardPath(role);

  const navLinks = [
    { to: ROUTES.LISTINGS, label: 'Anúncios' },
    { to: ROUTES.NEARBY_PHARMACIES, label: 'Farmácias próximas' },
  ];

  const toggleMiniCart = () => {
    setMiniCartOpen((open) => !open);
    setMobileMenuOpen(false);
  };

  const CartIconButton = ({ className }: { className?: string }) => (
    <button
      type="button"
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container',
        className
      )}
      aria-label={`Carrinho${itemCount > 0 ? `, ${itemCount} itens` : ''}`}
      aria-expanded={miniCartOpen}
      onClick={toggleMiniCart}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        shopping_cart
      </span>
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to={ROUTES.LISTINGS} className="font-headline text-xl font-bold text-primary">
            MedSave
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {showCart && <CartIconButton />}
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="ghost" size="sm">
                    Painel
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {showCart && <CartIconButton />}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-on-surface"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        <div
          className={clsx(
            'border-t border-outline-variant bg-surface-container-lowest md:hidden',
            mobileMenuOpen ? 'block' : 'hidden'
          )}
        >
          <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Painel
                </Link>
                <button
                  type="button"
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-on-surface hover:bg-surface-container"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {showCart && <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />}
    </>
  );
};
