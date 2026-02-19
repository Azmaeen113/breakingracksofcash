import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { TASKS } from '@/config/tasks';
import { completeTask } from '@/services/firestore';
import {
  FaUsers, FaCheck, FaExternalLinkAlt, FaCoins, FaWallet
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  users: FaUsers,
  wallet: FaWallet,
};

export default function TasksPage() {
  const { user, userId, refreshUser } = useUser();
  const [claiming, setClaiming] = useState<string | null>(null);

  if (!user) return null;

  const completedTasks = user.completedTasks || [];
  const filtered = TASKS;

  const handleClaim = async (taskId: string, reward: number) => {
    if (claiming) return;
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

  const handleTaskClick = (task: typeof TASKS[0]) => {
    if (task.link) {
      window.open(task.link, '_blank');
    }
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
                    <FaCoins className="text-cyber-gold text-[10px]" />
                    <span className="text-[10px] text-cyber-gold font-orbitron">+{task.reward.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action */}
                {isDone ? (
                  <span className="text-[10px] text-green-400 font-orbitron">DONE</span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {task.link && (
                      <button
                        onClick={() => handleTaskClick(task)}
                        className="px-3 py-1.5 rounded-lg bg-cyber-dark border border-gray-700/50 text-[10px] text-gray-400 flex items-center gap-1"
                      >
                        <FaExternalLinkAlt className="text-[8px]" /> Open
                      </button>
                    )}
                    <button
                      onClick={() => handleClaim(task.id, task.reward)}
                      disabled={claiming === task.id}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-purple text-[10px] text-white font-orbitron disabled:opacity-50"
                    >
                      {claiming === task.id ? '...' : 'Claim'}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
