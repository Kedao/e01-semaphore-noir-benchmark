/**
 * 环境探测：这是整个实验的地基。
 *
 * 关键约束：如果不记录 crossOriginIsolated，就无法区分
 *   "手机慢" 和 "多线程没生效"。
 * 隔离状态是环境条件，不能作为实际线程数。
 */

export type EnvInfo = {
  isSecureContext: boolean;
  crossOriginIsolated: boolean;
  sharedArrayBuffer: boolean;
  /** 浏览器报告的核数；与实际可用线程数可能不同 */
  hardwareConcurrency: number;
  deviceMemoryGB: number | null;
  userAgent: string;
  platform: string;
  /** 是否支持 WASM SIMD（影响证明速度的重要因子） */
  wasmSimd: boolean;
  /** 是否为移动端 */
  mobile: boolean;
};

async function detectWasmSimd(): Promise<boolean> {
  try {
    // One function returning v128.const with all 16 immediate bytes.
    const bytes = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60,
      0x00, 0x01, 0x7b, 0x03, 0x02, 0x01, 0x00, 0x0a, 0x16, 0x01, 0x14, 0x00,
      0xfd, 0x0c, ...new Uint8Array(16), 0x0b,
    ]);
    await WebAssembly.compile(bytes);
    return true;
  } catch {
    return false;
  }
}

export async function detectEnv(): Promise<EnvInfo> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: { mobile?: boolean };
  };

  return {
    isSecureContext: globalThis.isSecureContext === true,
    crossOriginIsolated:
      typeof globalThis.crossOriginIsolated !== "undefined"
        ? globalThis.crossOriginIsolated
        : false,
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
    hardwareConcurrency: nav.hardwareConcurrency ?? 1,
    deviceMemoryGB: nav.deviceMemory ?? null,
    userAgent: nav.userAgent,
    platform: nav.platform ?? "unknown",
    wasmSimd: await detectWasmSimd(),
    mobile: nav.userAgentData?.mobile ?? /Mobi|Android/i.test(nav.userAgent),
  };
}

/**
 * 一致性校验：把"意图"和"现实"对上。
 *
 * 这里只检查环境前提，不测量实际线程。
 */
export function validateEnv(env: EnvInfo, requestedThreads: number): {
  ok: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (requestedThreads > 1 && !env.crossOriginIsolated) {
    warnings.push(
      `请求 ${requestedThreads} 线程，但 crossOriginIsolated=false：` +
        `缺少跨源隔离，多线程前提未满足。`
    );
  }

  if (requestedThreads > 1 && !env.sharedArrayBuffer) {
    warnings.push(
      "SharedArrayBuffer 不可用，多线程无法启用。检查 COOP/COEP 头是否生效。"
    );
  }

  if (env.hardwareConcurrency === 1 && requestedThreads > 1) {
    warnings.push("hardwareConcurrency=1，浏览器只报告单核。");
  }

  return { ok: warnings.length === 0, warnings };
}

export type RunRecord = {
  timestamp: string;
  group: string;
  warmup: boolean;
  env: EnvInfo;
  requestedThreads: number;
  /** Page export does not observe worker execution; use a separate trace. */
  actualMultithreaded: null;
  merkleTreeDepth: number;
  initTimeMs: number | null;
  proveTimeMs: number | null;
  verifyTimeMs: number | null;
  proofVerified: boolean | null;
  backendDestroyed: boolean | null;
  backendCooldownMs: number | null;
  cleanupError: string | null;
  error: string | null;
};

export function downloadJSON(records: RunRecord[], filename: string) {
  const blob = new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
