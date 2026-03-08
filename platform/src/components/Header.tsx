import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { getLeagueProgress } from '@/config/leagues';
import { changeUsername } from '@/services/firestore';
import { FaTimes, FaCheck, FaPen } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, userId, league, vipMultiplier, season, refreshUser } = useUser();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const progress = getLeagueProgress(user.seasonCash);
  const vipLabels = ['', 'Bronze', 'Silver', 'Gold'];
  const vipColors = ['', 'text-orange-400', 'text-gray-300', 'text-yellow-400'];

  const seasonDaysLeft = season
    ? Math.max(0, Math.ceil((season.endDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const displayName = user.odl_first_name || user.odl_username || 'Player';
  const canChangeName = !user.nameChanged;

  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error('Enter a name');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      toast.error('Name must be 2-20 characters');
      return;
    }
    setSaving(true);
    try {
      await changeUsername(userId, trimmed);
      await refreshUser();
      toast.success('Name updated!');
      setShowProfile(false);
      setNewName('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change name');
    }
    setSaving(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 glass px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Profile pic — clickable */}
            <button
              onClick={() => { setShowProfile(true); setNewName(''); }}
              className="relative flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-cyber-cyan/10 flex items-center justify-center text-xs text-cyber-cyan font-bold border border-cyber-cyan/30 hover:border-cyber-cyan/60 transition-colors">
                {displayName[0].toUpperCase()}
              </div>
              {canChangeName && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyber-pink rounded-full flex items-center justify-center">
                  <FaPen className="text-[5px] text-white" />
                </div>
              )}
            </button>
            <button onClick={() => navigate('/leagues')} className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
              <img src={league.image} alt={league.name} className="w-6 h-6 object-contain" />
              <span className="font-orbitron text-xs" style={{ color: league.color }}>{league.name}</span>
              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all" style={{ width: `${progress}%` }} />
              </div>
            </button>
          </div>
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

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-xs space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron text-sm text-white">Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-gray-500"><FaTimes /></button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-cyber-cyan/10 flex items-center justify-center text-2xl text-cyber-cyan font-bold border-2 border-cyber-cyan/30">
                {displayName[0].toUpperCase()}
              </div>
              <p className="font-orbitron text-sm text-white">{displayName}</p>
              <p className="text-[10px] text-gray-600 font-mono">{userId.slice(0, 16)}...</p>
            </div>

            {/* Name change section */}
            {canChangeName ? (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 text-center">
                  You can change your name <span className="text-cyber-pink font-bold">once</span>
                </p>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter your new name"
                  maxLength={20}
                  className="w-full p-3 rounded-xl bg-cyber-dark border border-gray-700/50 text-white text-sm focus:border-cyber-cyan outline-none"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !newName.trim()}
                  className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white active:scale-95 transition-transform disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-[10px]" /> Change Name
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="glass-card p-3 border border-gray-700/20 text-center">
                <p className="text-[10px] text-gray-500">Name already changed</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="glass-card p-2">
                <p className="font-orbitron text-xs text-white">{user.gamesPlayed}</p>
                <p className="text-[9px] text-gray-600">Games</p>
              </div>
              <div className="glass-card p-2">
                <p className="font-orbitron text-xs text-cyber-gold">{user.cashBalance.toLocaleString()}</p>
                <p className="text-[9px] text-gray-600">Cash</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
