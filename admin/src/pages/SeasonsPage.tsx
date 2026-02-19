import { useEffect, useState } from 'react';
import { getAllSeasons, createSeason, updateSeason } from '@/services/adminFirestore';
import { FaPlus, FaCalendar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSeason, setNewSeason] = useState({ name: '', startDate: '', endDate: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllSeasons();
      setSeasons(data);
    } catch {
      toast.error('Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      toast.error('Fill all fields');
      return;
    }
    try {
      await createSeason({
        name: newSeason.name,
        startDate: new Date(newSeason.startDate),
        endDate: new Date(newSeason.endDate),
      });
      toast.success('Season created');
      setShowCreate(false);
      setNewSeason({ name: '', startDate: '', endDate: '' });
      load();
    } catch {
      toast.error('Failed to create');
    }
  };

  const handleUpdateStatus = async (id: string) => {
    try {
      await updateSeason(id, { status: editStatus });
      toast.success('Season updated');
      setEditId(null);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Seasons</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="admin-btn-primary flex items-center gap-2 text-xs"
        >
          <FaPlus /> New Season
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="admin-card space-y-3">
          <input
            type="text"
            placeholder="Season Name (e.g. Season 1)"
            value={newSeason.name}
            onChange={e => setNewSeason({ ...newSeason, name: e.target.value })}
            className="admin-input"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={newSeason.startDate}
                onChange={e => setNewSeason({ ...newSeason, startDate: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={newSeason.endDate}
                onChange={e => setNewSeason({ ...newSeason, endDate: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="admin-btn-ghost text-xs">Cancel</button>
            <button onClick={handleCreate} className="admin-btn-primary text-xs">Create</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map(s => (
            <div key={s.id} className="admin-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-admin-accent" />
                  <div>
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{s.id}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  s.status === 'active' ? 'badge-success' : 'badge-info'
                }`}>
                  {s.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                {s.startDate && <span>Start: {s.startDate.toDate().toLocaleDateString()}</span>}
                {s.endDate && <span>End: {s.endDate.toDate().toLocaleDateString()}</span>}
              </div>

              {editId === s.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="admin-input flex-1"
                  >
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                  <button onClick={() => handleUpdateStatus(s.id)} className="admin-btn-primary text-xs"><FaSave /></button>
                  <button onClick={() => setEditId(null)} className="admin-btn-ghost text-xs"><FaTimes /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditId(s.id); setEditStatus(s.status || 'active'); }}
                  className="mt-3 admin-btn-ghost text-xs flex items-center gap-1"
                >
                  <FaEdit /> Edit Status
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
