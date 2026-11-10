/**
 * 基准执行器。
 *
 * 设计原则：
 * 1. 环境探测先于测量——数据没有环境就无法解释
 * 2. 预热一次再测，取中位数
 * 3. OOM/崩溃不吞掉，作为一等结果记录
 *
 * 依赖：@hashcloak/semaphore-noir-proof（本地 SDK）
 * 若尚未接入，proveOnce 会抛出明确错误，页面仍可运行并展示环境信息。
 */

import { detectEnv, validateEnv, type EnvInfo, type RunRecord } from "./env";

// B2 traces observed child-worker termination about 2 s after destroy resolved.
// Leave the same gap for every group and measure it separately.
const BACKEND_COOLDOWN_MS = 3000;

export type BenchOptions = {
  group: string;
  merkleTreeDepth: number;
  threads: number;
  /** 正式测量次数，默认 10 */
  runs?: number;
  /** 预热次数，默认 1 */
  warmup?: number;
};

export type BenchOutcome = {
  records: RunRecord[];
  median: { init: number | null; prove: number | null; verify: number | null };
  env: EnvInfo;
  warnings: string[];
};

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export async function runBenchmark(
  opts: BenchOptions,
  onProgress?: (msg: string) => void
): Promise<BenchOutcome> {
  const runs = opts.runs ?? 10;
  const warmup = opts.warmup ?? 1;

  const env = await detectEnv();
  const { warnings } = validateEnv(env, opts.threads);

  onProgress?.(
    `环境：${env.mobile ? "移动端" : "桌面"} | 核数 ${env.hardwareConcurrency} | ` +
      `COI ${env.crossOriginIsolated} | SIMD ${env.wasmSimd}`
  );
  warnings.forEach((w) => onProgress?.(`⚠ ${w}`));

  const { initSemaphoreNoirBackend, generateNoirProof, verifyNoirProof } = await import(
    "@hashcloak/semaphore-noir-proof"
  );
  const { Identity } = await import("@semaphore-protocol/identity");
  const { Group } = await import("@semaphore-protocol/group");

  const members = Array.from(
    { length: Math.pow(2, opts.merkleTreeDepth) },
    (_, i) => new Identity(i.toString())
  ).map(({ commitment }: { commitment: bigint }) => commitment);

  const group = new Group(members);
  const identity = new Identity(Math.floor(members.length / 2).toString());

  const records: RunRecord[] = [];
  const initTimes: number[] = [];
  const proveTimes: number[] = [];
  const verifyTimes: number[] = [];

  for (let i = 0; i < warmup + runs; i++) {
    const isWarmup = i < warmup;
    const rec: RunRecord = {
      timestamp: new Date().toISOString(),
      group: opts.group,
      warmup: isWarmup,
      env,
      requestedThreads: opts.threads,
      actualMultithreaded: null,
      merkleTreeDepth: opts.merkleTreeDepth,
      initTimeMs: null,
      proveTimeMs: null,
      verifyTimeMs: null,
      proofVerified: null,
      backendDestroyed: null,
      backendCooldownMs: null,
      cleanupError: null,
      error: null,
    };

    let backend: Awaited<ReturnType<typeof initSemaphoreNoirBackend>> | undefined;
    try {
      performance.mark(`E01 round ${i + 1} init start`);
      const t0 = performance.now();
      backend = await initSemaphoreNoirBackend(
        opts.merkleTreeDepth,
        undefined,
        opts.threads
      );
      const t1 = performance.now();
      rec.initTimeMs = Math.round((t1 - t0) * 100) / 100;

      onProgress?.(
        `[${opts.group}] depth=${opts.merkleTreeDepth} 运行 ${i + 1}/${warmup + runs}` +
          (isWarmup ? "（预热）" : "")
      );

      const t2 = performance.now();
      const proof = await generateNoirProof(identity, group, 1, 1, backend);
      const t3 = performance.now();
      rec.proveTimeMs = Math.round((t3 - t2) * 100) / 100;

      const verifyStart = performance.now();
      rec.proofVerified = await verifyNoirProof(proof, backend);
      rec.verifyTimeMs = Math.round((performance.now() - verifyStart) * 100) / 100;
      if (!rec.proofVerified) throw new Error("证明验证返回 false");
      onProgress?.("✓ 证明验证通过");

    } catch (err) {
      const msg = String(err);
      rec.error = msg;
      onProgress?.(`✗ 错误：${msg.slice(0, 160)}`);
    } finally {
      if (backend) {
        performance.mark(`E01 round ${i + 1} cleanup start`);
        try {
          await backend.honkBackend.destroy();
          rec.backendDestroyed = true;
          performance.mark(`E01 round ${i + 1} cleanup done`);
          onProgress?.(`✓ 第 ${i + 1} 轮后端已清理`);
        } catch (err) {
          rec.backendDestroyed = false;
          rec.cleanupError = String(err);
          onProgress?.(`✗ 后端清理失败：${rec.cleanupError}`);
        }
      }
    }

    if (rec.backendDestroyed) {
      onProgress?.(`第 ${i + 1} 轮：等待旧 Worker 退出（3 秒）`);
      const cooldownStart = performance.now();
      await new Promise<void>((resolve) => setTimeout(resolve, BACKEND_COOLDOWN_MS));
      rec.backendCooldownMs = Math.round((performance.now() - cooldownStart) * 100) / 100;
      performance.mark(`E01 round ${i + 1} cooldown done`);
      onProgress?.(`✓ 第 ${i + 1} 轮等待结束`);
    }

    records.push(rec);
    if (rec.error !== null || rec.cleanupError !== null) break;
    if (!isWarmup) {
      if (rec.initTimeMs !== null) initTimes.push(rec.initTimeMs);
      if (rec.proveTimeMs !== null) proveTimes.push(rec.proveTimeMs);
      if (rec.verifyTimeMs !== null) verifyTimes.push(rec.verifyTimeMs);
    }
  }

  return {
    records,
    env,
    warnings,
    median: {
      init: median(initTimes),
      prove: median(proveTimes),
      verify: median(verifyTimes),
    },
  };
}
