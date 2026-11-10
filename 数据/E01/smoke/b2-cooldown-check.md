# E01 · B2 轮间等待验证

设备代号：桌面 A；Linux x86_64、Chrome 156。接通检查不纳入正式耗时统计。

[脱敏 JSON](desktop-B2-cooldown-smoke.json)。原始 DevTools 录制保留在私有工作区，未随仓库分发。

深度 10、请求 14 线程、COI/SAB 均 true。预热清理返回约 2 秒后，13 个子 Worker 出现 V8.TerminateExecution；最后一条这样的终止事件早于第二轮开始约 1 秒。记录轮的等待值为 3000.4 ms。这里只验证本次轮间没有观测到旧池 WASM 栈跨入下一轮，不代表内存已回收或所有设备都适用该等待。
