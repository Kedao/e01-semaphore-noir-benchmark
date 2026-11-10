import { validateEnv, type EnvInfo } from "../src/env.ts";

const base: EnvInfo = {
  isSecureContext: true,
  crossOriginIsolated: false,
  sharedArrayBuffer: false,
  hardwareConcurrency: 8,
  deviceMemoryGB: 4,
  userAgent: "test",
  platform: "test",
  wasmSimd: true,
  mobile: true,
};

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}`); }
}

console.log("Case 1: 模拟请求8线程，但无跨源隔离");
let r = validateEnv(base, 8);
check("判定为不通过", !r.ok);
check("提示缺少跨源隔离", r.warnings.some(w => w.includes("缺少跨源隔离")));
check("提示 SharedArrayBuffer", r.warnings.some(w => w.includes("SharedArrayBuffer")));

console.log("Case 2: 请求8线程，COOP/COEP 已开");
r = validateEnv({ ...base, crossOriginIsolated: true, sharedArrayBuffer: true }, 8);
check("判定通过", r.ok);
check("无警告", r.warnings.length === 0);

console.log("Case 3: 只请求1线程（对照组），无头也应通过");
r = validateEnv(base, 1);
check("判定通过", r.ok);

console.log("Case 4: COI 开了但 SAB 缺失（不应出现，但要能捕获）");
r = validateEnv({ ...base, crossOriginIsolated: true, sharedArrayBuffer: false }, 4);
check("判定不通过", !r.ok);
check("仍提示 SAB", r.warnings.some(w => w.includes("SharedArrayBuffer")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
