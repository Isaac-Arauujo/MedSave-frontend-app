import { Toaster } from 'react-hot-toast';
import { MergeCartConflictModal } from './components/shared/MergeCartConflictModal';
import { OnePharmacyConflictModal } from './components/shared/OnePharmacyConflictModal';
import { AppRouter } from './routes';

export const App = () => (
  <>
    <AppRouter />
    <OnePharmacyConflictModal />
    <MergeCartConflictModal />
    <Toaster position="top-right" />
  </>
);
