# E01 · 桌面深度 11 B2/B3 对照

同一桌面浏览器的隔离条件下，深度 11 的 B2（请求 14 线程）证明调用中位数比 B3（请求 1 线程）低 45.3%（B3/B2 = 1.83）。两种顺序下 B2 都更快；与[深度 7 的 1.69 倍](desktop-depth7-B2-B3-ABBA.md)、[深度 10 的 1.78 倍](desktop-depth10-B2-B3-ABBA.md)方向一致。不同深度批次未对深度进行交替控制，不用它们推断收益随深度增长。

| 组别 | 请求线程 | 样本 | 证明中位数（ms） | Q1–Q3（ms） | 最小–最大（ms） | 初始化中位数（ms） | 验证中位数（ms） |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| B2 | 14 | 10 | 1476.04 | 1417.56–1491.26 | 1246.61–1514.47 | 767.00 | 58.22 |
| B3 | 1 | 10 | 2696.09 | 2653.00–2749.63 | 2627.63–2760.54 | 684.24 | 40.57 |

顺序 B2 → B3 → B3 → B2，四块中位数 1490.53, 2689.99, 2732.99, 1468.40 ms；前、后半耗时比 1.80、1.86。四条预热排除，20 条非预热全纳入。Q1/Q3 为每组排序后低、高五项的中位数。24 条全部验证和清理调用成功。

## 数据与环境

- [脱敏 JSON](../raw/desktop-depth11-B2-B3-ABBA.json)；SHA-256：`e8702c29216b3be1dee81a98acebd1a374aac29e4aaad2e09faddcab9576776d`。按前轮操作要求未插电、不录制；本轮未单独重报电源与完整版本。
- 桌面 A、Linux x86_64，浏览器版本为 Chrome 156。COI/SAB/安全上下文/SIMD 均为 true，浏览器报告 14 个逻辑处理器。4173 响应头见[上批本机记录](../smoke/desktop-b1-b2-headers.txt)；本批未独立抓头。
- [构建及锁文件哈希](../smoke/desktop-build-sha256.txt)核验一致。SDK 基于 6e24a48b2cb22c05a0c13361b5228d5e1c99bd0d，bb.js 0.82.2、noir_js 1.0.0-beta.3。SDK 按深度加载电路，未测电路远端内容哈希、缓存命中、内存峰值、温度。证明调用含 witness 和证明生成；初始化、验证与等待分开。
- 本批线程实际字段 null；先前的 Worker 路径证据来自深度 7/10 的接通录制，不冒充深度 11 逐轮观测。结合深度 7 两项对照，桌面结果支持线程条件对耗时有贡献，仍不确定内存贡献或历史报告的运行环境。

## 下一步

转安卓接通检查：USB 数据线、USB 调试，桌面 Chrome 的 chrome://inspect/#devices 识别设备后，将手机端口 4173 转发至本机 localhost:4173。手机 Chrome 打开 http://localhost:4173 并核对隔离读数，先不正式采样。参考：[Android 远程调试](https://developer.chrome.com/docs/devtools/remote-debugging/)、[USB 端口转发](https://developer.chrome.com/docs/devtools/remote-debugging/local-server/)。
