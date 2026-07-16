export type RandomResult = {
  value: number;
  state: number;
};

/** A small deterministic generator. The state is saved with the run. */
export function nextRandom(state: number): RandomResult {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  value = ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  return { value, state: nextState };
}

export function randomInt(state: number, maxExclusive: number): { value: number; state: number } {
  const result = nextRandom(state);
  return {
    value: Math.floor(result.value * maxExclusive),
    state: result.state,
  };
}
