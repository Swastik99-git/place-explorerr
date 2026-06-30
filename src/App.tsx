import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Users      = lazy(() => import('./pages/Users'));
const UserPlaces = lazy(() => import('./pages/UserPlaces'));
const Auth       = lazy(() => import('./pages/Auth'));
const NewPlace   = lazy(() => import('./pages/NewPlace'));
const UpdatePlace= lazy(() => import('./pages/UpdatePlace'));
const NotFound   = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="center" style={{ height: '60vh' }}>
    <LoadingSpinner size="lg" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Users />} />
            <Route path="/:userId/places" element={<UserPlaces />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/places/new" element={
              <ProtectedRoute><NewPlace /></ProtectedRoute>
            } />
            <Route path="/places/:placeId/edit" element={
              <ProtectedRoute><UpdatePlace /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const AppShell: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="center bg-gradient-surface" style={{ height: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-surface" style={{ minHeight: '100vh' }}>
      <Navigation />
      <AnimatedRoutes />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--surface-1)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: { primary: 'var(--color-primary-500)', secondary: 'var(--surface-1)' },
            },
            error: {
              iconTheme: { primary: 'var(--color-error-500)', secondary: 'var(--surface-1)' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
