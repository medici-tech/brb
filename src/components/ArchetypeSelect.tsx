import type { ArchetypeDef } from '../types';
import { ARCHETYPES } from '../data/archetypes';

interface Props {
  onSelect: (archetypeId: string) => void;
}

export function ArchetypeSelect({ onSelect }: Props) {
  return (
    <div className="archetype-screen">
      <div className="title-block">
        <h1 className="game-title">BRB</h1>
        <p className="game-subtitle">Big Red Button</p>
        <p className="game-tagline">
          The Corporation is already building it. Choose your approach.
        </p>
      </div>
      <div className="archetype-grid">
        {ARCHETYPES.map((arch: ArchetypeDef) => (
          <button
            key={arch.id}
            className="archetype-card"
            onClick={() => onSelect(arch.id)}
          >
            <div className="archetype-name">{arch.name}</div>
            <div className="archetype-tagline">{arch.tagline}</div>
            <div className="archetype-description">{arch.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
