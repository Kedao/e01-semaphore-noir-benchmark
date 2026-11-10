# E01 · B1 无隔离接通复跑

设备代号：桌面 A；Linux x86_64、Chrome 156。接通检查不纳入正式耗时统计。

[脱敏 JSON](desktop-B1-repeat-trace-smoke.json)。原始 DevTools 录制保留在私有工作区，未随仓库分发。

深度 7、请求 14 线程、COI/SAB 均 false。两轮的两个 Dedicated Worker 先后出现，记录轮长回调约 1600.44 ms，记录轮 Worker 有 9429 条 WASM 叶节点样本，预热 Worker 在同窗口为 0。验证通过。
