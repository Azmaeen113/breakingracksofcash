import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/services/adminFirestore';
import {
  FaUsers, FaMoneyBillWave, FaGamepad, FaCrown, FaCoins, FaGem
} from 'react-icons/fa';

interface Stats {
  totalUsers: number;
  pendingPayments: number;
  activeVips: number;
  totalCash: number;
  totalTokens: number;
  totalGamesPlayed: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500">Failed to load stats</p>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: FaUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: FaMoneyBillWave, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Active VIPs', value: stats.activeVips, icon: FaCrown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Cash', value: stats.totalCash.toLocaleString(), icon: FaCoins, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Tokens', value: stats.totalTokens.toFixed(2), icon: FaGem, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Games Played', value: stats.totalGamesPlayed.toLocaleString(), icon: FaGamepad, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="admin-card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <Icon className={`text-xl ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
