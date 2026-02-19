import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { createPaymentRequest, getUserPaymentRequests, getUserTransactions } from '@/services/firestore';
import { CASH_TO_TOKEN_RATE, MIN_WITHDRAWAL, WITHDRAWAL_COOLDOWN_DAYS } from '@/config/constants';
import type { PaymentRequest, TransactionData } from '@/types';
import {
  FaWallet, FaArrowDown, FaArrowUp, FaCopy, FaCheck, FaHistory, FaCoins, FaGem, FaExchangeAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user, userId, refreshUser } = useUser();
  const [tab, setTab] = useState<'wallet' | 'history'>('wallet');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletInput, setWalletInput] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'wallet') {
        const reqs = await getUserPaymentRequests(userId);
        setPaymentRequests(reqs);
      } else {
        const txs = await getUserTransactions(userId, 50);
        setTransactions(txs);
      }
    } catch {
      /* silent */
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal: ${MIN_WITHDRAWAL} tokens`);
      return;
    }
    if (!walletInput.trim()) {
      toast.error('Enter wallet address');
      return;
    }
    if ((user?.tokenBalance || 0) < amount) {
      toast.error('Insufficient token balance');
      return;
    }
    
    setSubmitting(true);
    try {
      await createPaymentRequest(userId, amount, walletInput.trim());
      await refreshUser();
      toast.success('Withdrawal request submitted!');
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWalletInput('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    }
    setSubmitting(false);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!user) return null;

  const tokenBalance = user.tokenBalance || 0;
  const cashBalance = user.cashBalance || 0;

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-orbitron text-lg text-white flex items-center justify-center gap-2">
          <FaWallet className="text-cyber-cyan" />
          Wallet
        </h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-4 text-center"
        >
          <FaCoins className="text-cyber-gold text-xl mx-auto mb-2" />
          <p className="font-orbitron text-xl text-white">{cashBalance.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">CASH</p>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <FaGem className="text-cyber-cyan text-xl mx-auto mb-2" />
          <p className="font-orbitron text-xl text-cyber-cyan">{tokenBalance.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500">TOKENS</p>
        </motion.div>
      </div>

      {/* Conversion info */}
      <div className="glass-card p-3 flex items-center justify-center gap-3 text-xs text-gray-500">
        <FaExchangeAlt className="text-gray-600" />
        <span>{CASH_TO_TOKEN_RATE} CASH = 1 TOKEN</span>
      </div>

      {/* Wallet address */}
      {user.walletAddress && (
        <div className="glass-card p-4">
          <p className="font-orbitron text-[10px] text-gray-500 tracking-widest mb-2">CONNECTED WALLET</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 font-mono truncate flex-1">{user.walletAddress}</p>
            <button onClick={() => handleCopyId(user.walletAddress!)}>
              {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-gray-500" />}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw button */}
      <button
        onClick={() => setShowWithdraw(!showWithdraw)}
        className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white active:scale-95 transition-transform"
      >
        <FaArrowUp className="inline mr-2" /> Request Withdrawal
      </button>

      {/* Withdraw form */}
      {showWithdraw && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="glass-card p-5 space-y-4"
        >
          <div>
            <label className="font-orbitron text-[10px] text-gray-500 tracking-widest">AMOUNT (TOKENS)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder={`Min ${MIN_WITHDRAWAL}`}
              className="w-full mt-2 p-3 rounded-xl bg-cyber-dark border border-gray-700/50 text-white text-sm focus:border-cyber-cyan outline-none"
            />
          </div>
          <div>
            <label className="font-orbitron text-[10px] text-gray-500 tracking-widest">WALLET ADDRESS</label>
            <input
              type="text"
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              placeholder="Enter TON/EVM wallet address"
              className="w-full mt-2 p-3 rounded-xl bg-cyber-dark border border-gray-700/50 text-white text-sm focus:border-cyber-cyan outline-none font-mono"
            />
          </div>
          <p className="text-[10px] text-gray-600">
            Cooldown: {WITHDRAWAL_COOLDOWN_DAYS} days between withdrawals. Min: {MIN_WITHDRAWAL} tokens.
          </p>
          <button
            onClick={handleWithdraw}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white disabled:opacity-30"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['wallet', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-orbitron text-xs transition-all ${
              tab === t
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                : 'bg-cyber-dark/50 text-gray-500 border border-gray-700/30'
            }`}
          >
            {t === 'wallet' ? 'Requests' : 'History'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin mx-auto" />
        </div>
      ) : tab === 'wallet' ? (
        paymentRequests.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FaArrowDown className="text-3xl text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No withdrawal requests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentRequests.map((req, idx) => (
              <motion.div
                key={req.id || idx}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-sm text-white">{req.amount} TKN</span>
                  <span className={`text-[10px] font-orbitron px-2 py-0.5 rounded-full ${
                    req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono truncate">{req.walletAddress}</p>
                {req.createdAt && (
                  <p className="text-[10px] text-gray-600">
                    {req.createdAt.toDate().toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )
      ) : (
        transactions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FaHistory className="text-3xl text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No transaction history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.id || idx}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-card p-3 flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'credit' ? (
                    <FaArrowDown className="text-green-400 text-sm" />
                  ) : (
                    <FaArrowUp className="text-red-400 text-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{tx.description}</p>
                  {tx.createdAt && (
                    <p className="text-[10px] text-gray-600">
                      {tx.createdAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className={`font-orbitron text-xs ${
                  tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                </p>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
