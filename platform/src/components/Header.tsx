import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { getLeagueProgress } from '@/config/leagues';

export default function Header() {
  const { user, league, vipMultiplier, season } = useUser();
  const navigate = useNavigate();
  if (!user) return null;

  const progress = getLeagueProgress(user.seasonCash);
  const vipLabels = ['', 'Bronze', 'Silver', 'Gold'];
  const vipColors = ['', 'text-orange-400', 'text-gray-300', 'text-yellow-400'];

  const seasonDaysLeft = season
    ? Math.max(0, Math.ceil((season.endDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 glass px-4 pt-3 pb-2 space-y-2">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/leagues')} className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
          <img src={league.image} alt={league.name} className="w-6 h-6 object-contain" />
          <span className="font-orbitron text-xs" style={{ color: league.color }}>{league.name}</span>
          <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all" style={{ width: `${progress}%` }} />
          </div>
        </button>
        <button onClick={() => navigate('/wallet')} className="glass-card px-3 py-1.5 rounded-full font-mono text-xs text-cyber-cyan">
          {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        {user.vipTier > 0 ? (
          <span className={`font-orbitron ${vipColors[user.vipTier]} fire-border rounded-full px-3 py-0.5`}>
            VIP {vipLabels[user.vipTier]} · {vipMultiplier}x
          </span>
        ) : (
          <span className="text-gray-600 text-[10px]">Free Tier</span>
        )}
        {season && (
          <span className="text-gray-400 bg-cyber-mid/50 rounded-full px-3 py-0.5">
            Season {season.name} · {seasonDaysLeft}d left
          </span>
        )}
      </div>
    </div>
  );
}
