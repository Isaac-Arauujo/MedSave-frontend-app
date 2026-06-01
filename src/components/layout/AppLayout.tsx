import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ROLES } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
const sidebarPrefixes = [
  '/customer',
  '/pharmacy',
  '/admin',
  '/me',
  '/saved-products',
  '/cart',
  '/checkout',
  '/orders',
];

export const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuthStore();

  const showSidebar =
    isAuthenticated &&
    sidebarPrefixes.some((prefix) => location.pathname.startsWith(prefix));

  const showAdminSidebar =
    showSidebar && role === ROLES.ADMIN && location.pathname.startsWith('/admin');
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <div className="flex flex-1">
        {showSidebar && (showAdminSidebar ? <AdminSidebar /> : <Sidebar />)}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
