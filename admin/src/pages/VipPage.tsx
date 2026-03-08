import { useEffect, useState } from 'react';
import {
  getActiveVipUsers, adminSetVip, adminRemoveVip,
  getAllVipPurchases, getAllEnergyPurchases, adminGrantEnergy
} from '@/services/adminFirestore';
import { FaCrown, FaPlus, FaTimes, FaBolt, FaHistory, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function VipPage() {
  const [tab, setTab] = useState<'active' | 'purchases' | 'energy'>('active');
  const [vipUsers, setVipUsers] = useState<any[]>([]);
  const [vipPurchases, setVipPurchases] = useState<any[]>([]);
  const [energyPurchases, setEnergyPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [showGrantEnergy, setShowGrantEnergy] = useState(false);
  const [grantData, setGrantData] = useState({ userId: '', tier: 1, days: 30 });
  const [energyGrantData, setEnergyGrantData] = useState({ userId: '', amount: 5 });

  const load = async () => {
    setLoading(true);
    try {
      const [vips, purchases, energy] = await Promise.all([
        getActiveVipUsers(),
        getAllVipPurchases(),
        getAllEnergyPurchases(),
      ]);
      setVipUsers(vips);
      setVipPurchases(purchases);
      setEnergyPurchases(energy);
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

  const handleGrantEnergy = async () => {
    if (!energyGrantData.userId.trim()) {
      toast.error('Enter user ID');
      return;
    }
    try {
      await adminGrantEnergy(energyGrantData.userId.trim(), energyGrantData.amount);
      toast.success(`Granted ${energyGrantData.amount} energy`);
      setShowGrantEnergy(false);
      setEnergyGrantData({ userId: '', amount: 5 });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to grant energy');
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">Subscriptions & VIP</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrantEnergy(!showGrantEnergy)}
            className="admin-btn-ghost flex items-center gap-1 text-xs border border-cyan-600/30"
          >
            <FaBolt className="text-cyan-400" /> Grant Energy
          </button>
          <button
            onClick={() => setShowGrant(!showGrant)}
            className="admin-btn-primary flex items-center gap-2 text-xs"
          >
            <FaPlus /> Grant VIP
          </button>
        </div>
      </div>

      {/* Grant VIP */}
      {showGrant && (
        <div className="admin-card space-y-3">
          <h3 className="text-sm font-semibold text-white">Grant VIP Subscription</h3>
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

      {/* Grant Energy */}
      {showGrantEnergy && (
        <div className="admin-card space-y-3">
          <h3 className="text-sm font-semibold text-white">Grant Extra Energy</h3>
          <input
            type="text"
            placeholder="User ID"
            value={energyGrantData.userId}
            onChange={e => setEnergyGrantData({ ...energyGrantData, userId: e.target.value })}
            className="admin-input font-mono"
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount</label>
            <input
              type="number"
              min={1}
              value={energyGrantData.amount}
              onChange={e => setEnergyGrantData({ ...energyGrantData, amount: Number(e.target.value) })}
              className="admin-input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowGrantEnergy(false)} className="admin-btn-ghost text-xs">Cancel</button>
            <button onClick={handleGrantEnergy} className="admin-btn-primary text-xs">Grant Energy</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'active', label: 'Active VIPs', icon: FaCrown },
          { key: 'purchases', label: 'VIP Purchases', icon: FaHistory },
          { key: 'energy', label: 'Energy Purchases', icon: FaBolt },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === t.key
                ? 'bg-admin-accent/10 text-admin-accent border border-admin-accent/30'
                : 'bg-admin-card text-gray-500 border border-admin-border'
            }`}
          >
            <t.icon className="text-[10px]" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : tab === 'active' ? (
        /* Active VIP users */
        vipUsers.length === 0 ? (
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
        )
      ) : tab === 'purchases' ? (
        /* VIP Purchase History */
        vipPurchases.length === 0 ? (
          <div className="admin-card text-center py-10">
            <FaHistory className="text-3xl text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No VIP purchases yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-admin-border">
                  <th className="text-left py-2 px-3">User</th>
                  <th className="text-left py-2 px-3">Tier</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-left py-2 px-3">Tx Hash</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {vipPurchases.map((p: any) => (
                  <tr key={p.id} className="border-b border-admin-border/50 hover:bg-white/5">
                    <td className="py-2 px-3 font-mono text-gray-400 truncate max-w-[120px]">{p.userId}</td>
                    <td className="py-2 px-3">
                      <span className={TIER_COLORS[p.tier] || 'text-gray-400'}>
                        {TIER_NAMES[p.tier] || `T${p.tier}`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-green-400">${p.amountUSD || 0}</td>
                    <td className="py-2 px-3 font-mono text-gray-500 truncate max-w-[100px]">
                      {p.txHash ? p.txHash.slice(0, 12) + '...' : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {p.purchasedAt?.toDate?.().toLocaleDateString() || '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        p.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                        p.status === 'expired' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Energy Purchase History */
        energyPurchases.length === 0 ? (
          <div className="admin-card text-center py-10">
            <FaBolt className="text-3xl text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No energy purchases yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-admin-border">
                  <th className="text-left py-2 px-3">User</th>
                  <th className="text-left py-2 px-3">Energy</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-left py-2 px-3">Tx Hash</th>
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {energyPurchases.map((p: any) => (
                  <tr key={p.id} className="border-b border-admin-border/50 hover:bg-white/5">
                    <td className="py-2 px-3 font-mono text-gray-400 truncate max-w-[120px]">{p.userId}</td>
                    <td className="py-2 px-3 text-cyan-400">+{p.energy}</td>
                    <td className="py-2 px-3 text-green-400">${p.amountUSD || 0}</td>
                    <td className="py-2 px-3 font-mono text-gray-500 truncate max-w-[100px]">
                      {p.txHash ? p.txHash.slice(0, 12) + '...' : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {p.purchasedAt?.toDate?.().toLocaleDateString() || '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        p.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
