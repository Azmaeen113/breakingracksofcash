import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { TASKS } from '@/config/tasks';
import { completeTask } from '@/services/firestore';
import {
  FaUsers, FaCheck, FaExternalLinkAlt, FaCoins, FaWallet, FaTelegramPlane, FaTwitter
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  users: FaUsers,
  wallet: FaWallet,
  telegram: FaTelegramPlane,
  twitter: FaTwitter,
};

// Minimum seconds user must wait after opening a social link before claiming
const SOCIAL_CLAIM_DELAY_MS = 8000;

export default function TasksPage() {
  const { user, userId, refreshUser } = useUser();
  const [claiming, setClaiming] = useState<string | null>(null);
  // Track which social tasks have been opened (taskId -> timestamp when opened)
  const [openedTasks, setOpenedTasks] = useState<Record<string, number>>({});

  if (!user) return null;

  const completedTasks = user.completedTasks || [];
  const filtered = TASKS;

  const handleClaim = async (taskId: string, reward: number, task: typeof TASKS[0]) => {
    if (claiming) return;

    // Zero-reward tasks don't need claiming through this flow
    if (reward === 0) return;

    // Validate referral tasks
    if (task.referralCount && (user.referralCount || 0) < task.referralCount) {
      toast.error(`You need ${task.referralCount} referrals (have ${user.referralCount || 0})`);
      return;
    }

    // Validate social tasks: must have opened the link first and waited
    if (task.type === 'social' && task.link) {
      const openedAt = openedTasks[taskId];
      if (!openedAt) {
        toast.error('Please open the link first, then claim');
        return;
      }
      const elapsed = Date.now() - openedAt;
      if (elapsed < SOCIAL_CLAIM_DELAY_MS) {
        const remaining = Math.ceil((SOCIAL_CLAIM_DELAY_MS - elapsed) / 1000);
        toast.error(`Please wait ${remaining}s after joining to claim`);
        return;
      }
    }

    setClaiming(taskId);
    try {
      await completeTask(userId, taskId, reward);
      await refreshUser();
      toast.success(`+${reward.toLocaleString()} CASH earned!`, {
        icon: '🎉',
        style: { background: '#1a0a2e', color: '#fff', border: '1px solid rgba(0,255,255,0.3)' },
      });
    } catch {
      toast.error('Failed to claim');
    }
    setClaiming(null);
  };

  const handleTaskClick = async (task: typeof TASKS[0]) => {
    if (task.link) {
      window.open(task.link, '_blank');
      // Record that this social task link was opened
      if (task.type === 'social') {
        setOpenedTasks(prev => ({ ...prev, [task.id]: Date.now() }));
        // Zero-reward social tasks: auto-complete on link open (no points awarded)
        if (task.reward === 0 && !completedTasks.includes(task.id)) {
          try {
            await completeTask(userId, task.id, 0);
            await refreshUser();
            toast.success('Task completed!', { icon: '✅', duration: 3000 });
          } catch { /* silent */ }
        } else if (task.reward > 0) {
          toast.success('Link opened! You can claim in a few seconds', {
            icon: '✅',
            duration: 4000,
          });
        }
      }
    }
  };

  // Check if a social task can be claimed (link was opened and delay passed)
  const canClaimSocial = (task: typeof TASKS[0]): boolean => {
    if (task.type !== 'social' || !task.link) return true;
    const openedAt = openedTasks[task.id];
    if (!openedAt) return false;
    return (Date.now() - openedAt) >= SOCIAL_CLAIM_DELAY_MS;
  };

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-orbitron text-lg text-white">Tasks</h1>
        <p className="text-xs text-gray-500">Complete tasks to earn CASH</p>
      </div>

      {/* Total earned from tasks */}
      <div className="glass-card p-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Completed</span>
        <span className="font-orbitron text-sm text-cyber-cyan">{completedTasks.length}/{TASKS.length}</span>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, idx) => {
            const isDone = completedTasks.includes(task.id);
            const Icon = ICON_MAP[task.icon] || FaUsers;
            const isSocial = task.type === 'social' && !!task.link;
            const socialOpened = isSocial ? !!openedTasks[task.id] : false;
            const socialReady = canClaimSocial(task);

            return (
              <motion.div
                key={task.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-4 flex items-center gap-4 ${isDone ? 'opacity-60' : ''}`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-green-500/10' : 'bg-cyber-cyan/10'
                }`}>
                  {isDone ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <Icon className="text-cyber-cyan text-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-xs text-white truncate">{task.title}</p>
                  <p className="text-[10px] text-gray-500">{task.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {task.reward > 0 ? (
                      <>
                        <FaCoins className="text-cyber-gold text-[10px]" />
                        <span className="text-[10px] text-cyber-gold font-orbitron">+{task.reward.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-orbitron">No Points</span>
                    )}
                  </div>
                </div>

                {/* Action */}
                {task.id === 'wallet' ? (
                  <span className="px-3 py-1.5 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 text-[10px] text-cyber-cyan font-orbitron text-center">SOON</span>
                ) : isDone ? (
                  <span className="text-[10px] text-green-400 font-orbitron">DONE</span>
                ) : task.link ? (
                  <button 
                    onClick={() => handleTaskClick(task)}
                    className="px-3 py-1.5 rounded-lg border border-cyber-cyan bg-cyber-cyan/20 text-[10px] text-cyber-cyan font-orbitron transition-colors hover:bg-cyber-cyan/30 flex items-center justify-center min-w-[60px]"
                  >
                    START
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500 font-orbitron">No Points</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
