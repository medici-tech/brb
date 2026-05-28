import type { RecoveryActionDef } from '../types';

export const RECOVERY_ACTIONS: RecoveryActionDef[] = [
  {
    id: 'public-reassurance',
    name: 'Public Reassurance',
    description: 'Address the public to rebuild trust and ease panic. Gives Corporation time.',
    resourceEffect: { trust: 8, panic: -6 },
    advisorEffects: [],
    cpuProgressDelta: 5,
  },
  {
    id: 'rest-and-reset',
    name: 'Rest and Reset',
    description: 'Step back to recover personally. Advisor tensions ease slightly.',
    resourceEffect: { stress: -12 },
    advisorEffects: [
      { advisorId: 'operator', alignment: -2 },
      { advisorId: 'fixer', alignment: -2 },
      { advisorId: 'analyst', alignment: -2 },
    ],
    cpuProgressDelta: 4,
  },
  {
    id: 'emergency-fundraising',
    name: 'Emergency Fundraising',
    description: 'Desperate cash generation. The public notices the scramble.',
    resourceEffect: { money: 1800, trust: -6, panic: 2 },
    advisorEffects: [],
  },
  {
    id: 'internal-mediation',
    name: 'Internal Mediation',
    description: "Reduce the most powerful advisor's leverage through negotiation. Costs you.",
    resourceEffect: { stress: 3 },
    advisorEffects: [],
  },
];
