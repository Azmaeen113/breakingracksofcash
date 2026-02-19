import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import PaymentsPage from '@/pages/PaymentsPage';
import SeasonsPage from '@/pages/SeasonsPage';
import VipPage from '@/pages/VipPage';
import TransactionsPage from '@/pages/TransactionsPage';
import ActionsPage from '@/pages/ActionsPage';

function AdminLayout() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-dark">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-admin-dark">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/seasons" element={<SeasonsPage />} />
          <Route path="/vip" element={<VipPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/actions" element={<ActionsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
