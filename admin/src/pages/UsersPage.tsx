import { useEffect, useState } from 'react';
import { getAllUsers, searchUsers, adminUpdateUser, adminDeleteUser, getUserPaymentRequests, getUserEnergyPurchases, getUserVipPurchases, getUserTransactions } from '@/services/adminFirestore';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaSave, FaCoins, FaCrown, FaCopy, FaWallet, FaEye, FaBolt, FaExchangeAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'wallet' | 'payments' | 'energy' | 'vip' | 'transactions'>('wallet');
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [userEnergy, setUserEnergy] = useState<any[]>([]);
  const [userVip, setUserVip] = useState<any[]>([]);
  const [userTxns, setUserTxns] = useState<any[]>([]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = search ? await searchUsers(search) : await getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      // Only include fields that were actually changed (prevents overwriting stale data)
      const updates: Record<string, any> = {};
      const fields = ['cashBalance', 'tokenBalance', 'gameEnergy', 'vipTier', 'cooldownResets'];
      for (const key of fields) {
        if (editData[key] !== undefined && String(editData[key]) !== String(editUser[key] ?? '')) {
          updates[key] = Number(editData[key]);
        }
      }
      if (Object.keys(updates).length === 0) {
        toast('No changes detected');
        setEditUser(null);
        return;
      }
      await adminUpdateUser(editUser.id, updates);
      toast.success('User updated');
      setEditUser(null);
      loadUsers();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminDeleteUser(userId);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openUserDetail = async (user: any) => {
    setDetailUser(user);
    setDetailTab('wallet');
    setDetailLoading(true);
    try {
      const [payments, energy, vip, txns] = await Promise.all([
        getUserPaymentRequests(user.id),
        getUserEnergyPurchases(user.id),
        getUserVipPurchases(user.id),
        getUserTransactions(user.id),
      ]);
      setUserPayments(payments);
      setUserEnergy(energy);
      setUserVip(vip);
      setUserTxns(txns);
    } catch {
      toast.error('Failed to load user details');
    }
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Users</h1>
        <span className="text-sm text-gray-500">{users.length} users</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or username..."
            className="admin-input pl-10"
          />
        </div>
        <button type="submit" className="admin-btn-primary">Search</button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border text-left text-gray-500 text-xs">
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">Cash</th>
                <th className="py-3 px-2">Tokens</th>
                <th className="py-3 px-2">Games</th>
                <th className="py-3 px-2">VIP</th>
                <th className="py-3 px-2">Energy</th>
                <th className="py-3 px-2">Wallet</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-admin-border/50 hover:bg-white/5">
                  <td className="py-3 px-2">
                    <p className="text-white text-xs font-medium">{u.odl_first_name || 'Player'}</p>
                    <button
                      onClick={() => openUserDetail(u)}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] font-mono hover:underline cursor-pointer"
                      title="View wallet &amp; payment details"
                    >
                      {u.id.slice(0, 16)}...
                    </button>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-green-400">{(u.cashBalance || 0).toLocaleString()}</td>
                  <td className="py-3 px-2 font-mono text-xs text-cyan-400">{(u.tokenBalance || 0).toFixed(2)}</td>
                  <td className="py-3 px-2 text-xs text-gray-400">{u.gamesPlayed || 0}</td>
                  <td className="py-3 px-2">
                    {u.vipTier > 0 ? (
                      <span className="badge-warning"><FaCrown className="mr-1" />{u.vipTier}</span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-400">{u.gameEnergy || 0}</td>
                  <td className="py-3 px-2">
                    {u.walletAddress ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-yellow-400">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(u.walletAddress); toast.success('Copied!'); }}
                          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white"
                          title={u.walletAddress}
                        >
                          <FaCopy className="text-[10px]" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditUser(u); setEditData(u); }} className="p-1.5 rounded hover:bg-white/10 text-gray-400">
                        <FaEdit className="text-xs" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded hover:bg-red-500/10 text-red-400">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="admin-card w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Edit User</h2>
              <button onClick={() => setEditUser(null)}><FaTimes className="text-gray-500" /></button>
            </div>
            <p className="text-xs text-gray-500 font-mono">{editUser.id}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'cashBalance', label: 'Cash Balance' },
                { key: 'tokenBalance', label: 'Token Balance' },
                { key: 'gameEnergy', label: 'Energy' },
                { key: 'vipTier', label: 'VIP Tier (0-3)' },
                { key: 'cooldownResets', label: 'Cooldown Resets' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type="number"
                    value={editData[f.key] ?? ''}
                    onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                    className="admin-input"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="admin-btn-ghost">Cancel</button>
              <button onClick={handleSave} className="admin-btn-primary flex items-center gap-2">
                <FaSave className="text-xs" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail / Wallet & Airdrop Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetailUser(null)}>
          <div className="admin-card w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <FaEye className="text-cyan-400" /> Player Detail
              </h2>
              <button onClick={() => setDetailUser(null)}><FaTimes className="text-gray-500" /></button>
            </div>

            {/* Player info header */}
            <div className="p-3 rounded-lg bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{detailUser.odl_first_name || 'Player'}</p>
                  <p className="text-gray-500 text-[10px]">@{detailUser.odl_username || 'unknown'}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Cash: <span className="text-green-400 font-mono">{(detailUser.cashBalance || 0).toLocaleString()}</span></p>
                  <p>Tokens: <span className="text-cyan-400 font-mono">{(detailUser.tokenBalance || 0).toFixed(2)}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">ID:</span>
                <span className="font-mono text-[10px] text-gray-400">{detailUser.id}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(detailUser.id); toast.success('ID copied!'); }}
                  className="p-0.5 rounded hover:bg-white/10 text-gray-600 hover:text-white"
                >
                  <FaCopy className="text-[8px]" />
                </button>
              </div>
            </div>

            {/* Wallet / Airdrop Section */}
            <div className="p-3 rounded-lg bg-white/5 border border-yellow-500/20 space-y-2">
              <p className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                <FaWallet /> Wallet (for Airdrops)
              </p>
              {detailUser.walletAddress ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-yellow-300 break-all">{detailUser.walletAddress}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(detailUser.walletAddress); toast.success('Wallet copied!'); }}
                      className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white flex-shrink-0"
                    >
                      <FaCopy className="text-xs" />
                    </button>
                  </div>
                  <a
                    href={`https://bscscan.com/address/${detailUser.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    View on BscScan →
                  </a>
                </div>
              ) : (
                <p className="text-gray-600 text-xs">No wallet connected</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 text-[10px]">
              {([
                { key: 'payments', label: 'Withdrawals', icon: FaCoins },
                { key: 'energy', label: 'Energy Buys', icon: FaBolt },
                { key: 'vip', label: 'VIP Purchases', icon: FaCrown },
                { key: 'transactions', label: 'Transactions', icon: FaExchangeAlt },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
                    detailTab === t.key
                      ? 'bg-admin-accent/20 text-admin-accent border border-admin-accent/30'
                      : 'bg-white/5 text-gray-500 border border-transparent'
                  }`}
                >
                  <t.icon className="text-[8px]" /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {detailLoading ? (
              <div className="text-center py-6">
                <div className="w-5 h-5 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detailTab === 'payments' && (
                  userPayments.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">No withdrawal requests</p>
                  ) : (
                    userPayments.map((p: any) => (
                      <div key={p.id} className="p-2 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                        <div>
                          <p className="text-white">{p.amount} tokens</p>
                          <p className="text-[10px] text-gray-500 font-mono">{p.walletAddress?.slice(0, 10)}...{p.walletAddress?.slice(-6)}</p>
                          <p className="text-[10px] text-gray-600">{p.createdAt?.toDate?.()?.toLocaleString?.() || '—'}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          p.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{p.status}</span>
                      </div>
                    ))
                  )
                )}

                {detailTab === 'energy' && (
                  userEnergy.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">No energy purchases</p>
                  ) : (
                    userEnergy.map((e: any) => (
                      <div key={e.id} className="p-2 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                        <div>
                          <p className="text-white">+{e.energy} energy — ${e.amountUSD}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{e.txHash?.slice(0, 16)}...</p>
                          <p className="text-[10px] text-gray-600">{e.purchasedAt?.toDate?.()?.toLocaleString?.() || '—'}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">{e.status}</span>
                      </div>
                    ))
                  )
                )}

                {detailTab === 'vip' && (
                  userVip.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">No VIP purchases</p>
                  ) : (
                    userVip.map((v: any) => (
                      <div key={v.id} className="p-2 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                        <div>
                          <p className="text-white">VIP Tier {v.tier} — ${v.amountUSD}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{v.txHash?.slice(0, 16)}...</p>
                          <p className="text-[10px] text-gray-600">{v.purchasedAt?.toDate?.()?.toLocaleString?.() || '—'}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">{v.status}</span>
                      </div>
                    ))
                  )
                )}

                {detailTab === 'transactions' && (
                  userTxns.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-4">No transactions</p>
                  ) : (
                    userTxns.map((t: any) => (
                      <div key={t.id} className="p-2 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                        <div>
                          <p className="text-white">{t.description}</p>
                          <p className="text-[10px] text-gray-600">{t.createdAt?.toDate?.()?.toLocaleString?.() || '—'}</p>
                        </div>
                        <span className={`font-mono text-xs ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'credit' ? '+' : '-'}{t.amount?.toLocaleString?.() || t.amount}
                        </span>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
