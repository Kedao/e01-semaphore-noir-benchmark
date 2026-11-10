import { Buffer } from "buffer/";
import { detectEnv, validateEnv, downloadJSON, type RunRecord } from "./env";
import { runBenchmark } from "./bench";

// The pinned Noir SDK dependencies use the Node Buffer API in browser builds.
Object.assign(globalThis, { Buffer });

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const allRecords: RunRecord[] = [];

async function renderEnv() {
  const env = await detectEnv();
  const threads = navigator.hardwareConcurrency ?? 1;
  const check = validateEnv(env, threads);

  const rows: [string, string, string][] = [
    ["crossOriginIsolated", String(env.crossOriginIsolated), env.crossOriginIsolated ? "ok" : "bad"],
    ["SharedArrayBuffer", String(env.sharedArrayBuffer), env.sharedArrayBuffer ? "ok" : "bad"],
    ["hardwareConcurrency", String(env.hardwareConcurrency), ""],
    ["deviceMemory", env.deviceMemoryGB ? `${env.deviceMemoryGB} GB` : "未知", ""],
    ["WASM SIMD", String(env.wasmSimd), env.wasmSimd ? "ok" : "warn"],
    ["移动端", String(env.mobile), ""],
  ];

  $("env").innerHTML = rows
    .map(
      ([k, v, cls]) =>
        `<div><span>${k}</span><span class="${cls}">${v}</span></div>`
    )
    .join("");

  if (!check.ok) {
    $("warning").innerHTML = `<div class="warnbox">
      ${check.warnings.map((w) => `<div>⚠ ${w}</div>`).join("")}
      <div style="margin-top:.4rem;opacity:.8">
        提示：本页若以无 COOP/COEP 的方式提供，多线程不会生效。
        这正是要检验的变量。
      </div>
    </div>`;
  }
}

function renderResults() {
  const tbody = $("results").querySelector("tbody")!;
  tbody.innerHTML = allRecords
    .map((r) => {
      const threads = `${r.requestedThreads} / 未测`;
      const status = r.error || r.cleanupError
        ? `<span class="bad">${r.cleanupError ? "清理失败" : "错误"}</span>`
        : `<span class="ok">验证通过</span>`;
      return `<tr>
        <td>${r.group}${r.warmup ? "（预热）" : ""}</td>
        <td>${r.merkleTreeDepth}</td>
        <td>${threads}</td>
        <td>${r.initTimeMs ?? "—"} ms</td>
        <td>${r.proveTimeMs ?? "—"} ms</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
  $("empty").style.display = allRecords.length ? "none" : "block";
}

$("start").addEventListener("click", async () => {
  const btn = $("start") as HTMLButtonElement;
  btn.disabled = true;
  const log = (m: string) => {
    const el = $("log");
    el.textContent += `\n${m}`;
    el.scrollTop = el.scrollHeight;
  };

  const group = ($("group") as HTMLSelectElement).value;
  const threadsSel = ($("threads") as HTMLSelectElement).value;
  const threads = threadsSel === "n" ? navigator.hardwareConcurrency ?? 1 : 1;
  const depth = Number(($("depth") as HTMLSelectElement).value);
  const runs = Number(($("runs") as HTMLInputElement).value) || 10;

  try {
    const outcome = await runBenchmark(
      { group, merkleTreeDepth: depth, threads, runs },
      log
    );
    allRecords.push(...outcome.records);
    renderResults();
    ($("download") as HTMLButtonElement).disabled = allRecords.length === 0;
  } catch (err) {
    log(`✗ 运行失败：${String(err)}`);
  } finally {
    btn.disabled = false;
  }
});

$("download").addEventListener("click", () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadJSON(allRecords, `bench-${stamp}.json`);
});

renderEnv();
