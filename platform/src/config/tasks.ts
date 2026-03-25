import type { Task } from '@/types';

export const TASKS: Task[] = [
  { id: 'wallet',    title: 'Connect BSC Wallet',      description: 'Connect wallet for rewards & airdrops',    reward: 0,  type: 'referral', icon: 'wallet',    link: '' },
  { id: 'telegram',  title: 'Join Telegram',           description: 'Join our Telegram channel',   reward: 0,  type: 'social',   icon: 'telegram', link: 'https://t.me/BrakingRacks4Cash' },
  { id: 'twitter',   title: 'Follow X Account',        description: 'Follow us on X',              reward: 0,  type: 'social',   icon: 'twitter',  link: 'https://x.com/BR4C_2026' },
  { id: 'invite1',   title: 'Invite 1 Friend',         description: 'Verified at cashout',         reward: 1000, type: 'referral', icon: 'users', referralCount: 1, comingSoon: true },
  { id: 'invite5',   title: 'Invite 5 Friends',        description: 'Verified at cashout',         reward: 5000, type: 'referral', icon: 'users', referralCount: 5, comingSoon: true },
  { id: 'invite10',  title: 'Invite 10 Friends',       description: 'Verified at cashout',         reward: 10000, type: 'referral', icon: 'users', referralCount: 10, comingSoon: true },
];
