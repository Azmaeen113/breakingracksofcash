import { useEffect, useState } from 'react';
import { getActiveVipUsers, adminSetVip, adminRemoveVip } from '@/services/adminFirestore';
import { FaCrown, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function VipPage() {
  const [vipUsers, setVipUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [grantData, setGrantData] = useState({ userId: '', tier: 1, days: 30 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getActiveVipUsers();
      setVipUsers(data);
    } catch {
      toast.error('Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGrant = async () => {
    if (!grantData.userId.trim()) {
      toast.error('Enter user ID');
      return;
    }
    try {
      await adminSetVip(grantData.userId.trim(), grantData.tier, grantData.days);
      toast.success('VIP granted');
      setShowGrant(false);
      setGrantData({ userId: '', tier: 1, days: 30 });
      load();
    } catch {
      toast.error('Failed to grant VIP');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove VIP from this user?')) return;
    try {
      await adminRemoveVip(userId);
      toast.success('VIP removed');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const TIER_NAMES = ['—', 'Bronze', 'Silver', 'Gold'];
  const TIER_COLORS = ['', 'text-amber-500', 'text-gray-300', 'text-yellow-400'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">VIP Management</h1>
        <button
          onClick={() => setShowGrant(!showGrant)}
          className="admin-btn-primary flex items-center gap-2 text-xs"
        >
          <FaPlus /> Grant VIP
        </button>
      </div>

      {/* Grant VIP */}
      {showGrant && (
        <div className="admin-card space-y-3">
          <input
            type="text"
            placeholder="User ID"
            value={grantData.userId}
            onChange={e => setGrantData({ ...grantData, userId: e.target.value })}
            className="admin-input font-mono"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tier</label>
              <select
                value={grantData.tier}
                onChange={e => setGrantData({ ...grantData, tier: Number(e.target.value) })}
                className="admin-input"
              >
                <option value={1}>Bronze (Tier 1)</option>
                <option value={2}>Silver (Tier 2)</option>
                <option value={3}>Gold (Tier 3)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duration (days)</label>
              <input
                type="number"
                value={grantData.days}
                onChange={e => setGrantData({ ...grantData, days: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowGrant(false)} className="admin-btn-ghost text-xs">Cancel</button>
            <button onClick={handleGrant} className="admin-btn-primary text-xs">Grant</button>
          </div>
        </div>
      )}

      {/* VIP users list */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : vipUsers.length === 0 ? (
        <div className="admin-card text-center py-10">
          <FaCrown className="text-3xl text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No active VIP users</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vipUsers.map(u => (
            <div key={u.id} className="admin-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FaCrown className={TIER_COLORS[u.vipTier] || 'text-gray-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{u.odl_first_name || 'Player'}</p>
                <p className="text-[10px] text-gray-500 font-mono truncate">{u.id}</p>
                <p className="text-[10px] text-gray-600">
                  {TIER_NAMES[u.vipTier] || 'Unknown'} — 
                  Expires: {u.vipExpiresAt ? u.vipExpiresAt.toDate().toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => handleRemove(u.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
