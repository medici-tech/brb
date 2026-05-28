import type { DepositDef } from '../types';

export const DEPOSITS: DepositDef[] = [
  {
    id: 'fund-engineering',
    name: 'Fund Engineering Team',
    description: 'Commit capital and research to the technical core. Resources are locked permanently.',
    cost: { money: 1500, intel: 2 },
    resourceEffect: { engineering: 8, stress: 3 },
    advisorEffects: [
      { advisorId: 'analyst', alignment: 3 },
      { advisorId: 'operator', leverage: 2 },
    ],
  },
  {
    id: 'secure-access',
    name: 'Secure Institutional Access',
    description: 'Buy authorization through influence channels. Fixer gains leverage over the deal.',
    cost: { influence: 5, intel: 1 },
    resourceEffect: { access: 7, trust: -2 },
    advisorEffects: [{ advisorId: 'fixer', leverage: 3 }],
  },
  {
    id: 'legitimacy-campaign',
    name: 'Public Legitimacy Campaign',
    description: 'Spend public trust to build institutional legitimacy. Reduces panic.',
    cost: { influence: 4, trust: 6 },
    resourceEffect: { legitimacy: 8, panic: -3 },
    advisorEffects: [{ advisorId: 'fixer', alignment: -2 }],
  },
  {
    id: 'stabilize-button',
    name: 'Stabilize the Button',
    description: 'Lock in safety protocols. Slow but reduces personal pressure.',
    cost: { money: 800, trust: 4 },
    resourceEffect: { stability: 7, stress: -2 },
    advisorEffects: [{ advisorId: 'analyst', alignment: 4 }],
  },
  {
    id: 'unsafe-acceleration',
    name: 'Unsafe Acceleration',
    description: 'Force Engineering progress through reckless means. Destabilizes everything.',
    cost: { money: 700, stress: 8 },
    resourceEffect: { engineering: 10, stability: -4, panic: 5 },
    advisorEffects: [{ advisorId: 'fixer', alignment: 3 }],
  },
  {
    id: 'dark-network-access',
    name: 'Dark Network Access',
    description: 'Route access authorization through covert channels. Fast, dirty, dangerous.',
    cost: { intel: 4, trust: 3 },
    resourceEffect: { access: 9, panic: 4, trust: -2 },
    advisorEffects: [
      { advisorId: 'fixer', alignment: 4, leverage: 3 },
      { advisorId: 'analyst', alignment: -3 },
    ],
  },
  {
    id: 'institutional-buy-in',
    name: 'Institutional Buy-In',
    description: 'Spend influence to bring key institutions into the fold.',
    cost: { influence: 6, money: 600 },
    resourceEffect: { legitimacy: 10, stability: 3, trust: -3 },
    advisorEffects: [{ advisorId: 'operator', alignment: 3 }],
  },
  {
    id: 'failsafe-protocols',
    name: 'Failsafe Protocols',
    description: 'Engineer redundancy into the system. Expensive but crucial near the end.',
    cost: { money: 1200, intel: 3 },
    resourceEffect: { stability: 10, engineering: 4, stress: -3 },
    advisorEffects: [{ advisorId: 'analyst', alignment: 5, leverage: 2 }],
  },
];
