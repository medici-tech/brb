import { runSimulation } from "../src/game/simulator.js";

const requestedRuns = Number.parseInt(process.argv[2] ?? "1000", 10);
const requestedSeed = Number.parseInt(process.argv[3] ?? "20260715", 10);
const report = runSimulation({ runs: requestedRuns, seed: requestedSeed });

console.log(JSON.stringify(report, null, 2));
