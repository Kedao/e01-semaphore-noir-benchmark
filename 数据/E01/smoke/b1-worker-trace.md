# E01 · B1 无隔离接通

设备代号：桌面 A；Linux x86_64、Chrome 156。接通检查不纳入正式耗时统计。

[脱敏 JSON](desktop-B1-trace-smoke.json)。原始 DevTools 录制保留在私有工作区，未随仓库分发。

深度 7、请求 14 线程、COI/SAB 均 false。原始 group 是 B2，按实际条件归为 B1。两轮共两个 Dedicated Worker，先后出现。记录轮长回调约 1601.88 ms，只有记录轮的 Worker 采到 WASM（9343 条叶节点样本）；预热 Worker 在同窗口为 0。
