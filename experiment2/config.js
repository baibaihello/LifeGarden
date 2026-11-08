window.LG2_CONFIG = {
  VERSION: 'experiment2-full-v1.0.3',
  PROTOCOL: 'v0.9 draft + approved v0.9C text / three-layer choices / v0.16 media',
  MODE: 'review',
  RUN_MODE: 'prerun', // 技术预跑：仅本地保存，不占正式分组，不发送短信
  RECRUITMENT_PLATFORMS: ['naodao', 'credamo'],
  PHASE: 'PRERUN',
  DATAPIPE_ID: 'Mn7Nkxd8gyJc',  // 实验 2 专用，2026-11-08 建；不是研究一的
  CONTACT_DATAPIPE_ID: '',
  PLATFORM: 'naodao',
  PID_PARAMS: ['uid', 'pid', 'participant', 'subject', 'id', 'naodao_id'],
  COMPLETION_PREFIX: 'LG4',
  CONTACT_EMAIL: '444602451@qq.com',
  ETHICS_NO: 'EF20260924007（材料预实验经伦理委员会邮件同意；正式实验走修订批文，批文号待补）',
  INSTITUTION: '香港中文大学（深圳）人文社科学院应用心理学',
  COMPENSATION_TEXT: '报酬按招募说明发放，退出当天报酬照付。',
  STORAGE_NOTICE: '作答经 HTTPS 发送至 DataPipe，并保存至研究者为实验2配置的非公开存储项目。',
  // DataPipe must cycle over EIGHT conditions 0..7, not four.
  CONDITION_COUNT: 8,
  BLOCK_ORDER: ['RU', 'SD', 'RD', 'SU', 'RD', 'SU', 'RU', 'SD'],
  BACKGROUND_WAIT_POLICY: 'foreground_active',
  BACKGROUND_POLICY_APPROVED: true,
  ENABLE_WORKSTATION_REQUEST: true,
  RECORDING_MAX_SECONDS: 90,
  RECORDING_MAX_BYTES: 8000000,
  MEDIA_TEXT_REVIEWED: true,
  CONSENT_APPROVED: true,
  // Launch-site completion destinations must be configured here, never supplied by a participant URL.
  COMPLETION_URLS: {},
  EXCLUDED_PARTICIPANT_HASHES: [],
  PREVIOUS_PHASE_HASHES: [],
  SAFETY_KEYWORDS: ['自杀', '自残', '伤害自己', '不想活', '活着没意思', '结束生命', '绝望', '解脱'],
  RESOURCE_CARD: '如感到明显不适，可以先暂停，看看你所在的房间。你可以随时退出，报酬按招募说明发放。需要联系研究者时，请通过招募平台或页面列出的联系邮箱。',
  RELEASE_READY: true
};
