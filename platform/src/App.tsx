import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from '@/context/UserContext';
import LoadingScreen from '@/components/LoadingScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import TasksPage from '@/pages/TasksPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import FriendsPage from '@/pages/FriendsPage';
import ShopPage from '@/pages/ShopPage';
import WalletPage from '@/pages/WalletPage';
import GamePage from '@/pages/GamePage';
import LeaguesPage from '@/pages/LeaguesPage';

function AppContent() {
  const { loading, onboarded, setOnboarded, user, userId } = useUser();
  const location = useLocation();
  const isGameRoute = location.pathname === '/game';

  // Handle referral from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref !== userId) {
      localStorage.setItem('br4c_referrer', ref);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [userId]);

  // Process referral on user creation
  useEffect(() => {
    if (user && !user.referredBy) {
      const referrer = localStorage.getItem('br4c_referrer');
      if (referrer && referrer !== userId) {
        import('@/services/firestore').then(({ updateUser }) => {
          updateUser(userId, { referredBy: referrer });
        });
        localStorage.removeItem('br4c_referrer');
      }
    }
  }, [user, userId]);

  if (loading) return <LoadingScreen />;
  if (!onboarded) return <OnboardingFlow onComplete={() => setOnboarded(true)} />;

  // Game page is fullscreen, no header/nav
  if (isGameRoute) {
    return (
      <Routes>
        <Route path="/game" element={<GamePage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white relative overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="embers-bg" />
      <Header />
      <main className="pt-20 pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/ranks" element={<LeaderboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/leagues" element={<LeaguesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UserProvider>
        <AppContent />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a0a2e',
              color: '#fff',
              border: '1px solid rgba(0,255,255,0.2)',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'Orbitron, sans-serif',
            },
          }}
        />
      </UserProvider>
    </BrowserRouter>
  );
}
