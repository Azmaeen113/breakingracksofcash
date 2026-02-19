import { useEffect, useState } from 'react';
import { getAllTransactions } from '@/services/adminFirestore';
import { FaArrowDown, FaArrowUp, FaExchangeAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTransactions(200)
      .then(setTransactions)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <span className="text-sm text-gray-500">{transactions.length} records</span>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin mx-auto" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="admin-card text-center py-10">
          <FaExchangeAlt className="text-3xl text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border text-left text-gray-500 text-xs">
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-admin-border/50 hover:bg-white/5">
                  <td className="py-3 px-2">
                    {tx.type === 'credit' ? (
                      <span className="badge-success"><FaArrowDown className="mr-1" />Credit</span>
                    ) : (
                      <span className="badge-danger"><FaArrowUp className="mr-1" />Debit</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs font-mono text-gray-400">{(tx.userId || '').slice(0, 16)}...</td>
                  <td className={`py-3 px-2 text-xs font-mono ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-400 max-w-[200px] truncate">{tx.description}</td>
                  <td className="py-3 px-2 text-xs text-gray-500">
                    {tx.createdAt ? tx.createdAt.toDate().toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
