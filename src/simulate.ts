import { Worker } from "worker_threads";
import os from "os";

interface SimulationResult {
  breakupCount: number;
  totalDuration: number;
  initiators: Record<string, number>;
  reasons: Record<string, number>;
  durations: Record<string, number>;
}

const initiatorKeys = ["man", "woman"];
const reasonKeys = [
  "fells out of love",
  "lack of freedom",
  "lack of understanding",
  "lack of trust",
  "lack of common goals",
  "emotionally drained",
  "wants different pace",
  "unmet expectations",
];

const durationKeys = [
  "< 14 days",
  "< 60 days",
  "< 180 days",
  "< 365 days",
  "< 730 days",
  "< 1095 days",
  "< 1825 days",
  "≥ 1825 days",
];

function mergeResults(results: SimulationResult[]): SimulationResult {
  const merged: SimulationResult = {
    breakupCount: 0,
    totalDuration: 0,
    initiators: {},
    reasons: {},
    durations: {},
  };

  initiatorKeys.forEach((k) => (merged.initiators[k] = 0));
  durationKeys.forEach((k) => (merged.durations[k] = 0));
  reasonKeys.forEach((k) => (merged.reasons[k] = 0));

  for (const r of results) {
    merged.breakupCount += r.breakupCount;
    merged.totalDuration += r.totalDuration;

    for (const [key, val] of Object.entries(r.initiators)) {
      merged.initiators[key] = (merged.initiators[key] ?? 0) + val;
    }
    for (const [key, val] of Object.entries(r.reasons)) {
      merged.reasons[key] = (merged.reasons[key] ?? 0) + val;
    }
    for (const [key, val] of Object.entries(r.durations)) {
      merged.durations[key] = (merged.durations[key] ?? 0) + val;
    }
  }

  return merged;
}

async function runParallelSimulations(
  totalSimulations: number,
  workersCount: number,
): Promise<SimulationResult> {
  const simulationsPerWorker = Math.floor(totalSimulations / workersCount);
  const workerPath = new URL("./engine/worker.js", import.meta.url);

  const workers = [];
  for (let i = 0; i < workersCount; i++) {
    workers.push(
      new Promise<SimulationResult>((resolve, reject) => {
        const worker = new Worker(workerPath, {
          workerData: { simulationsCount: simulationsPerWorker },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: "module",
        });

        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
        });
      }),
    );
  }

  const results = await Promise.all(workers);
  return mergeResults(results);
}

async function main() {
  const totalSimulations = 10_000;

  // Automatically infer CPU cores.
  const cpuCount = os.cpus().length;

  // Optionally reserve 1 core for system to keep UI responsive.
  const workersCount = Math.max(1, cpuCount - 1);

  console.log(
    `Running ${totalSimulations} simulations using ${workersCount} workers (Detected CPUs: ${cpuCount})...`,
  );

  const stats = await runParallelSimulations(totalSimulations, workersCount);

  console.log("--- Simulation complete ---");
  console.log(`Total simulations: ${totalSimulations}`);
  console.log(
    `Total breakups: ${stats.breakupCount} (${((stats.breakupCount / totalSimulations) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Avg duration before breakup: ${(stats.totalDuration / stats.breakupCount).toFixed(1)} days`,
  );

  console.log("Initiator breakdown:");
  for (const [key, val] of Object.entries(stats.initiators)) {
    const percent = ((val / stats.breakupCount) * 100).toFixed(2);
    console.log(`  ${key.padEnd(7)} → ${percent}% (${val})`);
  }

  console.log("Reasons breakdown:");
  // Group by common reason name.
  const groupedReasons = new Map<
    string,
    { total: number; man: number; woman: number }
  >();

  for (const reason of reasonKeys) {
    const manKey = `man: ${reason}`;
    const womanKey = `woman: ${reason}`;

    const manVal = stats.reasons[manKey] ?? 0;
    const womanVal = stats.reasons[womanKey] ?? 0;

    groupedReasons.set(reason, {
      total: manVal + womanVal,
      man: manVal,
      woman: womanVal,
    });
  }

  // Sort by total descending.
  const sortedReasons = [...groupedReasons.entries()].sort(
    (a, b) => b[1].total - a[1].total,
  );

  // Output grouped breakdown.
  for (const [reason, { man, woman, total }] of sortedReasons) {
    const manPercent = ((man / stats.breakupCount) * 100).toFixed(2);
    const womanPercent = ((woman / stats.breakupCount) * 100).toFixed(2);
    const totalPercent = ((total / stats.breakupCount) * 100).toFixed(2);

    console.log(`${reason}:`);
    if (man > 0) console.log(`  man   → ${manPercent.padStart(5)}% (${man})`);
    if (woman > 0)
      console.log(`  woman → ${womanPercent.padStart(5)}% (${woman})`);
    console.log(`  total → ${totalPercent.padStart(5)}% (${total})`);
  }

  console.log("Breakup duration buckets:");
  const sorted = Object.entries(stats.durations).sort((a, b) => {
    const parse = (label: string) =>
      label.includes("≥") ? Infinity : parseInt(label.replace(/[^\d]/g, ""));

    return parse(a[0]) - parse(b[0]);
  });

  for (const [key, val] of sorted) {
    const percent = ((val / stats.breakupCount) * 100).toFixed(2);
    console.log(`  ${key.padEnd(12)} → ${percent}% (${val})`);
  }
}

main().catch(console.error);
