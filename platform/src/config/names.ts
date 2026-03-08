// Random name generator for new webapp users

const ADJECTIVES = [
  'Swift', 'Shadow', 'Blazing', 'Mystic', 'Lucky', 'Iron', 'Golden', 'Storm',
  'Dark', 'Neon', 'Pixel', 'Cosmic', 'Turbo', 'Hyper', 'Frost', 'Thunder',
  'Crimson', 'Silver', 'Rogue', 'Phantom', 'Wild', 'Savage', 'Elite', 'Ace',
  'Rapid', 'Silent', 'Stealth', 'Atomic', 'Nova', 'Plasma', 'Venom', 'Flash',
  'Cyber', 'Ghost', 'Alpha', 'Omega', 'Blitz', 'Nitro', 'Quantum', 'Apex',
];

const NOUNS = [
  'Shark', 'Hawk', 'Cue', 'Breaker', 'Sniper', 'Striker', 'Phoenix', 'Wolf',
  'Tiger', 'Viper', 'Racker', 'Hustler', 'Knight', 'Dragon', 'Falcon', 'Rebel',
  'Runner', 'Hunter', 'Blade', 'Archer', 'Racer', 'Bomber', 'Panther', 'Eagle',
  'Bear', 'Lion', 'Cobra', 'Wizard', 'Ninja', 'Pirate', 'Bandit', 'Spark',
  'Crusher', 'Smasher', 'Legend', 'Champ', 'Boss', 'King', 'Ace', 'Pro',
];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}
