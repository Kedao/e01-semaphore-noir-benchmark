# E01 · 桌面深度 7 B2/B3 对照

## 结果

在本机、有跨源隔离、未插电的这一批中，请求 14 线程的 B2 证明调用中位数比请求 1 线程的 B3 低 40.9%（耗时比 B3/B2 = 1.69）。按实验的描述性区间，支持线程条件对耗时有贡献；没有超过预设的 2 倍界线。两种先后顺序都观察到 B2 较快。

| 组别 | 请求线程 | 样本 | 证明中位数 (ms) | Q1–Q3 (ms) | 最小–最大 (ms) | 初始化中位数 (ms) | 验证中位数 (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| B2 | 14 | 10 | 1144.74 | 965.42–1157.18 | 919.96–1190.87 | 737.98 | 48.19 |
| B3 | 1 | 10 | 1936.38 | 1886.90–2019.88 | 1799.85–2119.40 | 595.20 | 35.97 |

四块证明中位数依次为 1143.15, 1947.46, 1899.27, 1146.32 ms，前半 B3/B2=1.70，后半 B3/B2=1.66。排除 warmup=true 的四行，非预热行全部纳入。Q1/Q3 分别为每组排序后低/高五项的中位数。24/24 条（含预热）验证通过、清理调用成功，未记录错误。清理后的实际等待 3000.22–3986.56 ms，未计入表中阶段时间。

## 环境与原始记录

- [脱敏 JSON](../raw/desktop-depth7-B2-B3-ABBA.json)，SHA-256：`664230c4d0d1e9585876d64f38174fc93e36d5f61b33988b4cac0997d3bd5ff9`。B2 → B3 → B3 → B2；每块 1 次预热 + 5 次测量，用户按不录制的操作运行。
- 设备：桌面 A，本机 Linux x86_64。用户报告未插电、Chrome 156（正式版，x86_64）。未采集电量、功耗模式的精确设置、温度。
- 浏览器原始读数：COI/SAB/isSecureContext/SIMD 均 true，hardwareConcurrency=14。预览页 [HEAD 记录](../smoke/desktop-preview-headers.txt)实测 COOP same-origin、COEP require-corp。[预采样构建清单](../smoke/desktop-build-sha256.txt)于归档时逐文件核验一致。
- SDK 代码基于 6e24a48b2cb22c05a0c13361b5228d5e1c99bd0d，带已归档的 [依赖](../smoke/sdk-fflate-fix.patch) 和 [清理](../smoke/sdk-worker-cleanup.patch) 补丁。bb.js 0.82.2、noir_js 1.0.0-beta.3、Hashcloak artifacts 1.0.0；SDK 构建的浏览器产物包含在构建清单中。
- 代码查得该 SDK 按深度 7 请求 semaphore-noir-7.json 与 semaphore-vks/semaphore-vk-7，基础地址为 https://hashcloak.github.io/noir-artifacts-host；本批未记录远程文件内容哈希和每轮缓存命中。每轮新建后端，验证后销毁，等待至少 3 秒；不声称严格冷缓存。
- B2 与 B3 的实际 Worker 路径证据来自先前的 [B2 录制](../smoke/b2-worker-trace.md) 和 [B3 录制](../smoke/b3-worker-trace.md)。正式耗时批不带录制，actualMultithreaded=null 保留，不能把每轮 14 个有效 CPU 线程当作本批实测。
- 证明调用含 witness 与生成证明；初始化、验证、等待各自分开。B2 的初始化中位数更高，1.69 倍只适用于证明调用。未测运行时峰值内存，不能据此排除内存效应，也不能归因原报告的历史条件。

## 下一步

同机仍未插电，深度 7，关闭录制；对请求数均为 hardwareConcurrency 的 B1 与 B2 做四块 B1 → B2 → B2 → B1。每块 1 次预热 + 5 次测量；无隔离和有隔离分别打开独立页面，运行前各刷新一次，运行中不刷新，末尾每页各导出一次。该比较检验切换隔离配置的整体效果；与本批 B2/B3 并列解释，不跨批混合算比值。
