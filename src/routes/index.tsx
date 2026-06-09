import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ComingSoon } from '../components/shared/ComingSoon';
import { ROUTES } from '../constants/routes';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminListingsPage } from '../pages/admin/AdminListingsPage';
import { AdminPharmaciesPage } from '../pages/admin/AdminPharmaciesPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { PharmacyDashboardPage } from '../pages/pharmacy/PharmacyDashboardPage';
import { PharmacyListingsPage } from '../pages/pharmacy/PharmacyListingsPage';
import { PharmacyOrdersPage } from '../pages/pharmacy/PharmacyOrdersPage';
import { PharmacyProfilePage } from '../pages/pharmacy/PharmacyProfilePage';
import { ListingDetailPage } from '../pages/public/ListingDetailPage';
import { ListingsPage } from '../pages/public/ListingsPage';
import { NearbyPharmaciesPage } from '../pages/public/NearbyPharmaciesPage';
import { PharmacyRegisterPage } from '../pages/public/PharmacyRegisterPage';
import { ChangePasswordPage } from '../pages/customer/ChangePasswordPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';
import { PaymentPage } from '../pages/customer/PaymentPage';
import { CustomerOrdersPage } from '../pages/customer/CustomerOrdersPage';
import { CustomerAddressesPage } from '../pages/customer/CustomerAddressesPage';
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';
import { SavedProductsPage } from '../pages/customer/SavedProductsPage';
import { AdminRoute } from './AdminRoute';
import { CustomerRoute } from './CustomerRoute';
import { PharmacyRoute } from './PharmacyRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

const placeholder = (pageName: string) => <ComingSoon pageName={pageName} />;

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LISTINGS} replace />} />

        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.PHARMACY_REGISTER} element={<PharmacyRegisterPage />} />

        <Route path={ROUTES.LISTINGS} element={<ListingsPage />} />
        <Route path={ROUTES.LISTING_DETAIL} element={<ListingDetailPage />} />
        <Route path={ROUTES.NEARBY_PHARMACIES} element={<NearbyPharmaciesPage />} />

        <Route
          path={ROUTES.CUSTOMER_PROFILE}
          element={
            <CustomerRoute>
              <CustomerProfilePage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_ADDRESSES}
          element={
            <CustomerRoute>
              <CustomerAddressesPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CHANGE_PASSWORD}
          element={
            <CustomerRoute>
              <ChangePasswordPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_DASHBOARD}
          element={
            <CustomerRoute>
              <CustomerDashboardPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.SAVED_PRODUCTS}
          element={
            <CustomerRoute>
              <SavedProductsPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CART}
          element={
            <CustomerRoute>
              <CartPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <CustomerRoute>
              <CheckoutPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.PAYMENT}
          element={
            <CustomerRoute>
              <PaymentPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_ORDERS}
          element={
            <CustomerRoute>
              <CustomerOrdersPage />
            </CustomerRoute>
          }
        />
        <Route
          path={ROUTES.ORDER_DETAIL}
          element={
            <CustomerRoute>
              <OrderDetailPage />
            </CustomerRoute>
          }
        />

        <Route
          path={ROUTES.PHARMACY_DASHBOARD}
          element={
            <PharmacyRoute>
              <PharmacyDashboardPage />
            </PharmacyRoute>
          }
        />
        <Route
          path={ROUTES.PHARMACY_LISTINGS}
          element={
            <PharmacyRoute>
              <PharmacyListingsPage />
            </PharmacyRoute>
          }
        />
        <Route
          path={ROUTES.PHARMACY_ORDERS}
          element={
            <PharmacyRoute>
              <PharmacyOrdersPage />
            </PharmacyRoute>
          }
        />
        <Route
          path={ROUTES.PHARMACY_PROFILE}
          element={
            <PharmacyRoute>
              <PharmacyProfilePage />
            </PharmacyRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CUSTOMERS}
          element={
            <AdminRoute>
              <AdminCustomersPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PHARMACIES}
          element={
            <AdminRoute>
              <AdminPharmaciesPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PRODUCTS}
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_LISTINGS}
          element={
            <AdminRoute>
              <AdminListingsPage />
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_COUPONS}
          element={<AdminRoute>{placeholder('Cupons')}</AdminRoute>}
        />
        <Route
          path={ROUTES.ADMIN_ORDERS}
          element={<AdminRoute>{placeholder('Pedidos')}</AdminRoute>}
        />

        <Route path="*" element={placeholder('Página não encontrada')} />
      </Route>
    </Routes>
  </BrowserRouter>
);
