import { Toaster } from 'react-hot-toast';
import { OnePharmacyConflictModal } from './components/shared/OnePharmacyConflictModal';
import { AppRouter } from './routes';

export const App = () => (
  <>
    <AppRouter />
    <OnePharmacyConflictModal />
    <Toaster position="top-right" />
  </>
);
