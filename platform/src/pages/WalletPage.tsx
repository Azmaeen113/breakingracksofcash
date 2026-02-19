import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { updateUser, getUserTransactions } from '@/services/firestore';
import { CASH_TO_TOKEN_RATE } from '@/config/constants';
import type { TransactionData } from '@/types';
import {
  FaWallet, FaArrowDown, FaArrowUp, FaCopy, FaCheck, FaHistory, FaCoins, FaGem, FaExchangeAlt, FaLink
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user, userId, refreshUser } = useUser();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletInput, setWalletInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const txs = await getUserTransactions(userId, 50);
      setTransactions(txs);
    } catch {
      /* silent */
    }
    setLoading(false);
  };

  const handleConnectWallet = async () => {
    const addr = walletInput.trim();
    if (!addr) {
      toast.error('Enter a valid wallet address');
      return;
    }
    setConnecting(true);
    try {
      await updateUser(userId, { walletAddress: addr });
      await refreshUser();
      toast.success('Wallet connected!');
      setWalletInput('');
    } catch {
      toast.error('Failed to connect wallet');
    }
    setConnecting(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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

      {/* Connected wallet or connect form */}
      {user.walletAddress ? (
        <div className="glass-card p-4">
          <p className="font-orbitron text-[10px] text-gray-500 tracking-widest mb-2">CONNECTED WALLET</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 font-mono truncate flex-1">{user.walletAddress}</p>
            <button onClick={() => handleCopy(user.walletAddress!)}>
              {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-gray-500" />}
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 space-y-4 border border-cyber-cyan/20"
        >
          <div className="text-center">
            <FaLink className="text-cyber-cyan text-2xl mx-auto mb-2" />
            <p className="font-orbitron text-xs text-white">Connect Your Wallet</p>
            <p className="text-[10px] text-gray-500 mt-1">Connect to receive season rewards</p>
          </div>
          <input
            type="text"
            value={walletInput}
            onChange={e => setWalletInput(e.target.value)}
            placeholder="Enter TON/EVM wallet address"
            className="w-full p-3 rounded-xl bg-cyber-dark border border-gray-700/50 text-white text-sm focus:border-cyber-cyan outline-none font-mono"
          />
          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white active:scale-95 transition-transform disabled:opacity-30"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </motion.div>
      )}

      {/* Season rewards info */}
      <div className="glass-card p-4 border border-cyber-gold/20">
        <p className="font-orbitron text-[10px] text-cyber-gold tracking-widest mb-2">SEASON REWARDS</p>
        <p className="text-xs text-gray-400">
          Top players on the leaderboard will receive token rewards at the end of each season.
          Make sure your wallet is connected to receive prizes!
        </p>
      </div>

      {/* Transaction History */}
      <div className="flex items-center gap-2">
        <FaHistory className="text-gray-500" />
        <h2 className="font-orbitron text-xs text-gray-400 tracking-widest">TRANSACTION HISTORY</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin mx-auto" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FaHistory className="text-3xl text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No transaction history yet</p>
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
      )}
    </div>
  );
}
