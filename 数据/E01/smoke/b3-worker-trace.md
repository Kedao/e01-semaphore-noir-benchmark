# E01 · B3 有隔离、请求 1 线程

设备代号：桌面 A；Linux x86_64、Chrome 156。接通检查不纳入正式耗时统计。

[脱敏 JSON](desktop-B3-trace-smoke.json)。原始 DevTools 录制保留在私有工作区，未随仓库分发。

深度 7，COI/SAB 均 true；原始 group 是 B2，按请求 1 线程归为 B3。两轮各有一个 Dedicated Worker，长回调先后出现。记录轮只有一个 Worker 采到 WASM（9436 条叶节点样本），预热 Worker 在同窗口为 0。验证通过。
