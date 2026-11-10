# E01 · B2 多 Worker 接通

设备代号：桌面 A；Linux x86_64、Chrome 156。接通检查不纳入正式耗时统计。

[脱敏 JSON](desktop-B2-trace-smoke.json)。原始 DevTools 录制保留在私有工作区，未随仓库分发。

深度 7、请求 14 线程、COI/SAB 均 true。两轮共记录到 28 个 Dedicated Worker（每轮 14 个）。记录轮长消息回调约 578 ms，14 个 Worker 都采到 WASM 调用栈；按 10 ms 分箱，同一 WASM 函数的叶节点最多在 11 个不同 Worker 的样本中出现。

提取方法：按录制内进程和 profile ID 对齐 Profile 与 ProfileChunk，累加采样的 timeDeltas，再统计选定窗口中的 WASM 叶节点。这些栈可能包含等待，不能推断每核利用率。
