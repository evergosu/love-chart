import { parentPort, workerData } from "worker_threads";
import { Simulator } from "./simulator.js";
import { Collision } from "./collision.js";
import { Woman } from "../actor/woman.js";
import { Man } from "../actor/man.js";

interface SimulationResult {
  breakupCount: number;
  totalDuration: number;
  initiators: Record<string, number>;
  reasons: Record<string, number>;
  durations: Record<string, number>;
}

function runSimulations(simulationsCount: number): SimulationResult {
  const initiators: Record<string, number> = {};
  const reasons: Record<string, number> = {};
  const durations: Record<string, number> = {};
  let breakupCount = 0;
  let totalDuration = 0;

  for (let i = 0; i < simulationsCount; i++) {
    const man = new Man(150, [14, 90]);
    const woman = new Woman(150, [14, 90], man.capacity);
    const collision = new Collision(man, woman);
    const totalDays = 100 * 365;
    const simulation = new Simulator(man, woman, collision, totalDays);

    simulation.simulateLife();

    if (collision.brakeUpDay != null) {
      breakupCount++;
      totalDuration += collision.brakeUpDay;

      initiators[collision.brokeUp ?? "none"] =
        (initiators[collision.brokeUp ?? "none"] ?? 0) + 1;

      const reason = `${collision.brokeUp ?? "unknown"}: ${collision.reason ?? "unknown"}`;

      reasons[reason] = (reasons[reason] ?? 0) + 1;

      const d = collision.brakeUpDay;

      if (d < 14) durations["< 14 days"] = (durations["< 14 days"] ?? 0) + 1;
      else if (d < 60)
        durations["< 60 days"] = (durations["< 60 days"] ?? 0) + 1;
      else if (d < 180)
        durations["< 180 days"] = (durations["< 180 days"] ?? 0) + 1;
      else if (d < 365)
        durations["< 365 days"] = (durations["< 365 days"] ?? 0) + 1;
      else if (d < 730)
        durations["< 730 days"] = (durations["< 730 days"] ?? 0) + 1;
      else if (d < 1095)
        durations["< 1095 days"] = (durations["< 1095 days"] ?? 0) + 1;
      else if (d < 1825)
        durations["< 1825 days"] = (durations["< 1825 days"] ?? 0) + 1;
      else durations["≥ 1825 days"] = (durations["≥ 1825 days"] ?? 0) + 1;
    }
  }

  return {
    breakupCount,
    totalDuration,
    initiators,
    reasons,
    durations,
  };
}

if (!parentPort) {
  throw new Error("This script must be run as a worker thread");
}

const result = runSimulations(workerData.simulationsCount);
parentPort.postMessage(result);
