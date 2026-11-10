# Semaphore Noir 浏览器证明耗时：桌面与安卓的线程请求对照

在同样开启跨源隔离的条件下，提高线程请求数，桌面 A 在深度 7、10、11 的证明耗时中位数下降了 **41%–45%**，安卓 A 在深度 7 下降了 **54%**。桌面接通录制观察到了单 Worker 和多 Worker 两条执行路径。安卓只测了不同请求下的耗时，实际执行用了多少线程仍未知。

Hashcloak 的报告记录了浏览器端 Semaphore Noir 比 Circom 慢，并提出浏览器内存限制可能是原因。我用同一套 Semaphore Noir 构建做对照，保持跨源隔离，只改线程请求，测量证明耗时的变化。[Hashcloak 基准报告，2026-11-10 查阅](https://hashcloak.github.io/semaphore-noir-final-report/benchmarks.html#browser-benchmarks)

## 实测结果

### 保持隔离，改变线程请求

两台设备都用 Chrome 156。主对照中，页面实测 `crossOriginIsolated` 为 `true`，`SharedArrayBuffer` 可用。每个深度单独跑四块，按多线程请求 → 1 → 1 → 多线程请求排列。每块跑一次预热和五次正式测量，每组保留十条非预热记录。四组对照含预热均通过证明验证。证明阶段包含生成 witness 和生成证明，初始化、验证和轮间清理等待各自计时。[跨源隔离和共享内存说明，2026-11-10 查阅](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated)

| 设备与电路深度 | 请求 1 线程，中位数（Q1–Q3），ms | 请求 14 或 8 线程，中位数（Q1–Q3），ms | 中位数耗时比 |
| --- | ---: | ---: | ---: |
| 桌面 A，深度 7 | 1936.38（1886.90–2019.88） | 1144.74（965.42–1157.18），请求 14 | 1.69 |
| 桌面 A，深度 10 | 2174.46（2133.42–2322.13） | 1219.23（1187.05–1315.00），请求 14 | 1.78 |
| 桌面 A，深度 11 | 2696.09（2653.00–2749.63） | 1476.04（1417.56–1491.26），请求 14 | 1.83 |
| 安卓 A，深度 7 | 2131.70（2096.31–2133.86） | 987.72（919.56–1022.08），请求 8 | 2.16 |

耗时比用请求 1 线程的中位数除以同批请求 14 或 8 线程的中位数。四组在两种先后顺序中都观察到请求更多线程时耗时更短。桌面的三个深度各自成批，深度本身未交替测试，因此这三行只支持收益在三个深度都出现。[各批摘要与重算脚本](https://github.com/Kedao/e01-semaphore-noir-benchmark/tree/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/summary)

### 桌面录制看到了不同的 Worker 路径

深度 7 的单独接通录制中，有隔离且请求 14 线程时，记录轮在 14 个 Dedicated Worker 上都采到了 WebAssembly（WASM）调用栈。有隔离且请求 1 线程时，记录轮只在一个 Worker 上采到 WASM。关掉隔离、仍请求 14 线程的接通复跑里，记录轮也只在一个 Worker 上采到 WASM。这些录制支持线程执行条件对桌面耗时有贡献。WASM 栈样本可能包含等待，正式测量也没有逐轮录制，因此无法给出每轮实际并行度或各核利用率。[桌面 Worker 录制摘要](https://github.com/Kedao/e01-semaphore-noir-benchmark/tree/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/smoke)

另一次桌面深度 7 对照固定请求 14 线程，只切换隔离配置。无隔离和有隔离的证明耗时中位数分别为 **1943.75 ms** 和 **1091.28 ms**，每组 10 条，相差 **1.78 倍**。这组数字衡量的是切换整套隔离配置的效果。安卓的隔离开关批次发生了运行顺序偏差，完整结果另行保留，未纳入主表。[桌面隔离对照](https://github.com/Kedao/e01-semaphore-noir-benchmark/blob/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/summary/desktop-depth7-B1-B2-ABBA.md) · [安卓隔离对照与顺序偏差](https://github.com/Kedao/e01-semaphore-noir-benchmark/blob/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/summary/android-depth7-M1-M2-order-check.md)

### 安卓深度 11 的证明阶段与初始化

安卓 A 在有隔离、请求 8 线程的深度 11 小批检查中，**4/4 条证明验证通过**。三条非预热记录的证明耗时中位数为 **1.33 秒**。预热轮仅初始化就用了 **7.34 秒**，加上证明和验证共 **9.27 秒**，页面加载和轮间等待另计。这批只有一个线程请求档位，适合报告此设置下的阶段耗时。[安卓深度 11 记录](https://github.com/Kedao/e01-semaphore-noir-benchmark/blob/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/summary/android-depth11-M2-check.md)

## 待验证的解释

- **内存压力是否解释原报告的差距。** 本次未测运行时内存峰值，也没有做改变内存条件的对照。内存是否影响本次结果、是否解释原报告中 Noir 与 Circom 的差距，仍待测量。
- **原报告当时走的是哪条执行路径。** 要回答这个问题，需要原测量环境的响应头、隔离与共享内存读数，以及对应版本的后端运行证据。本次桌面录制只覆盖自己的接通批次。
- **安卓的收益对应多少实际并行。** 深度 7 测到了请求 8 和请求 1 的耗时差异。安卓尚无 Worker 录制，实际并行度和它对耗时差异的贡献待确认。

## 复跑与核对

在线演示可直接生成并验证一份证明。首次可选 B3、请求 1 线程、深度 7、次数 1。在线页面开启跨源隔离，切换组别只会改变记录标签。要做无隔离对照，可按仓库说明用同一构建启动另一份本地服务。[在线演示](https://turbo-coral-oaukmgn.tmp.now/) · [本地复跑步骤](../README.md#五分钟复跑)

仓库保留了脱敏的逐轮 JSON、分组顺序和重算脚本。历史测量使用 bb.js `0.82.2` 和 Noir `1.0.0-beta.3`，远端电路及验证密钥的内容哈希未记录。[逐轮数据](https://github.com/Kedao/e01-semaphore-noir-benchmark/tree/5a31d046aa600cce60107bfa83b70cd55fbc28f9/数据/E01/raw) · [SDK 来源与构建边界](https://github.com/Kedao/e01-semaphore-noir-benchmark/blob/5a31d046aa600cce60107bfa83b70cd55fbc28f9/复现/SDK来源.md)
