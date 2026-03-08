import type { VipPlan, EnergyOffer } from '@/types';

export const VIP_PLANS: VipPlan[] = [
  {
    tier: 1,
    name: 'Bronze',
    priceUSD: 5,
    durationDays: 30,
    benefits: ['6 energy/day', '6x tap damage', '1.05x game multiplier', '2 cooldown resets'],
    cooldownItems: 2,
    energyPerDay: 6,
    color: '#CD7F32',
    gradient: 'from-orange-700 to-amber-500',
  },
  {
    tier: 2,
    name: 'Silver',
    priceUSD: 10,
    durationDays: 30,
    benefits: ['13 energy/day', '11x tap damage', '1.10x game multiplier', '5 cooldown resets'],
    cooldownItems: 5,
    energyPerDay: 13,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-200',
  },
  {
    tier: 3,
    name: 'Gold',
    priceUSD: 20,
    durationDays: 30,
    benefits: ['20 energy/day', '16x tap damage', '1.15x game multiplier', '10 cooldown resets'],
    cooldownItems: 10,
    energyPerDay: 20,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-amber-300',
  },
];

export const ENERGY_OFFERS: EnergyOffer[] = [
  { id: 'energy_5',  energy: 5,   priceUSD: 0.5 },
  { id: 'energy_10', energy: 10,  priceUSD: 1 },
  { id: 'energy_25', energy: 25,  priceUSD: 2.5 },
  { id: 'energy_50', energy: 50,  priceUSD: 5 },
  { id: 'energy_100', energy: 100, priceUSD: 10 },
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
