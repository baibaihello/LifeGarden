# 实验2 PILOT live v1.1.2

RUN_MODE=live、PHASE=PILOT。正式入口真实上传；演练入口 index.html?mode=preview 在本地抽组、不上传、不请求 DataPipe condition。演练模式在存储请求层再次拦截 condition/data/base64，避免误占正式序列。

2026-11-08｜分组号占用记录：本地演练 0 个；本轮真实验收新增 1 个（condition=1，SD）；历史通过 live 链接试跑的累计占用数待 DataPipe 后台核实，不能用 116 次拒收或 0 个 Completed sessions 推算。

验收编号 PILOT-ACCEPTANCE-20261108-01；这是技术验收数据，必须排除于 PILOT 分析。真实试收使用线上 v1.1.1 原网页，v1.1.2 仅增加演练网络拦截并同步版本与清单，不改 live 上传格式和测量内容。
研究者已关闭不匹配的 DataPipe Validation；此后 API 接受 JSON 与独立录音，正在核验最终收件。主快照禁止 pendingFiles，录音只保留元数据。

检查：python3 tools/check_release.py --production；追加 --pilot 检查备用配置。
历史版本保留。手机真机自然时长验收不能由桌面自动流程代替。
