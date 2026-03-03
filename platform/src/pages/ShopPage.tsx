import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { VIP_PLANS, getVipMultiplier, getTapDamage } from '@/config/vipPlans';
import { activateVip } from '@/services/firestore';
import { TON_RECEIVER_WALLET } from '@/config/constants';
import { FaCrown, FaBolt, FaGamepad, FaTimes, FaCheck, FaShoppingCart, FaFire, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const { user, userId, refreshUser } = useUser();
  const [tab, setTab] = useState<'vip' | 'items'>('vip');
  const [selectedPlan, setSelectedPlan] = useState<typeof VIP_PLANS[0] | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!user) return null;

  const handlePurchaseVip = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      // Use TonConnect for payment
      const tonconnect = (window as any).__tonConnectUI;
      if (tonconnect) {
        // Calculate TON amount (approximate, could use price oracle)
        const tonAmount = selectedPlan.priceUSD; // Simplified: 1 USD ≈ adjusted TON amount
        try {
          const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
              {
                address: TON_RECEIVER_WALLET,
                amount: String(Math.floor(tonAmount * 1e9)), // nanoTON
              },
            ],
          };
          await tonconnect.sendTransaction(tx);
          // Payment successful - activate VIP
          await activateVip(userId, selectedPlan.tier, selectedPlan.durationDays);
          await refreshUser();
          toast.success(`VIP ${selectedPlan.name} activated!`);
          setSelectedPlan(null);
        } catch (txErr: any) {
          if (txErr?.message?.includes('cancel')) {
            toast.error('Transaction cancelled');
          } else {
            toast.error('Payment failed. Please try again.');
          }
        }
      } else {
        // Fallback: show TON wallet address for manual payment
        try {
          await navigator.clipboard.writeText(TON_RECEIVER_WALLET);
          toast(`Send $${selectedPlan.priceUSD} worth of TON to the copied wallet address.\nWallet copied to clipboard!`, {
            icon: '💎',
            duration: 6000,
          });
        } catch {
          toast(`Send $${selectedPlan.priceUSD} worth of TON to:\n${TON_RECEIVER_WALLET}`, {
            icon: '💎',
            duration: 8000,
          });
        }
      }
    } catch (err) {
      toast.error('Purchase failed');
    }
    setProcessing(false);
  };

  const handleBuyItem = async (itemType: string) => {
    setProcessing(true);
    try {
      if (itemType === 'cooldown_reset') {
        const { useCooldownReset } = await import('@/services/firestore');
        const success = await useCooldownReset(userId);
        if (success) {
          await refreshUser();
          toast.success('Cooldown reduced by 12 hours!');
        } else {
          toast.error('No cooldown resets available');
        }
      } else if (itemType === 'energy') {
        const { updateUser } = await import('@/services/firestore');
        await updateUser(userId, { gameEnergy: (user.gameEnergy || 0) + 1 });
        await refreshUser();
        toast.success('+1 Energy added!');
      }
    } catch {
      toast.error('Failed to use item');
    }
    setProcessing(false);
  };

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-orbitron text-lg text-white flex items-center justify-center gap-2">
          <FaShoppingCart className="text-cyber-pink" />
          Shop
        </h1>
        <p className="text-xs text-gray-500">Upgrade your experience</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['vip', 'items'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-orbitron text-xs transition-all ${
              tab === t
                ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/30'
                : 'bg-cyber-dark/50 text-gray-500 border border-gray-700/30'
            }`}
          >
            {t === 'vip' ? 'VIP Plans' : 'Items'}
          </button>
        ))}
      </div>

      {tab === 'vip' ? (
        <>
          {/* Current VIP status */}
          {user.vipTier > 0 && (
            <div className="glass-card p-4 border border-cyber-gold/30">
              <div className="flex items-center gap-2">
                <FaCrown className="text-cyber-gold" />
                <span className="font-orbitron text-xs text-cyber-gold">
                  VIP TIER {user.vipTier} ACTIVE
                </span>
              </div>
              {user.vipExpiresAt && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Expires: {user.vipExpiresAt.toDate().toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* VIP Plans */}
          <div className="space-y-4">
            {VIP_PLANS.map((plan, idx) => {
              const isActive = user.vipTier >= plan.tier;
              return (
                <motion.div
                  key={plan.tier}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`glass-card p-5 space-y-4 ${
                    isActive ? 'border border-green-500/30' :
                    plan.tier === 3 ? 'fire-border' : 'border border-gray-700/20'
                  }`}
                >
                  {/* Plan header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.tier === 1 ? 'bg-amber-600/20' :
                        plan.tier === 2 ? 'bg-gray-400/20' : 'bg-cyber-gold/20'
                      }`}>
                        <FaCrown className={`text-xl ${
                          plan.tier === 1 ? 'text-amber-500' :
                          plan.tier === 2 ? 'text-gray-300' : 'text-cyber-gold'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-orbitron text-sm text-white">{plan.name}</h3>
                        <p className="text-[10px] text-gray-500">{plan.durationDays} days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-orbitron text-lg text-white">${plan.priceUSD}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {plan.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <FaCheck className="text-cyber-cyan text-[10px] flex-shrink-0" />
                        <span className="text-[11px] text-gray-400">{b}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <FaStar className="text-cyber-gold text-[10px] flex-shrink-0" />
                      <span className="text-[11px] text-cyber-gold">
                        {getVipMultiplier(plan.tier)}x score multiplier
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaFire className="text-cyber-pink text-[10px] flex-shrink-0" />
                      <span className="text-[11px] text-cyber-pink">
                        {getTapDamage(plan.tier)} tap damage
                      </span>
                    </div>
                  </div>

                  {/* Buy button */}
                  {isActive ? (
                    <div className="text-center py-2">
                      <span className="font-orbitron text-xs text-green-400">ACTIVE</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full py-3 rounded-xl font-orbitron text-xs font-bold bg-gradient-to-r from-cyber-pink to-cyber-purple text-white active:scale-95 transition-transform"
                    >
                      Purchase
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* Items tab */
        <div className="space-y-3">
          {/* Cooldown Reset */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 flex items-center justify-center">
              <FaBolt className="text-cyber-cyan text-xl" />
            </div>
            <div className="flex-1">
              <p className="font-orbitron text-xs text-white">Cooldown Reset</p>
              <p className="text-[10px] text-gray-500">Reduce tap cooldown by 12 hours</p>
              <p className="text-[10px] text-cyber-cyan">
                Available: {user.cooldownResets || 0}
              </p>
            </div>
            <button
              onClick={() => handleBuyItem('cooldown_reset')}
              disabled={!user.cooldownResets || processing}
              className="px-4 py-2 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/30 text-xs text-cyber-cyan font-orbitron disabled:opacity-30"
            >
              Use
            </button>
          </motion.div>

          {/* Extra Energy */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-cyber-pink/10 flex items-center justify-center">
              <FaGamepad className="text-cyber-pink text-xl" />
            </div>
            <div className="flex-1">
              <p className="font-orbitron text-xs text-white">Extra Energy</p>
              <p className="text-[10px] text-gray-500">Play one more game today</p>
              <p className="text-[10px] text-cyber-pink">
                Current: {user.gameEnergy || 0}
              </p>
            </div>
            <button
              onClick={() => handleBuyItem('energy')}
              disabled={processing}
              className="px-4 py-2 rounded-xl bg-cyber-pink/20 border border-cyber-pink/30 text-xs text-cyber-pink font-orbitron disabled:opacity-30"
            >
              +1
            </button>
          </motion.div>
        </div>
      )}

      {/* Payment Modal - TON Only */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-sm space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron text-sm text-white">Pay with TON</h3>
              <button onClick={() => setSelectedPlan(null)} className="text-gray-500"><FaTimes /></button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">{selectedPlan.name} VIP — {selectedPlan.durationDays} days</p>
              <p className="font-orbitron text-2xl text-white">${selectedPlan.priceUSD}</p>
            </div>

            <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-cyan/20 text-center space-y-2">
              <span className="text-3xl">💎</span>
              <p className="text-xs text-white">TON Wallet Payment</p>
              <p className="text-[10px] text-gray-500">Send payment via TON to activate VIP</p>
            </div>

            <button
              onClick={handlePurchaseVip}
              disabled={processing}
              className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-pink to-cyber-purple text-white disabled:opacity-30 active:scale-95 transition-transform"
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
