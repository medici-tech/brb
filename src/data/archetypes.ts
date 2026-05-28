import type { ArchetypeDef } from '../types';

export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'mogul',
    name: 'The Mogul',
    tagline: 'Buy time, build fast, accept moral debt.',
    description: 'You arrive with capital. You will spend it. The public already suspects you. The Operator respects that.',
    resourceModifiers: { money: 2500, trust: -8 },
    brbModifiers: {},
    advisorModifiers: { operator: { loyalty: 8 } },
  },
  {
    id: 'technocrat',
    name: 'The Technocrat',
    tagline: 'Build the machine, manage legitimacy later.',
    description: 'Engineering first, politics second. The Analyst sees you as kin. The public will come around. Maybe.',
    resourceModifiers: { intel: 3, trust: -5 },
    brbModifiers: { engineering: 10 },
    advisorModifiers: { analyst: { loyalty: 8 } },
  },
  {
    id: 'puppetmaster',
    name: 'The Puppetmaster',
    tagline: 'Control through secrets, start politically fragile.',
    description: "You know where the bodies are. So does the Fixer — and they're already leveraging it.",
    resourceModifiers: { intel: 6, money: -800 },
    brbModifiers: {},
    advisorModifiers: { fixer: { loyalty: 8, leverage: 5 } },
  },
  {
    id: 'populist',
    name: 'The Populist',
    tagline: 'High public support, heavy personal pressure.',
    description: 'The crowd believes in you. That belief weighs on you every hour.',
    resourceModifiers: { trust: 12, influence: 4, stress: 8 },
    brbModifiers: {},
    advisorModifiers: {},
  },
  {
    id: 'prophet',
    name: 'The Prophet',
    tagline: 'Win through belief and public mandate.',
    description: 'You speak in patterns. The public follows. But panic follows belief like a shadow.',
    resourceModifiers: { influence: 8, trust: 6, panic: 5 },
    brbModifiers: {},
    advisorModifiers: {},
  },
];
