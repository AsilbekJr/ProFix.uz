import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setCredentials } from './store/authSlice';
import { useGetMeQuery } from './store/apiSlice';
import { useEffect } from 'react';
import BottomNav from './components/BottomNav';
import { Loader2 } from 'lucide-react';
import { useTelegramInit } from './hooks/useTelegramInit';

const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CreateOrderPage = React.lazy(() => import('./pages/CreateOrderPage'));
const ApplySpecialistPage = React.lazy(() => import('./pages/ApplySpecialistPage'));
const SpecialistProfilePage = React.lazy(() => import('./pages/SpecialistProfilePage'));
const SpecialistsListPage = React.lazy(() => import('./pages/SpecialistsListPage'));
const ReviewPage = React.lazy(() => import('./pages/ReviewPage'));
const JobBoardPage = React.lazy(() => import('./pages/JobBoardPage'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
     <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/auth" />;
}

export default function App() {
  useTelegramInit(); // Automatically logs user in if opened via TWA
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  
  const { data: userData } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (userData?.data && token) {
      dispatch(setCredentials({ user: userData.data, token }));
    }
  }, [userData, token, dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '12px'
          }
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/order/create" element={<PrivateRoute><CreateOrderPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/apply-specialist" element={<PrivateRoute><ApplySpecialistPage /></PrivateRoute>} />
          <Route path="/category/:id" element={<PrivateRoute><SpecialistsListPage /></PrivateRoute>} />
          <Route path="/specialists/:id" element={<PrivateRoute><SpecialistProfilePage /></PrivateRoute>} />
          <Route path="/review/:orderId" element={<PrivateRoute><ReviewPage /></PrivateRoute>} />
          <Route path="/jobs" element={<PrivateRoute><JobBoardPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>

      {/* Bottom nav only on private pages */}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth" element={null} />
          <Route path="*" element={
            <PrivateRoute><BottomNav /></PrivateRoute>
          } />
        </Routes>
      </Suspense>
    </>
  );
}
