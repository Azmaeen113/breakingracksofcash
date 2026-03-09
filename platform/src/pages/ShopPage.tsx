import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { VIP_PLANS, ENERGY_OFFERS, getVipMultiplier, getTapDamage } from '@/config/vipPlans';
import { activateVip, purchaseExtraEnergy, useCooldownReset } from '@/services/firestore';
import { EVM_RECEIVER_WALLET, VIP_ENERGY_PER_DAY } from '@/config/constants';
import type { VipPlan, EnergyOffer } from '@/types';
import {
  FaCrown, FaBolt, FaGamepad, FaTimes, FaCheck, FaShoppingCart,
  FaFire, FaStar, FaWallet
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// BSC USDT (BEP-20) contract address
const BSC_USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const BSC_CHAIN_ID = '0x38'; // 56 in hex

// Minimal ERC-20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// ─── EVM helpers using ethers.js ──────────────────────
async function connectWallet(): Promise<{ provider: any; signer: any; address: string }> {
  const { BrowserProvider } = await import('ethers');
  const ethereum = (window as any).ethereum;
  if (!ethereum) throw new Error('No wallet detected. Install MetaMask or another EVM wallet.');
  const provider = new BrowserProvider(ethereum);
  await provider.send('eth_requestAccounts', []);

  // Switch to BSC if not already on it
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BSC_CHAIN_ID }] });
  } catch (switchError: any) {
    // If BSC is not added, add it
    if (switchError.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BSC_CHAIN_ID,
          chainName: 'BNB Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com/'],
        }],
      });
    } else {
      throw switchError;
    }
  }

  // Re-create provider after chain switch
  const bscProvider = new BrowserProvider(ethereum);
  const signer = await bscProvider.getSigner();
  const address = await signer.getAddress();
  return { provider: bscProvider, signer, address };
}

async function sendUsdtPayment(amountUSD: number): Promise<string> {
  const { Contract, parseUnits } = await import('ethers');
  const { signer } = await connectWallet();

  // USDT BEP-20 on BSC: 18 decimals, 1 USDT = $1
  const usdtContract = new Contract(BSC_USDT_ADDRESS, ERC20_ABI, signer);
  const amount = parseUnits(amountUSD.toString(), 18);

  const tx = await usdtContract.transfer(EVM_RECEIVER_WALLET, amount);
  await tx.wait();
  return tx.hash;
}

export default function ShopPage() {
  const { user, userId, refreshUser } = useUser();
  const [tab, setTab] = useState<'vip' | 'energy'>('vip');
  const [paymentModal, setPaymentModal] = useState<{
    type: 'vip' | 'energy';
    plan?: VipPlan;
    offer?: EnergyOffer;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!user) return null;

  // ── EVM payment for VIP ───────────────────────────
  const handlePurchaseVip = async (plan: VipPlan) => {
    setProcessing(true);
    try {
      const txHash = await sendUsdtPayment(plan.priceUSD);
      await activateVip(userId, plan.tier, plan.durationDays, txHash, plan.priceUSD);
      await refreshUser();
      toast.success(`VIP ${plan.name} activated!`);
      setPaymentModal(null);
    } catch (err: any) {
      if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('reject')) {
        toast.error('Transaction rejected');
      } else if (err?.message?.includes('No wallet')) {
        toast.error(err.message);
      } else {
        toast.error('Payment failed. Please try again.');
        console.error(err);
      }
    }
    setProcessing(false);
  };

  // ── EVM payment for Energy ────────────────────────
  const handlePurchaseEnergy = async (offer: EnergyOffer) => {
    setProcessing(true);
    try {
      const txHash = await sendUsdtPayment(offer.priceUSD);
      await purchaseExtraEnergy(userId, offer.id, txHash);
      await refreshUser();
      toast.success(`+${offer.energy} Energy added!`);
      setPaymentModal(null);
    } catch (err: any) {
      if (err?.code === 'ACTION_REJECTED' || err?.message?.includes('reject')) {
        toast.error('Transaction rejected');
      } else if (err?.message?.includes('No wallet')) {
        toast.error(err.message);
      } else {
        toast.error('Payment failed. Please try again.');
        console.error(err);
      }
    }
    setProcessing(false);
  };

  // ── Use cooldown reset item ───────────────────────
  const handleUseCooldown = async () => {
    setProcessing(true);
    try {
      const success = await useCooldownReset(userId);
      if (success) {
        await refreshUser();
        toast.success('Cooldown reduced by 12 hours!');
      } else {
        toast.error('No cooldown resets available');
      }
    } catch {
      toast.error('Failed to use item');
    }
    setProcessing(false);
  };

  const currentEnergy = user.gameEnergy || 0;
  const dailyEnergy = VIP_ENERGY_PER_DAY[user.vipTier] ?? 3;

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

      {/* Energy Status Bar */}
      <div className="glass-card p-4 flex items-center justify-between border border-cyber-cyan/20">
        <div className="flex items-center gap-3">
          <FaBolt className="text-cyber-cyan text-xl" />
          <div>
            <p className="font-orbitron text-sm text-white">{currentEnergy} Energy</p>
            <p className="text-[10px] text-gray-500">{dailyEnergy}/day ({user.vipTier > 0 ? ['', 'Bronze', 'Silver', 'Gold'][user.vipTier] + ' VIP' : 'Free'})</p>
          </div>
        </div>
        {user.cooldownResets > 0 && (
          <button
            onClick={handleUseCooldown}
            disabled={processing}
            className="px-3 py-1.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 text-[10px] text-cyber-cyan font-orbitron disabled:opacity-30"
          >
            Reset CD ({user.cooldownResets})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['vip', 'energy'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-orbitron text-xs transition-all ${
              tab === t
                ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/30'
                : 'bg-cyber-dark/50 text-gray-500 border border-gray-700/30'
            }`}
          >
            {t === 'vip' ? 'VIP Plans' : 'Buy Energy'}
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
                      onClick={() => setPaymentModal({ type: 'vip', plan })}
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
        /* Energy Offers tab */
        <div className="space-y-3">
          <p className="text-xs text-gray-500 text-center">Buy extra energy to play more games today</p>

          {ENERGY_OFFERS.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                offer.energy >= 100 ? 'bg-cyber-gold/10' :
                offer.energy >= 50 ? 'bg-cyber-pink/10' :
                offer.energy >= 25 ? 'bg-purple-500/10' : 'bg-cyber-cyan/10'
              }`}>
                <div className="text-center">
                  <FaGamepad className={`text-lg mx-auto ${
                    offer.energy >= 100 ? 'text-cyber-gold' :
                    offer.energy >= 50 ? 'text-cyber-pink' :
                    offer.energy >= 25 ? 'text-purple-400' : 'text-cyber-cyan'
                  }`} />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-orbitron text-sm text-white">+{offer.energy} Energy</p>
                <p className="text-[10px] text-gray-500">Play {offer.energy} more games</p>
              </div>
              <button
                onClick={() => setPaymentModal({ type: 'energy', offer })}
                disabled={processing}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-pink to-cyber-purple text-xs text-white font-orbitron font-bold disabled:opacity-30 active:scale-95 transition-transform"
              >
                ${offer.priceUSD.toFixed(2)}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── EVM Payment Modal ── */}
      {paymentModal && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => !processing && setPaymentModal(null)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-sm space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron text-sm text-white flex items-center gap-2">
                <FaWallet className="text-cyber-cyan" /> Pay with USDT (BSC)
              </h3>
              <button onClick={() => !processing && setPaymentModal(null)} className="text-gray-500">
                <FaTimes />
              </button>
            </div>

            <div className="text-center">
              {paymentModal.type === 'vip' && paymentModal.plan ? (
                <>
                  <p className="text-xs text-gray-500">{paymentModal.plan.name} VIP — {paymentModal.plan.durationDays} days</p>
                  <p className="font-orbitron text-2xl text-white mt-1">${paymentModal.plan.priceUSD}</p>
                </>
              ) : paymentModal.offer ? (
                <>
                  <p className="text-xs text-gray-500">+{paymentModal.offer.energy} Extra Energy</p>
                  <p className="font-orbitron text-2xl text-white mt-1">${paymentModal.offer.priceUSD.toFixed(2)}</p>
                </>
              ) : null}
            </div>

            <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-cyan/20 text-center space-y-2">
              <FaWallet className="text-3xl text-cyber-cyan mx-auto" />
              <p className="text-xs text-white">USDT Payment on BSC</p>
              <p className="text-[10px] text-gray-500">
                Pay with USDT (BEP-20) on BNB Smart Chain via MetaMask or any wallet
              </p>
              <p className="text-[9px] text-gray-600 font-mono break-all mt-2">
                {EVM_RECEIVER_WALLET}
              </p>
            </div>

            <button
              onClick={() => {
                if (paymentModal.type === 'vip' && paymentModal.plan) {
                  handlePurchaseVip(paymentModal.plan);
                } else if (paymentModal.offer) {
                  handlePurchaseEnergy(paymentModal.offer);
                }
              }}
              disabled={processing}
              className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-pink to-cyber-purple text-white disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaWallet /> Connect & Pay
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
