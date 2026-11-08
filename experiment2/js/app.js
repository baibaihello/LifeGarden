window.LG2_RUN_EXPERIMENT = async function () {
  'use strict';
  const cfg = window.LG2_CONFIG, bank = window.LG2_BANK, ui = window.LG2UI;
  const core = window.LG2Core, storage = window.LG2Storage;
  const query = new URLSearchParams(location.search);
  if(['naodao','credamo','offline'].includes(query.get('platform')))cfg.PLATFORM=query.get('platform');
  const preview = cfg.RUN_MODE === 'prerun' || query.get('mode') === 'preview';
  const escape = ui.escape, field = ui.field;
  const $ = id => document.getElementById(id);
  let state, transient = {}, playerFrame = null, playerNonce = null, saving = false;
  let recordingCleanup = null,retainedFrame=null;
  const now = () => new Date().toISOString();
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16)).join('-');
  function completionCode(status) {
    const random = crypto.getRandomValues(new Uint32Array(5));
    if (status !== 'completed') return 'LG0-' + String(random[0] % 1000000).padStart(6, '0');
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const hours = Math.floor((Date.now() - Date.UTC(2026, 8, 1)) / 3600000);
    const t = ((hours % 1024) + 1024) % 1024;
    const seven = Array.from(random, n => alphabet[n % 32]).join('') + alphabet[Math.floor(t / 32)] + alphabet[t % 32];
    const check = [...seven].reduce((sum, char, i) => sum + alphabet.indexOf(char) * (i + 1), 0) % 32;
    const code = seven + alphabet[check];
    return code.slice(0, 4) + '-' + code.slice(4);
  }
  function event(type, extra = {}) {
    state.events.push({ type, stage: state.plan[state.cursor], atISO: now(), monotonicMs: performance.now(), ...extra });
  }
  function put(tag, data) { state.data[tag] = { atISO: now(), ...data }; }
  function numeric(result) {
    for (const [key, value] of Object.entries(result.values || {})) {
      if (/^e_|^phq\d$/.test(key)) result.values[key] = Number(value);
    }
    return result;
  }
  function stripText(text) {
    const value = String(text || '');
    return {
      chars: value.replace(/\s/g, '').length,
      safetyKeyword: cfg.SAFETY_KEYWORDS.some(word => value.includes(word)),
      ...(state.data.consent?.ai_ok === '1' ? { text: value } : {})
    };
  }
  function snapshot() {
    return {
      schemaVersion: 'lg2-complete-1', testData: preview, version: cfg.VERSION,
      protocol: cfg.PROTOCOL, materialHash:window.LG2_MATERIAL_HASH, checkpointSequence:state.sequence, phase: preview ? 'PRERUN' : state.phase, participantId: state.pid,
      platform: cfg.PLATFORM, sessionId: state.id, startedAt: state.startedAt,
      assignment: state.assignment || null, design: state.design, consent: state.data.consent,
      data: state.data, events: state.events, stage: state.plan[state.cursor],
      withdrawal: state.withdrawal || null, completion: state.completion || null,
      derived: core.derive(state.data), interactionUse: 'stations2and3_descriptive_only'
    };
  }
  async function checkpoint(tag) {
    state.sequence++;
    const upload = preview || state.data.consent?.agree !== '1' ? null : {
      kind: 'data', sessionKey: state.key, experimentID: cfg.DATAPIPE_ID,
      filename: 'E2_' + state.id + '_' + String(state.sequence).padStart(4, '0') + '_' + tag + '.json',
      data: JSON.stringify(snapshot())
    };
    await storage.checkpoint(state, upload);
    $('saveStatus').textContent = preview ? '本地演练 · 不上传' : '作答已保存到本机，正在同步';
    if (!preview) storage.flush(state.key).then(result => {
      $('saveStatus').textContent = result.pending ? '作答已保存在本机，网络恢复后重试上传' : '作答已同步';
    });
  }
  async function saveRecording(blob, tag) {
    if (state.data.consent?.recording_ok !== '1') throw Error('未获录音同意');
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const extension = blob.type.includes('mp4') ? 'm4a' : 'webm';
    const filename = 'E2_' + state.id + '_' + tag + '_' + uuid() + '.' + extension;
    await storage.queue({ kind: 'recording', sessionKey: state.key, experimentID: cfg.DATAPIPE_ID,
      filename, data, testData: preview });
    state.data.recordings ||= [];
    state.data.recordings.push({ tag, filename, mimeType: blob.type, bytes: blob.size, atISO: now() });
    await checkpoint('recording');
  }
  async function textResponse(title, prompt, tag, optional = true, extraHtml = '') {
    let cleanup = () => {};
    const initialRecordings = (state.data.recordings || []).filter(r => r.tag === tag).length;
    const hasRecording = () => (state.data.recordings || []).filter(r => r.tag === tag).length > initialRecordings;
    let result;
    try { result = await ui.form(title, '<p>' + prompt + '</p>' + extraHtml + field('free', '写几个字，也可以不写。', 'textarea'), {
      submit: optional ? '跳过' : '继续',
      onMount: form => {
        const submit = form.querySelector('[type=submit]');
        const update = () => { submit.textContent = form.querySelector('textarea').value.trim() || hasRecording() || !optional ? '继续' : '跳过'; };
        form.addEventListener('input', update);
        form.addEventListener('recordingbusy', e => { submit.disabled = e.detail; });
        update();
        LG2Recording.start(form, state.data.consent?.recording_ok === '1', cfg, async blob => { await saveRecording(blob, tag); update(); })
          .then(fn => { cleanup = fn; recordingCleanup = fn; });
      }
    });
    } catch (error) { await cleanup(); recordingCleanup = null; throw error; }
    await cleanup(); recordingCleanup = null;
    const text = result.values.free;
    delete result.values.free;
    return { ...result, free: stripText(text), skipped: !String(text).trim() && !hasRecording() };
  }
  async function emotion(tag, short = false) {
    const order = state.design.emotionOrder;
    const panas = order.panas.map(id => bank.panas.find(item => item[0] === id));
    const singles = order.singles.map(id => bank.singles.find(item => item[0] === id));
    const freeTag = tag + '_free';
    const initialCount = (state.data.recordings || []).filter(r => r.tag === freeTag).length;
    let cleanup = () => {}, result;
    let html = short ? '' : '<div class="emotion-free">' + field('free', '用一句话说说你此刻的感受。（可打字、录音，也可不填）', 'textarea') + '</div>';
    if (!short) html += '<p>此刻你感受到下面各项的程度。</p>' + panas.map(([id, text]) =>
      field('e_' + id, text, 'likert', { max: 5, low: '几乎没有', high: '极其强烈' })).join('');
    html += '<p>请在线上点选，每一项都需要作答。</p>' + singles.map(([id, text]) => field('e_' + id, text, 'scale')).join('');
    try {
      result = numeric(await ui.form('此刻的感受', html, {onMount: form => {
        if(short)return;
        const target = form.querySelector('.emotion-free');
        target.addEventListener('recordingbusy', e => {form.querySelector('[type=submit]').disabled=e.detail;});
        LG2Recording.start(target, state.data.consent?.recording_ok === '1', cfg, blob => saveRecording(blob, freeTag))
          .then(fn => {cleanup=fn;recordingCleanup=fn;});
      }}));
    } catch(error) {await cleanup();recordingCleanup=null;throw error;}
    await cleanup();recordingCleanup=null;
    result.order_panas = short ? null : order.panas;
    result.order_single = order.singles;
    if(!short){
      const text = result.values.free || '';
      delete result.values.free;
      result.free = {free:stripText(text),skipped:!text.trim() && (state.data.recordings || []).filter(r => r.tag===freeTag).length===initialCount,
        responseMs:result.responseMs,measurementPage:'same_page_as_scales',interactions:result.interactions.free || null};
    }
    put(tag, result);
    event('emotion_completed', { tag });
  }
  async function allocator(tag, money = false) {
    const people = state.data.people.values;
    const items = money ? [
      ['gift', '给一个对你来说特别的人买一件好东西'],
      ['pension', '存入养老（退休）储蓄'],
      ['fun', '给自己安排一次尽兴、稍微奢侈一点的活动'],
      ['current', '存进随时可取的活期账户']
    ] : [['P1', people.p1], ['P2', people.p2], ['P3', people.p3], ['S', '现在的自己'], ['F', '五年后的自己']];
    const total = money ? 1000 : 100, order = core.shuffle(items), trace = [];
    let start;
    const html = '<p>' + (money ? '想象你意外得到 <b>1000 元</b>。请分到下面四个用途，每格50元，合计正好1000元。' :
      '你手里有 <b>100份养分</b>。拖动滑块，把它们分给下面五棵树。合计正好100，“现在的自己”至少1份。') +
      '</p><div class="lg-pool"><span>还剩</span><b id="remaining">' + total + '</b><span>' + (money?'元':'份养分') +
      '</span><div class="lg-pool-bar"><div id="lg-pool-fill"></div></div></div><div id="lg-garden">' +
      order.map(([id,text]) => '<div class="lg-tree-row' + (money?' lg-notree':'') + '">' +
        (money?'':'<div class="lg-tree" data-tree="' + id + '"><span class="lg-tree-icon">🌱</span></div>') +
        '<div class="lg-tree-main"><div class="lg-tree-top"><span class="lg-name">' + escape(text) + '</span><output>0</output></div>' +
        '<input name="' + id + '" aria-label="' + escape(text) + '" type="range" min="0" max="' + total + '" step="' + (money?50:1) + '" value="0"></div></div>').join('') + '</div>';
    const result = await ui.form(money ? '一笔意外的钱' : '今天的花园', html, {
      singleBox:true, submit:'提交',
      validate: values => {
        if (Object.values(values).reduce((sum,n)=>sum+Number(n),0)!==total) return '请分配到合计正好'+total;
        if(!money && Number(values.S)<1)return '现在的自己至少分配1份。';
      },
      onMount: form => {
        start=performance.now();
        const submit=form.querySelector('[type=submit]'); submit.disabled=true;
        const inputs=[...form.querySelectorAll('input[type=range]')];
        const update = () => {
          const sum=inputs.reduce((sum,input)=>sum+Number(input.value),0), remaining=total-sum;
          $('remaining').textContent=remaining;
          $('remaining').className=remaining<0?'lg-over':remaining===0?'lg-done':'';
          $('lg-pool-fill').style.width=Math.max(0,Math.min(100,remaining/total*100))+'%';
          submit.disabled=!(sum===total && (money || Number(inputs.find(input=>input.name==='S').value)>=1));
        };
        inputs.forEach(input=>input.addEventListener('input',()=>{
          input.parentElement.querySelector('output').textContent=input.value;
          input.style.setProperty('--fill',Number(input.value)/total*100+'%');
          const tree=form.querySelector('[data-tree="'+input.name+'"] .lg-tree-icon');
          if(tree){const value=Number(input.value);tree.textContent=value===0?'🌱':value<total/5?'🌿':'🌳';tree.style.transform='scale('+(.8+value/total*1.43)+')';}
          trace.push({ms:Math.round(performance.now()-start),key:input.name,value:Number(input.value)});update();
        }));
        update();
      }
    });
    put(tag, { shares: Object.fromEntries(Object.entries(result.values).map(([k, v]) => [k, Number(v)])),
      trace, order: order.map(item => item[0]), responseMs: result.responseMs });
  }
  async function discount(tag, set) {
    const existing = state.data[tag] || { set, choices: [] };
    state.data[tag] = existing;
    const items = bank.dd[set];
    if(!existing.introShown && !existing.choices.length){
      const intro=await ui.choice('选择题', '<p>接下来是 ' + items.length + ' 道选择题：每一题请选你更想要的一项。没有对错，按你的真实偏好选。都是假设的选择，不涉及真实支付。</p>', ['继续']);
      existing.introShown=true;existing.introResponseMs=intro.responseMs;await checkpoint(tag+'_intro');
    }
    for (let i = existing.choices.length; i < items.length; i++) {
      const item = items[i];
      const result = await ui.choice('你更想要哪一项？',
        '<p class="lg-dd"><b>A：现在得到 ' + item.ss + ' 元</b><br><b>B：' + item.delay + ' 天后得到 ' + item.ll + ' 元</b></p>',
        ['A 现在', 'B 以后']);
      existing.choices.push({ item: i + 1, ...item, ll_chosen: result.choice === 1 ? 1 : 0, rt: result.responseMs });
      await checkpoint(tag + '_' + (i + 1));
    }
  }
  async function assign() {
    if (state.assignment) return;
    if(!retainedFrame)ui.mount('正在准备练习','<p>正在衔接下一段，请稍候。</p>');
    let condition, source;
    if (preview) {
      const forced = query.get('cell');
      const cell = ['RU', 'RD', 'SU', 'SD'].includes(forced) ? forced : core.shuffle(['RU', 'RD', 'SU', 'SD'])[0];
      condition = cfg.BLOCK_ORDER.indexOf(cell); source = 'preview';
    } else {
      if (state.assignmentUncertain) {
        const answer = await ui.choice('分组请求需要确认', '<p>上次网络中断时，服务器可能已发出一个分组号。请联系研究者；也可点击重试，程序会记录可能丢弃的号。</p>', ['重试分组', '退出']);
        if (answer.choice === 1) throw { flowExit: 'stop' };
        event('assignment_retry_after_uncertain');
      }
      state.assignmentUncertain = true; await checkpoint('before_assignment');
      const result = await storage.request('condition', { experimentID: cfg.DATAPIPE_ID });
      condition = result.condition; source = 'datapipe';
      if (!Number.isInteger(condition) || condition < 0 || condition >= 8) throw Error('DataPipe应配置8个条件，返回值须为0—7。');
    }
    state.assignment = { cell: cfg.BLOCK_ORDER[condition], condition, source, atISO: now(), blockOrder: cfg.BLOCK_ORDER.slice() };
    state.assignmentUncertain = false;
    event('assigned', state.assignment);
    await checkpoint('assignment');
  }
  function playerParameters() {
    const birth = state.data.screen;
    const baseline = state.data.baseline?.values || {};
    const parameters={ birthYear: birth.year, expectancy: Number(baseline.sle), nowYear: new Date().getFullYear(),
      endAge: Number(baseline.sle), horizonYears: birth.year + Number(baseline.sle) - new Date().getFullYear(),
      yearMap: core.stationMap(birth.year, Number(baseline.sle)) };
    state.data.displayParameters=parameters;return parameters;
  }
  async function play(common = false) {
    const group = common ? 'common' : state.assignment.cell[0];
    if (state.videoInterrupted) {
      const answer = await ui.choice('练习播放曾中断', '<p>上次关闭页面时练习尚未结束。为避免重复播放改变体验，你可以退出练习，选择继续答后面的题，或直接结束。</p>',
        ['退出练习，继续答几题', '直接结束']);
      throw { flowExit: answer.choice === 0 ? 'stop_answer' : 'stop' };
    }
    state.videoInterrupted = true; await checkpoint('before_video');
    const reuse=!common&&retainedFrame&&retainedFrame.isConnected;
    if(!reuse)ui.main.innerHTML = '<iframe id="practiceFrame" title="互动练习" allow="autoplay" src="player/' + group + '.html?embedded=1&build=20261108-playfix1"></iframe>';
    playerFrame = reuse?retainedFrame:$('practiceFrame');retainedFrame=null;playerNonce=uuid();
    return new Promise((resolve, reject) => {
      let closed = false;
      const cleanup = () => {
        closed = true; window.removeEventListener('message', listener);
        if(!common||!retainedFrame)ui.main.classList.remove('video-active'); playerFrame = null; playerNonce = null;
      };
      const complete = async payload => {
        if (closed) return;
        const tag = common ? 'common_delivery' : 'path_delivery';
        put(tag, payload); state.videoInterrupted = false;
        event('practice_delivery_finished', { common, group, responseCount: payload.responses?.length || 0 });
        if(common)retainedFrame=playerFrame;
        cleanup();if(!common)ui.main.innerHTML='<p>正在继续……</p>';resolve();
      };
      const listener = e => {
        if (!playerFrame || e.source !== playerFrame.contentWindow) return;
        const expected = location.protocol === 'file:' ? 'null' : location.origin;
        if (e.origin !== expected || e.data?.channel !== 'LG2_PLAYER') return;
        if (e.data.type === 'ready') {
          playerFrame.contentWindow.postMessage({ channel: 'LG2_PARENT', type: 'configure', nonce: playerNonce,
            group, parameters: playerParameters(), timeoutPolicy: cfg.BACKGROUND_WAIT_POLICY,
            timeoutPolicyApproved: cfg.BACKGROUND_POLICY_APPROVED }, location.protocol === 'file:' ? '*' : location.origin);
          return;
        }
        if (e.data.nonce !== playerNonce) return;
        const payload = e.data.payload;
        if (e.data.type === 'checkpoint') {
          state.data[common ? 'common_partial' : 'path_partial'] = payload;
          checkpoint('video_progress').catch(error => { $('saveStatus').textContent = '本地保存出现问题，请退出并联系研究者。'; console.error(error); });
        } else if (e.data.type === 'complete') complete(payload);
        else if(e.data.type==='exit_finalized'){
          state.data[common?'common_partial':'path_partial']=payload;ui.playerCancel(payload.reason);
        }
        else if (e.data.type === 'exit') {
          state.data[common ? 'common_partial' : 'path_partial'] = payload;
          requestExit();
        } else if (e.data.type === 'response') event('station_answer', payload);
      };
      window.addEventListener('message', listener);
      ui.main.classList.add('video-active');
      // Use the shared cancellation hook without replacing the iframe.
      ui.playerCancel = reason => { cleanup(); reject({ flowExit: reason }); };
      if(reuse)playerFrame.contentWindow.postMessage({channel:'LG2_PARENT',type:'continue_route',nonce:playerNonce,group,parameters:playerParameters(),mediaConfig:window.LG2_MEDIA_CONFIGS[group],timeoutPolicy:cfg.BACKGROUND_WAIT_POLICY,timeoutPolicyApproved:cfg.BACKGROUND_POLICY_APPROVED},location.protocol==='file:'?'*':location.origin);
    });
  }
  async function safety(tag) {
    const values = state.data[tag]?.values || {}, pre = state.data.emotion_pre?.values || {};
    const free = state.data[tag]?.free?.free;
    const contact = Number(values.e_unease) >= 8 || free?.safetyKeyword;
    const checkin = Number(values.e_sad) - Number(pre.e_sad) >= 3;
    state.data.safety ||= {};
    state.data.safety[tag] = { contact, checkin, atISO: now() };
    // Match the existing experiment2 ordering: flag after A, show support after primary B outcomes.
    if(tag==='emotion_A')return;
    const prior=state.data.safety.emotion_A||{};
    if (!contact && !checkin && !prior.contact && !prior.checkin) return;
    const response = await ui.form('谢谢你的回答', '<p>' + escape(cfg.RESOURCE_CARD) + '</p>' +
      (contact||prior.contact ? '<p>如果你愿意研究者联系你，可以自愿留下联系方式。将单独保存。</p>' + field('contact', '联系方式（可不填）', 'textarea') : '<p>研究者会按研究安排，通过平台问候你。</p>'));
    const value = String(response.values.contact || '').trim();
    if (value) await savePrivate('safety_contact', { contact: value, reason: tag });
  }
  async function savePrivate(tag, payload) {
    const filename = 'E2_private_' + state.id + '_' + tag + '_' + uuid() + '.json';
    await storage.queue({ sessionKey: state.key, kind: 'data',
      experimentID: cfg.CONTACT_DATAPIPE_ID || cfg.DATAPIPE_ID, filename, testData:preview,
      data: JSON.stringify({ testData:preview, sessionId: state.id, participantId: state.pid, tag, atISO: now(), ...payload }) });
    state.data.privateRequests ||= [];
    state.data.privateRequests.push({ tag, filename, atISO: now() });
    if (!preview) storage.flush(state.key);
  }
  let exitDialogOpen=false;
  async function requestExit() {
    if (!state || saving || exitDialogOpen || !activeStage()) return;
    exitDialogOpen=true;
    if (playerFrame) playerFrame.contentWindow.postMessage({ channel: 'LG2_PARENT', type: 'pause', nonce: playerNonce }, location.protocol === 'file:' ? '*' : location.origin);
    const choice = await ui.dialog('退出练习或研究', '你可以随时退出，报酬按招募说明发放。',
      (state.assignment || state.plan[state.cursor]==='common') ? ['退出练习，继续答几题', '直接结束研究', '返回当前页面'] : ['直接结束研究', '返回当前页面']);
    exitDialogOpen=false;
    const canAnswer=!!state.assignment||state.plan[state.cursor]==='common';
    const returning = canAnswer ? choice === 2 : choice === 1;
    if (returning) return;
    const reason = canAnswer && choice === 0 ? 'stop_answer' : 'stop';
    if (recordingCleanup) await recordingCleanup();
    if (playerFrame && ui.playerCancel){
      const frame=playerFrame;frame.contentWindow.postMessage({channel:'LG2_PARENT',type:'finalize_exit',nonce:playerNonce,reason},location.protocol==='file:'?'*':location.origin);
      setTimeout(()=>{if(playerFrame===frame&&ui.playerCancel)ui.playerCancel(reason);},1500);
    }else ui.abort(reason);
  }
  function activeStage() { return !['ending', 'done'].includes(state.plan[state.cursor]); }
  $('withdraw').onclick = requestExit;
  const stages = {};
  stages.consent = async () => {
    const result = await ui.form('生命花园 · 互动练习', '<p>你将想象自己生命的最后一天，观看一段互动视频，然后回答感受与选择题。整个实验约35分钟，以试测结果为准。</p>' +
      '<p>这项研究比较几种练习安排，结束时会说明各版本。想象可能引起忧伤或不安，你可以随时暂停、退出，' + escape(cfg.COMPENSATION_TEXT) + '</p>' +
      '<p>研究单位：' + escape(cfg.INSTITUTION) + '<br>联系：' + escape(cfg.CONTACT_EMAIL || '演练配置，联系信息待研究者补齐') +
      '<br>伦理批件：' + escape(cfg.ETHICS_NO || '待补齐') + '</p><p>' + escape(cfg.STORAGE_NOTICE) +
      ' 自由文字只在你同意时保存原文，否则仅保存字数、用时及必要的安全标记。联系方式会与作答单独存文件。</p>' +
      '<p>录音是可选的，只有点击录音按钮并允许麦克风后才开始。语音只由研究人员收听，转为文字并去掉可识别信息后分析；原始录音在研究结束后12个月内删除，去标识数据按学校规定保存5年。你可以通过招募平台或联系邮箱申请撤回尚未汇入公开结果的数据。</p>' +
      '<label class="lg-radio"><input type="checkbox" name="agree" value="1" required>我已年满18岁，读过说明并自愿参加。</label>' +
      '<details><summary>研究介绍书与联系方式</summary>'+window.LG2_CONSENT_DOCUMENT(cfg,preview)+'</details>'+
      field('ai_ok', '是否同意保存去标识文字，由人工智能辅助整理？', 'radio', { values: [{ value: '1', text: '同意' }, { value: '0', text: '不同意，只记字数和用时' }] }) +
      field('recording_ok', '是否同意在可选回答中使用录音？', 'radio', { values: [{ value: '1', text: '同意，我仍可选择打字或跳过' }, { value: '0', text: '不同意录音' }] }));
    put('consent', result.values);
  };
  stages.screen = async () => {
    const noYes = [{ value: 0, text: '否' }, { value: 1, text: '是' }];
    const result = await ui.form('几个问题',
      field('birth_ym', '出生年月（六位，如199005）', 'text', { inputmode: 'numeric', maxlength: 6, pattern: '[0-9]{6}' }) +
      field('bereave', '过去6个月，是否有至亲去世？', 'radio', { values: noYes }) +
      field('illness', '过去12个月，本人是否被诊断出危及生命的疾病？', 'radio', { values: noYes }) +
      field('treat', '目前是否在接受精神科药物治疗、心理治疗或危机干预？', 'radio', { values: noYes }) +
      field('prior', '之前是否参加过生命花园研究或其预实验？', 'radio', { values: noYes }) +
      field('employ', '目前工作状态', 'radio', { values: [{ value: 1, text: '全职在职' }, { value: 2, text: '稳定兼职' }, { value: 3, text: '已退休（包括退休后返聘）' }, { value: 0, text: '不在职' }] }),
      { validate: values => { try { core.ageAt(values.birth_ym); } catch (error) { return error.message; } } });
    const birth = core.ageAt(result.values.birth_ym);
    delete result.values.birth_ym;
    put('screen', { ...birth, ...result.values, responseMs: result.responseMs });
  };
  stages.phq = async () => {
    const result = numeric(await ui.form('过去两周，你有多少天受到以下问题困扰？', bank.phq.map((text, i) =>
      field('phq' + (i + 1), (i + 1) + '. ' + text, 'radio', { values: [
        { value: 0, text: '完全没有' }, { value: 1, text: '有几天' }, { value: 2, text: '一半以上的天数' }, { value: 3, text: '几乎每天' }
      ] })).join('')));
    put('phq9', result);
    put('eligibility', core.eligibility(state.data.screen, result.values));
    if (!state.data.eligibility.eligible) {
      state.screenedOut = true; state.plan = ['ineligible', 'ending']; state.cursor = -1;
    }
  };
  stages.ineligible = () => ui.choice('谢谢你的参与', '<p>按本研究的参加条件，本次研究在这里结束。筛查结果仅用于研究资格判断。</p><p>' + escape(cfg.RESOURCE_CARD) + '</p>', ['结束']);
  stages.baseline = async () => {
    const result = await ui.form('基本信息',
      field('sex', '性别', 'radio', { values: ['男', '女', '其他／不愿透露'] }) +
      field('occupation', '职业类别', 'radio', { values: ['企业职员／管理', '专业技术人员', '服务业／销售', '一线操作／物流／快递', '机关事业单位', '自由职业／创业', '其他'] }) +
      field('first_work_year', '首次全职工作的年份', 'select', {values:Array.from({length:new Date().getFullYear()-state.data.screen.year-13},(_,i)=>state.data.screen.year+14+i)}) +
      field('sle', '你觉得自己大概能活到多少岁？', 'number', { min: 40, max: 120, step: 1 }) +
      field('ret_age', '你预计自己大约几岁退休？', 'number', { min: 40, max: 100, step: 1 }) +
      field('fsc1', '五年后的我和现在的我，本质上是同一个人', 'likert', { low: '完全不同意', high: '完全同意' }) +
      field('fsc2', '我能清楚地想象五年后的自己', 'likert', { low: '完全不同意', high: '完全同意' }) +
      field('unpred', '未来一年，我的工作和生活会怎么样，很难预料', 'likert') +
      field('ctrl', '未来一年的生活会怎么样，我有很大的掌控力', 'likert') +
      field('viv1', '闭上眼睛想一个熟悉的地方时，画面有多清楚？', 'likert', { max: 5, low: '完全没有画面', high: '像亲眼看到一样' }) +
      field('viv2', '想象一段熟悉的声音时，有多清楚？', 'likert', { max: 5, low: '完全听不到', high: '像真的在耳边' }),
      { validate: values => Number(values.sle) <= state.data.screen.age ? '主观预期寿命请填写比当前年龄大的数值。' : '' });
    put('baseline', result);
  };
  stages.people = async () => {
    put('people', await ui.form('三位重要的人', '<p>请填写称呼或化名，尽量不要填写真实姓名。后面的练习会用到这些称呼。</p>' +
      [1, 2, 3].map(i => field('p' + i, '第' + i + '位重要的人的称呼', 'text', { maxlength: 30 }) +
        field('p' + i + '_rel', '你们的关系', 'select', { values: ['家人', '伴侣', '朋友', '同事', '其他'] })).join('')));
  };
  stages.garden_pre = () => allocator('garden_pre');
  stages.dd_pre = () => discount('dd_pre', state.design.ddOrder[0]);
  stages.emotion_pre = () => emotion('emotion_pre');
  stages.soundcheck = async () => {
    await ui.form('试听', '<p>请点击播放，确认能听清声音。未能播放时请检查设备静音开关或换浏览器。</p><audio controls src="player/media/soundcheck.mp3" preload="metadata"></audio><label class="lg-radio"><input name="sound_ok" type="checkbox" required value="1">我能听清声音</label>');
    put('soundcheck',{confirmed:true});
  };
  stages.prepare = async () => {
    const answer = await ui.choice('一段互动练习', '<p>请找一个安静、不会被打扰的地方，打开声音。画面和配音会继续播放，中间三处会停下来请你选择。</p>' +
      '<p>选择用来记录你注意到了什么，后面的内容按原顺序继续。</p><p>你可以随时暂停或退出。' + escape(cfg.COMPENSATION_TEXT) + '</p>',
      ['开始练习', '我不想参与了，退出研究']);
    if (answer.choice === 1) throw { flowExit: 'stop' };
  };
  stages.common = () => play(true);
  stages.assignment = assign;
  stages.path = () => play(false);
  stages.emotion_A = () => emotion('emotion_A');
  stages.process = async () => {
    put('process', await ui.form('关于刚才的画面',
      field('path_img', '刚才观看的时候，你脑中更接近哪一种情况？', 'radio', { values: [
        { value: 'scene', text: '出现了比较完整的生活场景' }, { value: 'fragments', text: '出现了一些零散的人、地方或东西' },
        { value: 'words', text: '主要是文字或想法，没有明显画面' }, { value: 'none', text: '基本没有出现具体内容' }
      ] }) + field('path_own', '刚才出现的内容，多大程度上像是你自己的生活？', 'scale', { low: '完全不像', high: '非常像' })));
  };
  stages.safety_A = () => safety('emotion_A');
  stages.relation_intro = () => ui.choice('三位重要的人', '<p>接下来每页会出现一位你写下的重要的人。你可以想一想，写几个字、录音，也可以跳过。</p>', ['继续']);
  for (let i = 1; i <= 3; i++) {
    stages['relation_' + i] = async () => {
      const name = state.data.people.values['p' + i];
      const unfinished = state.assignment.cell[1] === 'U';
      const sentence = unfinished ? '有一件事，你最想和TA一起做，还没有做。是什么？' : '有一件事，你和TA一起做过，印象很深。是什么？';
      const result = await textResponse('三位重要的人 · ' + i + '/3', '<b>' + escape(name) + '。</b>' + sentence, 'relation_' + i);
      put('relation_' + i, { ...result, condition: unfinished ? 'U' : 'D', person: 'P' + i, prompt: sentence });
    };
  }
  stages.post_first = async () => {
    if (state.design.postOrder === 'garden_first') await allocator('garden_post');
    else await discount('dd_post', state.design.ddOrder[1]);
  };
  stages.post_second = async () => {
    if (state.design.postOrder === 'garden_first') await discount('dd_post', state.design.ddOrder[1]);
    else await allocator('garden_post');
  };
  stages.garden_post = () => allocator('garden_post');
  stages.dd_post = () => discount('dd_post', state.design.ddOrder[1]);
  stages.emotion_B = () => emotion('emotion_B', true);
  stages.safety_B = () => safety('emotion_B');
  stages.money = () => allocator('money_post', true);
  stages.ratings = async () => {
    put('ratings', await ui.form('关于刚才的互动练习',
      field('mr_present', '练习中，我感觉自己真的身处那一天', 'scale', { low: '完全不符合', high: '完全符合' }) +
      field('mr_clear_today', '练习结束时，我对自己今天的生活看得更清楚了', 'scale', { low: '完全不符合', high: '完全符合' }) +
      field('mr_distance', '那一天离现在，感觉有多远', 'scale', { low: '很近', high: '很远' }) +
      field('engage', '你有多投入', 'scale') +
      field('sloppy', '刚才更像是在走过场，而不是认真去想', 'scale', { low: '完全不是', high: '完全是' }) +
      field('tp_ten', '此刻，“十年”在你感觉里有多长？（1—100）', 'number', { min: 1, max: 100, step: 1 }) +
      field('tp_pass', '此刻你觉得时间流逝得有多快', 'scale', { low: '慢', high: '快' })));
  };
  stages.premises = async () => {
    const items = [
      ['p_scar1', '此刻，我觉得自己剩下的时间不多了'], ['p_scar2', '此刻，我觉得时间很紧、来不及做想做的事'],
      ['p_unpred', '此刻，我觉得人生中的事情很难预料'], ['p_inev', '此刻，我清楚地意识到生命终有尽头'],
      ['fsc1_post', '五年后的我和现在的我，本质上是同一个人'], ['fsc2_post', '我能清楚地想象五年后的自己']
    ];
    put('premises', await ui.form('此刻你的感觉', items.map(([key, text]) => field(key, text, 'likert',
      key.startsWith('fsc') ? { low: '完全不同意', high: '完全同意' } : {})).join('')));
  };
  stages.angles = async () => {
    put('angles', await ui.form('练习中的体验',
      field('ang_concrete', '练习里的那一天，在你脑中有多具体？', 'scale', { low: '很模糊', high: '很具体' }) +
      field('ang_form', '练习里，你的死亡更像是：', 'scale', { low: '随时可能发生的事', high: '有确定日子的事' }) +
      field('ang_value', '想到那一天，你感到的更多是：', 'scale', { low: '威胁', high: '意义' }) +
      field('ang_whom', '想到那一天时，你想得更多的是：', 'scale', { low: '自己', high: '在乎的人' })));
  };
  stages.manipulation = async () => {
    put('manipulation', await ui.form('关于刚才的安排',
      field('mc_path2', '来到那一天之后，你做的是：', 'radio', { values: ['一年一年走回今天', '一直留在那一天', '说不清'] }) +
      field('mc_rel', '想到那三个人时，你想的是：', 'radio', { values: ['还没一起做的事', '一起做过的事', '说不清'] }) +
      field('mc_death', '练习中，你在多大程度上想到了自己的死亡', 'scale', { low: '完全没有', high: '想了很多' })));
  };
  stages.free_choice = async () => {
    const result = await ui.choice('最后几分钟（可选）', '<p>今天的题目已经做完。下面怎么选都不影响报酬。</p>',
      ['给一位重要的人写几句话', '给五年后的自己写几句话', '不写了']);
    put('free_choice', { choice: ['person', 'future', 'skip'][result.choice], responseMs: result.responseMs });
  };
  stages.free_write = async () => {
    if (state.data.free_choice.choice === 'skip') return;
    const isPerson = state.data.free_choice.choice === 'person';
    const recipient = isPerson ? field('to','写给谁','select',{values:[1,2,3].map(i=>({value:'P'+i,text:state.data.people.values['p'+i]}))}) : '';
    const result = await textResponse('写几句话', isPerson ? '写下想对一位重要的人说的话。' : '写给五年后的自己。', 'free_write', true, recipient);
    if(isPerson){put('free_recipient',{to:result.values.to});delete result.values.to;}
    transient.letter = ui.main.querySelector('textarea')?.value || '';
    put('free_write', result);
  };
  stages.rel_type = async () => {
    put('rel_type', await ui.form('一个描述题', field('rel_type', '刚才想到和TA有关的那件事，更像是：', 'radio',
      { values: [{ value: 'say', text: '说一句话' }, { value: 'ask', text: '问一个问题' }, { value: 'do', text: '一起做一件事' }, { value: 'none', text: '都不是' }] })));
  };
  stages.purpose = async () => put('purpose', await textResponse('最后一个问题', '你觉得这项研究想了解什么？', 'purpose'));
  stages.hook = async () => {
    const letter = transient.letter || state.data.free_write?.free?.text || '';
    if (!letter.trim()) return;
    const choices = ['自己复制保存／发送', '先不发'];
    if (cfg.ENABLE_WORKSTATION_REQUEST && state.data.free_choice.choice === 'person') choices.push('请工作站代发短信');
    const result = await ui.choice('要不要把刚才的话留下来？',
      '<p>可以复制后用自己的方式保存或发送。这里记录复制是否成功、之后是否离开页面及离开多久，不能看见你实际发给谁或发送的内容。</p>',
      choices);
    put('hook', { choice: choices[result.choice], copied: false, copyOK: null, awayMs: 0 });
    if (result.choice === 0) {
      try { await navigator.clipboard.writeText(letter); state.data.hook.copyOK = true; }
      catch { state.data.hook.copyOK = false; }
      state.data.hook.copied = true; state.data.hook.copyAt = now();
      let away = null;
      const visibility = () => {
        if (document.hidden) { away = performance.now(); state.data.hook.leftPage = true; }
        else if (away !== null) { state.data.hook.awayMs += Math.round(performance.now() - away); away = null; }
      };
      document.addEventListener('visibilitychange', visibility);
      await ui.choice('你写下的话', '<p>' + (state.data.hook.copyOK ? '已复制。你可以自行保存或发送。' : '未能自动复制，可长按下面的文字复制。') +
        '</p><div class="letter">' + escape(letter) + '</div>', ['继续']);
      if (away !== null) state.data.hook.awayMs += Math.round(performance.now() - away);
      document.removeEventListener('visibilitychange', visibility);
    } else if (result.choice === 2) {
      const request = await ui.form('代发申请（自愿）', '<p>填写收件人号码表示同意研究工作站按你的请求发送这段话。此处只登记申请，不会自动发短信；是否已发送由工作站后续记录。号码、署名和正文仅用于本次代发，与作答分开保存，发送后7天内删除。工作站需人工审核；预跑申请仅留本机，不会发送。</p>' +
        field('signature', '发送署名', 'text', {maxlength:50}) +
        field('recipient', '收件人手机号', 'tel', { pattern: '[0-9+ -]{6,30}', maxlength: 30 }) +
        '<label><input type="checkbox" name="authorize" value="1" required>我确认已考虑收件人的意愿，同意工作站代发这段话。</label>');
      state.data.hook.workstationRequested=true;state.data.hook.deliveryStatus=preview?'test_only_not_sent':'requested_not_sent';
      await savePrivate('sms_request', { recipient: request.values.recipient, signature: request.values.signature, message: letter, authorization: true, authorizedAt:now(), status: preview?'test_only_not_sent':'requested_not_sent' });
    }
    transient.letter = '';
  };
  stages.debrief = () => ui.choice('完成了，谢谢你', '<p>刚才是一次想象练习。研究比较从生命终点回望与停留，以及想还没一起做的事与已经做过的事，对此刻感受和选择的影响。</p>' +
    '<p>' + escape(cfg.RESOURCE_CARD) + '</p>', ['保存并结束']);
  stages.ending = async () => {
    const status = state.screenedOut ? 'screened_out' : state.withdrawal ? state.withdrawal.type : 'completed';
    state.completion ||= { atISO: now(), code: completionCode(status), status };
    const expected = status === 'completed' ? /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/ : /^LG0-[0-9]{6}$/;
    if (!expected.test(state.completion.code)) {
      state.completion.legacyCode = state.completion.code;
      state.completion.code = completionCode(status);
      event('completion_code_format_updated', { status });
    }
    await checkpoint('final');
    $('withdraw').disabled = true;
    const show = async () => {
      const result = preview ? { pending: 0 } : await storage.flush(state.key);
      ui.mount('谢谢你的参与', '<p>' + (preview ? '本地演练完成，数据未上传。' : result.pending ? '作答已保存在本机，仍有文件等待上传。请重试或联系研究者。' : '作答已保存。') +
        '</p><p>完成码 <b class="code">' + escape(state.completion.code) + '</b></p><p>' + escape(cfg.COMPENSATION_TEXT) +
        '</p><p>请回到' + escape(cfg.PLATFORM === 'naodao' ? '脑岛' : cfg.PLATFORM === 'offline' ? '研究者处' : '招募平台') + '填写或提交完成码。</p>' +
        '<p>' + escape(cfg.RESOURCE_CARD) + '</p><div id="finishActions" class="stack"></div>');
      if (preview) {
        const restart=document.createElement('button');restart.textContent='重新预跑（从头开始）';restart.id='restartPrerun';
        restart.onclick=()=>{const url=new URL(location.href);url.searchParams.set('new','1');location.assign(url);};
        $('finishActions').append(restart);
      }
      if (preview || result.pending) {
        const exportButton = document.createElement('button'); exportButton.textContent = '保存本次作答副本';
        exportButton.onclick = async () => ui.download({ ...snapshot(), pendingFiles: (await storage.all('queue')).filter(q => q.sessionKey === state.key) }, 'LG2_' + state.id + '.json');
        $('finishActions').append(exportButton);
      }
      if (result.pending) {
        const retry = document.createElement('button'); retry.textContent = '重试上传'; retry.onclick = show; $('finishActions').append(retry);
      } else if (!preview && cfg.COMPLETION_URLS[cfg.PLATFORM]) {
        const link = document.createElement('a'); link.textContent = '返回招募平台';
        const target = new URL(cfg.COMPLETION_URLS[cfg.PLATFORM]);
        if (target.protocol === 'https:') { target.searchParams.set('code', state.completion.code); link.href = target; $('finishActions').append(link); }
      }
    };
    await show();
  };
  const fullPlan = [
    'consent', 'screen', 'phq', 'baseline', 'people', 'garden_pre', 'dd_pre', 'emotion_pre',
    'soundcheck', 'prepare', 'common', 'assignment', 'path', 'emotion_A', 'process', 'safety_A', 'relation_intro',
    'relation_1', 'relation_2', 'relation_3', 'post_first', 'post_second', 'emotion_B', 'safety_B',
    'money', 'ratings', 'premises', 'angles', 'manipulation', 'free_choice', 'free_write', 'rel_type',
    'purpose', 'hook', 'debrief', 'ending'
  ];
  async function run() {
    while (state.cursor < state.plan.length) {
      const tag = state.plan[state.cursor];
      if (!stages[tag]) throw Error('未知步骤 ' + tag);
      $('stepLabel').textContent = preview ? '本地演练 · ' + tag : '生命花园 · 互动练习';
      $('withdraw').disabled = tag === 'ending';
      event('stage_enter');
      try {
        await stages[tag]();
        if (tag === 'ending') return;
        event('stage_complete');
        state.cursor++;
        await checkpoint(tag);
      } catch (error) {
        if (!error?.flowExit) throw error;
        event('withdrawal', { type: error.flowExit, assignment: state.assignment?.cell || null });
        state.withdrawal = { type: error.flowExit, stage: tag, atISO: now() };
        state.videoInterrupted = false;
        const early = !state.data.garden_pre;
        state.plan = error.flowExit === 'stop_answer' && !early ?
          [...(state.data.emotion_A ? [] : ['emotion_A', 'process', 'safety_A']),
            ...(state.data.garden_post ? [] : ['garden_post']), ...(state.data.dd_post ? [] : ['dd_post']),
            ...(state.data.emotion_B ? [] : ['emotion_B', 'safety_B']), 'debrief', 'ending'] : ['ending'];
        state.cursor = 0;
        await checkpoint('withdrawal');
      }
    }
  }
  function releaseMissing() {
    const missing = [];
    if (!cfg.RELEASE_READY) missing.push('正式发布开关');
    if (!cfg.DATAPIPE_ID) missing.push('实验2 DataPipe ID');
    if (cfg.CONDITION_COUNT !== 8 || cfg.BLOCK_ORDER.length !== 8) missing.push('8条件分组配置');
    if (!cfg.CONTACT_EMAIL) missing.push('研究者联系邮箱');
    if (!cfg.ETHICS_NO || !cfg.CONSENT_APPROVED) missing.push('正式伦理批件与知情同意书确认');
    if (!cfg.MEDIA_TEXT_REVIEWED) missing.push('最终材料与时间核准');
    if (cfg.BACKGROUND_WAIT_POLICY === 'unconfirmed' || !cfg.BACKGROUND_POLICY_APPROVED) missing.push('后台选择计时规则');
    if (!window.isSecureContext || location.protocol === 'file:') missing.push('HTTPS正式网址');
    return missing;
  }
  try {
    await storage.open();
    if (!preview && releaseMissing().length) {
      ui.mount('研究入口准备中', '<p>这个入口尚未开放正式参加。请联系研究者。</p><details><summary>部署配置检查</summary><p>' +
        escape(releaseMissing().join('、')) + '</p></details><a href="index.html?mode=preview">研究者本地演练</a>');
      $('withdraw').disabled = true;
      return;
    }
    if (preview) {
      $('previewBadge').hidden = false;
      // Preview does not silently approve the undecided production rule.
      cfg.BACKGROUND_WAIT_POLICY = cfg.BACKGROUND_WAIT_POLICY === 'unconfirmed' ? 'foreground_active' : cfg.BACKGROUND_WAIT_POLICY;
    }
    let pid = cfg.PID_PARAMS.map(key => query.get(key)).find(Boolean);
    // A bare link is the offline recruitment entrance; explicit platform links still require their ID.
    if (!preview && !pid && !query.has('platform')) cfg.PLATFORM = 'offline';
    if (!preview && !pid && cfg.PLATFORM === 'offline') {
      const offlineKey = 'LG2_offline_pid_' + cfg.PHASE;
      const previous = localStorage.getItem(offlineKey) || '';
      await ui.form('参加互动练习',
        '<p>欢迎参加。点击下方按钮开始互动练习。</p>' +
        '<p><a href="index.html?mode=preview&v=20261108-retry1">研究者演练（不上传、不占分组号）</a></p>',
        { submit: '开始参加' });
      pid = previous || 'OFFLINE-' + uuid();
      localStorage.setItem(offlineKey, pid);
    }
    if (!preview && !pid) {
      ui.mount('请从招募平台进入', '<p>链接中未收到参与者编号。通过脑岛或见数参加，请回到招募平台重新进入。</p><p>如果你是线下招募的参加者，请使用下方入口。</p><p><a href="index.html?platform=offline&v=20261108-retry1">线下参加入口</a></p><p><a href="index.html?mode=preview&v=20261108-retry1">研究者演练（不上传、不占号）</a></p>');
      return;
    }
    let pointer = preview ? 'LG2_preview_session' : 'LG2_session_' + cfg.PHASE + '_' + await core.hash(pid);
    if (preview && !pid) pid = 'preview-' + uuid();
    if(!String(pid).trim()||String(pid).length>200)throw Error('参与者编号格式不正确');
    const identityHash = await core.hash(String(pid));
    if (!preview && (cfg.EXCLUDED_PARTICIPANT_HASHES.includes(identityHash) || cfg.PREVIOUS_PHASE_HASHES.includes(identityHash))) {
      ui.mount('谢谢你的参与', '<p>本次研究的参加名单与前次研究或阶段不重叠，请通过招募平台联系研究者。</p>');
      return;
    }
    if(navigator.locks){
      const granted=await new Promise(resolve=>{navigator.locks.request(pointer,{ifAvailable:true},lock=>{resolve(!!lock);return lock?new Promise(()=>{}):undefined;}).catch(()=>resolve(false));});
      if(!granted){ui.mount('另一页正在作答','<p>请回到已打开的页面继续，关闭那一页后再重试。</p>');return;}
    }else if(!preview){throw Error('当前浏览器无法保证单页作答，请使用近期版本Safari或Chrome。');}
    let sessionKey = localStorage.getItem(pointer);
    if (query.get('new') === '1' && preview){sessionKey=null;const url=new URL(location.href);url.searchParams.delete('new');history.replaceState(null,'',url);}
    state = sessionKey ? await storage.read('states', sessionKey) : null;
    if (state && !preview && state.pid !== pid) throw Error('本机作答编号不一致，请联系研究者。');
    let retryOf = null;
    if (state && (state.screenedOut || state.data?.eligibility?.eligible === false)) {
      const answer = await ui.choice('上次作答已结束',
        '<p>上次作答因筛查条件结束。如果刚才误选，可以重新填写；请按真实情况回答，新一轮仍会经过完整筛查。</p>',
        ['刚才误选，重新填写', '查看上次结束页']);
      if (answer.choice === 0) {
        retryOf = state.id;
        state = null;
      } else { await stages.ending(); return; }
    }
    if (preview && state && (state.completion || state.version !== cfg.VERSION)) {
      const answer = await ui.choice('重新预跑', '<p>上次预跑已经结束，或使用了旧版本。可以从头再跑，重新填写筛查；旧记录保留，不上传。</p>', ['开始新一轮预跑', '保留记录，暂不开始']);
      if(answer.choice === 1)return;
      state = null;
    }
    if (state && state.version !== cfg.VERSION) throw Error('本次作答使用了不同版本，请联系研究者后处理，避免混用材料。');
    if (state && !state.completion) {
      const answer = await ui.choice('发现未完成的作答', '<p>可以继续上次尚未完成的页面。练习中关闭页面会记录中断，不会静默从头重播。</p>',
        preview ? ['继续上次作答', '开始新的本地演练'] : ['继续上次作答']);
      if (preview && answer.choice === 1) state = null;
    }
    if (!state) {
      const id = uuid();
      state = {
        key: 'E2-' + id, id, pid, version: cfg.VERSION, phase: preview ? 'PRERUN' : cfg.PHASE,
        startedAt: now(), cursor: 0, sequence: 0, plan: fullPlan.slice(), data: {}, events: [],
        design: {
          ddOrder: core.shuffle(['A', 'B']), postOrder: core.shuffle(['garden_first', 'dd_first'])[0],
          emotionOrder: { panas: core.shuffle(bank.panas.map(item => item[0])), singles: core.shuffle(bank.singles.map(item => item[0])) }
        }
      };
      if (retryOf) event('screening_retry_started', { previousSessionId: retryOf });
      localStorage.setItem(pointer, state.key);
      await checkpoint('initialized');
    }
    window.LG2_REVIEW = preview ? {
      get state() { return state; },
      get snapshot() { return snapshot(); }

    } : undefined;
    if (state.completion) { await stages.ending(); return; }
    if (!preview) storage.flush(state.key);
    window.addEventListener('online', () => { if (!preview) storage.flush(state.key); });
    let hiddenAt = null;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { hiddenAt = performance.now(); event('background_enter'); }
      else {
        event('background_return', { durationMs: hiddenAt === null ? null : Math.round(performance.now() - hiddenAt) });
        hiddenAt = null;
      }
    });
    await run();
  } catch (error) {
    console.error(error);ui.main.classList.remove('video-active');retainedFrame=null;
    if (recordingCleanup) await recordingCleanup();
    ui.mount('暂时无法继续', '<p>' + escape(error.message || String(error)) + '</p>' +
      '<p>已经保存的作答会保留。请重试，或通过招募平台联系研究者。</p><button id="retryApp">重新打开本页</button>');
    $('retryApp').onclick = () => location.reload();
  }
};
