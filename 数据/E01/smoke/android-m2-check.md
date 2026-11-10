# E01 · 安卓 A M2 接通检查

- 安卓 A，经 USB 连接和 ADB reverse，手机 Chrome 访问 localhost:4173。运行时 COI、SAB、安全上下文和 SIMD 均为 true；浏览器版本为 Chrome 156，未独立取得系统与 Chrome 完整版本。手机电量、充电状态与温度未读取；仅确认 USB 线连接。
- [脱敏 JSON](android-M2-smoke.json)；SHA-256：`294993f9be80b2e252915f8a4c36a3e693f6b414aed9257a12e88ef052f39b66`。深度 7，浏览器报告 8 个逻辑处理器，请求 8 线程，实际线程状态为 null，无安卓 Worker 录制。
- 预热、记录两轮均 proofVerified=true、backendDestroyed=true，无错误。预热初始化/证明/验证分别为 6097.03 / 1098.99 / 380.71 ms，记录轮为 550.69 / 1005.93 / 44.21 ms。只确认路径接通，不把两轮时间差归因给缓存或线程。
- 下一步：已加手机 8000 → 电脑 8000，电脑端 HEAD 200、未返回 COOP/COEP。手机打开 localhost:8000，确认 COI/SAB false，M1、请求 hardwareConcurrency、深度 7、次数 1。正式移动端测速前另核对环境与 Worker 证据。
