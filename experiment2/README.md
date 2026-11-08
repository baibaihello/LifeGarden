# 实验2 PILOT live v1.1.2

正式入口 RUN_MODE=live、PHASE=PILOT。演练入口 index.html?mode=preview 自动 testData=true、phase=PRERUN，本地抽组，禁止调用 DataPipe 分组和上传接口。

2026-11-08｜取号记录：本地演练 0 个；本轮真实验收新增 1 个；历史 live 试跑累计占用数待核实，拒收请求数不代表取号数。

阶段取值统一 P / C / PRERUN / PILOT。真实验收的最终主数据与独立录音已在 Drive 核对；主快照不含 pendingFiles。测试编号、文件链接及详细核验记录仅保留于研究者本地交付，不公开发布。

修复上传过程中新增文件的收尾清空逻辑；production 检查、演练拦截检查和模拟上传队列检查通过。手机真机验收仍单独进行。
