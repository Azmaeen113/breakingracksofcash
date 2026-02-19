import type { Task } from '@/types';

export const TASKS: Task[] = [
  { id: 'telegram',  title: 'Join Telegram Channel',  description: 'Join our official Telegram', reward: 1000, type: 'social', icon: 'telegram',  link: 'https://t.me/YOUR_CHANNEL' },
  { id: 'twitter',   title: 'Follow on X (Twitter)',   description: 'Follow us on X',            reward: 1000, type: 'social', icon: 'twitter',   link: 'https://x.com/YOUR_HANDLE' },
  { id: 'youtube',   title: 'Subscribe on YouTube',    description: 'Subscribe to our channel',   reward: 1000, type: 'social', icon: 'youtube',   link: 'https://youtube.com/@YOUR_CHANNEL' },
  { id: 'website',   title: 'Visit Our Website',       description: 'Explore the website',        reward: 1000, type: 'social', icon: 'globe',     link: 'https://YOUR_WEBSITE.com' },
  { id: 'instagram', title: 'Follow on Instagram',     description: 'Follow us on Instagram',     reward: 1000, type: 'social', icon: 'instagram', link: 'https://instagram.com/YOUR_HANDLE' },
  { id: 'tiktok',    title: 'Follow on TikTok',        description: 'Follow us on TikTok',        reward: 1000, type: 'social', icon: 'tiktok',    link: 'https://tiktok.com/@YOUR_HANDLE' },
  { id: 'discord',   title: 'Join Discord Server',     description: 'Join our Discord community', reward: 1000, type: 'social', icon: 'discord',   link: 'https://discord.gg/YOUR_INVITE' },
  { id: 'wallet',    title: 'Connect TON Wallet',      description: 'Connect your TON wallet',    reward: 3000, type: 'social', icon: 'wallet',    link: '' },
  { id: 'invite1',   title: 'Invite 1 Friend',         description: 'Refer 1 friend',             reward: 1000, type: 'referral', icon: 'users', referralCount: 1 },
  { id: 'invite5',   title: 'Invite 5 Friends',        description: 'Refer 5 friends',            reward: 5000, type: 'referral', icon: 'users', referralCount: 5 },
  { id: 'invite10',  title: 'Invite 10 Friends',       description: 'Refer 10 friends',           reward: 10000, type: 'referral', icon: 'users', referralCount: 10 },
];
