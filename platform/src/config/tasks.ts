import type { Task } from '@/types';

export const TASKS: Task[] = [
  { id: 'wallet',    title: 'Connect BSC Wallet',      description: 'Connect your BSC wallet to receive rewards',    reward: 300,  type: 'referral', icon: 'wallet',    link: '' },
  { id: 'telegram',  title: 'Join Telegram',           description: 'Join our Telegram channel',   reward: 500,  type: 'social',   icon: 'telegram', link: 'https://t.me/BrakingRacks4Cash' },
  { id: 'twitter',   title: 'Follow X Account',        description: 'Follow us on X',              reward: 500,  type: 'social',   icon: 'twitter',  link: 'https://x.com/BR4C_2026' },
  { id: 'invite1',   title: 'Invite 1 Friend',         description: 'Refer 1 friend',             reward: 1000, type: 'referral', icon: 'users', referralCount: 1 },
  { id: 'invite5',   title: 'Invite 5 Friends',        description: 'Refer 5 friends',            reward: 5000, type: 'referral', icon: 'users', referralCount: 5 },
  { id: 'invite10',  title: 'Invite 10 Friends',       description: 'Refer 10 friends',           reward: 10000, type: 'referral', icon: 'users', referralCount: 10 },
];
