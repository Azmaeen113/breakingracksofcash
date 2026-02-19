import type { Task } from '@/types';

export const TASKS: Task[] = [
  { id: 'wallet',    title: 'Connect TON Wallet',      description: 'Connect your TON wallet to receive rewards',    reward: 3000, type: 'referral', icon: 'wallet',    link: '' },
  { id: 'invite1',   title: 'Invite 1 Friend',         description: 'Refer 1 friend',             reward: 1000, type: 'referral', icon: 'users', referralCount: 1 },
  { id: 'invite5',   title: 'Invite 5 Friends',        description: 'Refer 5 friends',            reward: 5000, type: 'referral', icon: 'users', referralCount: 5 },
  { id: 'invite10',  title: 'Invite 10 Friends',       description: 'Refer 10 friends',           reward: 10000, type: 'referral', icon: 'users', referralCount: 10 },
];
