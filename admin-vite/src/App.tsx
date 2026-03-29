import { Routes, Route, Outlet } from 'react-router-dom';
import { default as DashboardLayout } from '@/pages/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CategoriesPage from '@/pages/CategoriesPage';
import OrdersPage from '@/pages/OrdersPage';
import SpecialistsPage from '@/pages/SpecialistsPage';
import UsersPage from '@/pages/UsersPage';
import PricingPage from '@/pages/PricingPage';
import DispatcherPage from '@/pages/DispatcherPage';

function DashboardOutlet() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardOutlet />}>
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="specialists" element={<SpecialistsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="dispatcher" element={<DispatcherPage />} />
      </Route>
    </Routes>
  );
}

export default App;
