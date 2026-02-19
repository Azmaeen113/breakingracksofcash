import { useEffect, useState } from 'react';
import { getAdminActions } from '@/services/adminFirestore';
import { FaHistory, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminActions(200)
      .then(setActions)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin Actions Log</h1>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : actions.length === 0 ? (
        <div className="admin-card text-center py-10">
          <FaHistory className="text-3xl text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No admin actions logged</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map(a => (
            <div key={a.id} className="admin-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaShieldAlt className="text-admin-accent text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{a.action}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.details}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                  <span>By: {a.adminId || 'Unknown'}</span>
                  {a.createdAt && <span>{a.createdAt.toDate().toLocaleString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
