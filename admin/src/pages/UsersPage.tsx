import { useEffect, useState } from 'react';
import { getAllUsers, searchUsers, adminUpdateUser, adminDeleteUser } from '@/services/adminFirestore';
import { FaSearch, FaEdit, FaTrash, FaTimes, FaSave, FaCoins, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

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
      const updates: Record<string, any> = {};
      if (editData.cashBalance !== undefined) updates.cashBalance = Number(editData.cashBalance);
      if (editData.tokenBalance !== undefined) updates.tokenBalance = Number(editData.tokenBalance);
      if (editData.gameEnergy !== undefined) updates.gameEnergy = Number(editData.gameEnergy);
      if (editData.vipTier !== undefined) updates.vipTier = Number(editData.vipTier);
      if (editData.cooldownResets !== undefined) updates.cooldownResets = Number(editData.cooldownResets);
      
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
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-admin-border/50 hover:bg-white/5">
                  <td className="py-3 px-2">
                    <p className="text-white text-xs font-medium">{u.odl_first_name || 'Player'}</p>
                    <p className="text-gray-600 text-[10px] font-mono">{u.id.slice(0, 16)}...</p>
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
    </div>
  );
}
