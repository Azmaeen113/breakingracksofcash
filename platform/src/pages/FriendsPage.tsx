import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { getInvitations, processReferralRewards } from '@/services/firestore';
import { REFERRAL_REWARD } from '@/config/constants';
import { FaUsers, FaCopy, FaShare, FaCoins, FaUserPlus, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function FriendsPage() {
  const { user, userId, refreshUser } = useUser();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const referralLink = `${window.location.origin}?ref=${userId}`;

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const data = await getInvitations(userId);
      setFriends(data);
    } catch {
      setFriends([]);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Breaking Racks 4 Cash',
          text: 'Play pool, earn cash, compete in leagues! Join me:',
          url: referralLink,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleClaimRewards = async () => {
    setProcessing(true);
    try {
      const earned = await processReferralRewards(userId);
      if (earned > 0) {
        await refreshUser();
        toast.success(`+${earned.toLocaleString()} CASH from referrals!`);
        await loadFriends();
      } else {
        toast('No new referral rewards to claim');
      }
    } catch {
      toast.error('Failed to process rewards');
    }
    setProcessing(false);
  };

  if (!user) return null;

  const totalEarned = (user.referralCount || 0) * REFERRAL_REWARD;

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-orbitron text-lg text-white flex items-center justify-center gap-2">
          <FaUsers className="text-cyber-cyan" />
          Friends
        </h1>
        <p className="text-xs text-gray-500">Invite friends, earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-4 text-center"
        >
          <FaUserPlus className="text-cyber-cyan text-xl mx-auto mb-2" />
          <p className="font-orbitron text-2xl text-white">{user.referralCount || 0}</p>
          <p className="text-[10px] text-gray-500">Friends Invited</p>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <FaCoins className="text-cyber-gold text-xl mx-auto mb-2" />
          <p className="font-orbitron text-2xl text-cyber-gold">{totalEarned.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">CASH Earned</p>
        </motion.div>
      </div>

      {/* Reward info */}
      <div className="glass-card p-4 border border-cyber-gold/20">
        <p className="font-orbitron text-xs text-cyber-gold text-center">
          Earn {REFERRAL_REWARD.toLocaleString()} CASH for each friend who joins!
        </p>
      </div>

      {/* Referral link */}
      <div className="glass-card p-4 space-y-3">
        <p className="font-orbitron text-[10px] text-gray-500 tracking-widest">YOUR REFERRAL LINK</p>
        <div className="bg-cyber-dark rounded-xl p-3 flex items-center gap-2">
          <p className="text-xs text-gray-400 truncate flex-1 font-mono">{referralLink}</p>
          <button onClick={handleCopy} className="text-cyber-cyan flex-shrink-0">
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-cyber-dark border border-gray-700/50 text-xs text-gray-400 font-orbitron flex items-center justify-center gap-2"
          >
            <FaCopy className="text-[10px]" /> Copy
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-purple text-xs text-white font-orbitron flex items-center justify-center gap-2"
          >
            <FaShare className="text-[10px]" /> Share
          </button>
        </div>
      </div>

      {/* Claim referral rewards */}
      <button
        onClick={handleClaimRewards}
        disabled={processing}
        className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-gold to-cyber-orange text-white disabled:opacity-50 active:scale-95 transition-transform"
      >
        {processing ? 'Processing...' : 'Claim Referral Rewards'}
      </button>

      {/* Friends list */}
      <div>
        <p className="font-orbitron text-[10px] text-gray-500 tracking-widest mb-3">
          INVITED FRIENDS ({friends.length})
        </p>
        
        {loading ? (
          <div className="text-center py-6">
            <div className="w-6 h-6 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin mx-auto" />
          </div>
        ) : friends.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <FaUsers className="text-3xl text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No friends invited yet</p>
            <p className="text-[10px] text-gray-600 mt-1">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f, idx) => (
              <motion.div
                key={f.odl_id || idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-cyber-cyan/10 flex items-center justify-center">
                  <span className="text-sm">{f.odl_first_name?.[0] || '?'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white">{f.odl_first_name || 'Player'}</p>
                  <p className="text-[10px] text-gray-500">@{f.odl_username || 'unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="font-orbitron text-[10px] text-cyber-gold">
                    +{REFERRAL_REWARD.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
