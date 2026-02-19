import type { VipPlan } from '@/types';

export const VIP_PLANS: VipPlan[] = [
  {
    tier: 1,
    name: 'Bronze',
    priceUSD: 5,
    durationDays: 30,
    benefits: ['6x tap damage', '1.05x game multiplier', '2 cooldown resets'],
    cooldownItems: 2,
    color: '#CD7F32',
    gradient: 'from-orange-700 to-amber-500',
  },
  {
    tier: 2,
    name: 'Silver',
    priceUSD: 50,
    durationDays: 30,
    benefits: ['11x tap damage', '1.10x game multiplier', '5 cooldown resets'],
    cooldownItems: 5,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-200',
  },
  {
    tier: 3,
    name: 'Gold',
    priceUSD: 100,
    durationDays: 30,
    benefits: ['16x tap damage', '1.15x game multiplier', '10 cooldown resets'],
    cooldownItems: 10,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-amber-300',
  },
];

export function getVipMultiplier(tier: number): number {
  const multipliers = [1.0, 1.05, 1.10, 1.15];
  return multipliers[tier] ?? 1.0;
}

export function getTapDamage(tier: number): number {
  switch (tier) {
    case 1: return 6;
    case 2: return 11;
    case 3: return 16;
    default: return 1;
  }
}
