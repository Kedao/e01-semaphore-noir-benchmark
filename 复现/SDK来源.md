# SDK 来源与复现边界

- 上游：Hashcloak 的 `semaphore-noir`，仓库 `https://github.com/hashcloak/semaphore-noir.git`，Git commit `6e24a48b2cb22c05a0c13361b5228d5e1c99bd0d`。
- vendored 包：`@hashcloak/semaphore-noir-proof@1.0.0`。本目录保留包的源码、构建产物、原始 LICENSE 与 README。主要运行依赖为 bb.js `0.82.2`、Noir `1.0.0-beta.3`、identity/group `4.9.1`、Hashcloak artifacts `1.0.0`。
- [依赖与锁文件修复](../数据/E01/smoke/sdk-fflate-fix.patch)补齐 `fflate@0.8.2` 并保存上游工作区锁文件差异；[清理补丁](../数据/E01/smoke/sdk-worker-cleanup.patch)让本地 SDK 等待清理调用返回。补丁以所列上游 commit 为基准。
- 如需从上游重建 SDK：检出上面 commit，应用两份补丁；在上游仓库用其自带 Yarn 4.1.0 执行 `install --immutable`。依次运行 `yarn workspace @semaphore-protocol/utils build`、`yarn workspace @semaphore-protocol/identity build`、`yarn workspace @semaphore-protocol/group build`、`yarn workspace @hashcloak/semaphore-noir-proof build`。这里的 `yarn` 可替换为 `node .yarn/releases/yarn-4.1.0.cjs`。无需整仓库构建网站与文档。
- 独立仓库的 npm 锁文件将 SDK 作为仓库内本地包安装，`.npmrc` 固定 `install-links=true`。它不需要原实验的相邻目录、Yarn 或个人配置。重新锁定本地包依赖是分发步骤，历史桌面/安卓数据仍来自原测量构建；不把分发构建与历史构建视为逐字节相同。
- [历史测量构建清单](../数据/E01/smoke/desktop-build-sha256.txt)中的路径相对于原工作区。独立仓库验收结果另存，不覆盖历史数据。
- 本仓库提供录制摘要与提取方法，原始 DevTools 文件留在原工作区。桌面模式证据为历史接通录制，不是对每条正式样本的复测。
