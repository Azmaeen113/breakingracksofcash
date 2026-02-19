import { useEffect, useState } from 'react';
import { getAllPaymentRequests, updatePaymentRequest } from '@/services/adminFirestore';
import { FaCheck, FaTimes, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [note, setNote] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllPaymentRequests(filter || undefined);
      setRequests(data);
    } catch {
      toast.error('Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updatePaymentRequest(id, status, note);
      toast.success(`Request ${status}`);
      setActionId(null);
      setNote('');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Payment Requests</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filter === f ? 'bg-admin-accent text-white' : 'bg-admin-card text-gray-400 hover:bg-white/5'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : requests.length === 0 ? (
        <div className="admin-card text-center py-10">
          <FaMoneyBillWave className="text-3xl text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No payment requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="admin-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{req.amount} Tokens</p>
                  <p className="text-xs text-gray-500 font-mono">{req.userId}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  req.status === 'pending' ? 'badge-warning' :
                  req.status === 'approved' ? 'badge-success' : 'badge-danger'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Wallet: <span className="font-mono text-gray-400">{req.walletAddress}</span></p>
                {req.createdAt && (
                  <p className="flex items-center gap-1">
                    <FaClock className="text-[10px]" />
                    {req.createdAt.toDate().toLocaleString()}
                  </p>
                )}
                {req.adminNote && <p>Note: {req.adminNote}</p>}
              </div>

              {req.status === 'pending' && (
                <div className="space-y-2">
                  {actionId === req.id ? (
                    <>
                      <input
                        type="text"
                        placeholder="Admin note (optional)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="admin-input text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approved')}
                          className="admin-btn-primary flex-1 flex items-center justify-center gap-1 text-xs"
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="admin-btn-danger flex-1 flex items-center justify-center gap-1 text-xs"
                        >
                          <FaTimes /> Reject
                        </button>
                        <button onClick={() => setActionId(null)} className="admin-btn-ghost text-xs">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setActionId(req.id)}
                      className="admin-btn-primary w-full text-xs"
                    >
                      Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
