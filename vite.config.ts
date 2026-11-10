import { defineConfig } from "vite";

/** Keep headers identical for the isolated dev and preview pages. */
const coopCoepHeaders = {
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export default defineConfig({
  server: {
    headers: coopCoepHeaders,
  },
  preview: {
    headers: coopCoepHeaders,
  },
  // bb.js 的 worker/wasm 资源必须由包自身解析，不能被预打包
  optimizeDeps: {
    exclude: ["@aztec/bb.js", "@aztec/bb.js-api"],
  },
});
