import type { AdvisorDef } from '../types';

export const ADVISORS: AdvisorDef[] = [
  {
    id: 'operator',
    name: 'The Operator',
    role: 'Money, logistics, efficiency',
    quote: 'Every crisis has a price tag. The trick is making someone else pay it.',
    rival: 'analyst',
    startingLoyalty: 45,
    startingAlignment: 10,
    startingLeverage: 15,
    startingCeiling: 70,
  },
  {
    id: 'fixer',
    name: 'The Fixer',
    role: 'Secrets, sabotage, leverage',
    quote: 'Clean hands are just dirty hands with better lighting.',
    rival: 'operator',
    startingLoyalty: 35,
    startingAlignment: 0,
    startingLeverage: 25,
    startingCeiling: 60,
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    role: 'Research, prediction, stability',
    quote: 'The pattern is not hidden. You just keep blinking when it appears.',
    rival: 'fixer',
    startingLoyalty: 40,
    startingAlignment: 10,
    startingLeverage: 10,
    startingCeiling: 65,
  },
];
