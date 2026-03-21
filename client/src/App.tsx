import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setCredentials } from './store/authSlice';
import { useGetMeQuery } from './store/apiSlice';
import { useEffect } from 'react';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import CreateOrderPage from './pages/CreateOrderPage';
import ApplySpecialistPage from './pages/ApplySpecialistPage';
import SpecialistProfilePage from './pages/SpecialistProfilePage';
import SpecialistsListPage from './pages/SpecialistsListPage';
import ReviewPage from './pages/ReviewPage';
import BottomNav from './components/BottomNav';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/auth" />;
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  
  const { data: userData } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (userData?.data && token) {
      dispatch(setCredentials({ user: userData.data, token }));
    }
  }, [userData, token, dispatch]);

  return (
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom nav only on private pages */}
      <Routes>
        <Route path="/auth" element={null} />
        <Route path="*" element={
          <PrivateRoute><BottomNav /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
