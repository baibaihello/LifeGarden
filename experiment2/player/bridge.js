(() => {
  const expectedOrigin = location.protocol === 'file:' ? 'null' : location.origin;
  let nonce = null, parameters = null, initialized = false, completed = false;
  let shownYear = null;
  function payload() {
    return {
      mediaVersion: config.version, interactionVersion: config.interactionVersion,
      responses: typeof responses === 'undefined' ? [] : JSON.parse(JSON.stringify(responses)),
      events: JSON.parse(JSON.stringify(events)), part, audioSeconds: audio.currentTime, phase,
      analysisUse: 'stations2and3_descriptive_only',
      timeoutPolicy: config.backgroundWaitPolicy, timeoutPolicyApproved: !!config.timeoutPolicyApproved
    };
  }
  function send(type, data = payload()) {
    if (!nonce) return;
    parent.postMessage({ channel: 'LG2_PLAYER', type, nonce, payload: data }, expectedOrigin === 'null' ? '*' : expectedOrigin);
  }
  const originalFinish=finish;
  finish=function(){originalFinish();if(config.group==='common'){$('intro').hidden=true;status('正在衔接下一段，请稍候。');}};
  const originalRecord = record;
  record = function (type, details = {}) {
    if (type === 'sample_start') details = { ...details, timeoutPolicyApproved: !!config.timeoutPolicyApproved };
    originalRecord(type, details);
    if (type === 'choice_clicked' || type === 'choice_timeout') send('response', details.response || details);
    if (type === 'sample_complete' && !completed) {
      completed = true; stop(); room.pause(); send('complete');
    }
    if (['options_shown', 'choice_clicked', 'choice_timeout', 'audio_playing', 'background_pause', 'manual_pause'].includes(type)) send('checkpoint');
  };
  const originalCaption = updateCaption;
  updateCaption = function () {
    originalCaption();
    if (!parameters) return;
    const item = currentScreen();
    let text = '';
    if (item.id === 'C02' && parameters.horizonYears >= 5) text = '那一年，你' + parameters.endAge + '岁。';
    if (config.group === 'R') {
      const target = parameters.yearMap.find(entry => entry.id === item.id);
      if (target) {
        const previous = parameters.yearMap[Math.max(0, Number(item.id.slice(1)) - 2)];
        const elapsed = Math.max(0, audio.currentTime - item.start);
        const proportion = Math.min(1, elapsed / 1.5);
        const year = Math.round(previous.year + (target.year - previous.year) * proportion);
        text = (proportion === 1 ? target.label : year + '年') + ' · ' + (year - parameters.birthYear) + '岁';
      } else if (['R11', 'R12'].includes(item.id)) text = '今天 · ' + parameters.nowYear + '年';
    }
    if (shownYear !== text) { shownYear = text; $('overlay').textContent = text;if(text)record('year_age_displayed',{text,screen:item.id}); }
  };
  const start = $('start');
  start.disabled = true;
  $('intro').querySelector('h1').textContent = '一段互动练习';
  $('intro').querySelector('p').innerHTML = '请打开声音。选择用来记录你注意到了什么，后面的内容按原顺序继续。';
  $('variant').hidden = true;
  $('settings').hidden = true;
  $('exit').onclick = () => { pause('exit_requested'); send('exit'); };
  const initialStart = start.onclick;
  start.onclick = async () => {
    if (!initialized || completed) return;
    await initialStart();
  };
  window.addEventListener('message', e => {
    if (e.source !== parent || e.origin !== expectedOrigin || e.data?.channel !== 'LG2_PARENT') return;
    if(e.data.type==='continue_route'&&initialized&&completed&&config.group==='common'){
      nonce=e.data.nonce;parameters=e.data.parameters;completed=false;
      Object.assign(config,e.data.mediaConfig,{group:e.data.group,backgroundWaitPolicy:e.data.timeoutPolicy,timeoutPolicyApproved:e.data.timeoutPolicyApproved});
      shownYear=null;initialStart();
    }else if (e.data.type === 'configure' && !initialized) {
      initialized = true; nonce = e.data.nonce; parameters = e.data.parameters;
      config.group = e.data.group; config.timeoutPolicyApproved = e.data.timeoutPolicyApproved;
      config.backgroundWaitPolicy = e.data.timeoutPolicy;
      start.textContent = config.group === 'common' ? '开始观看' : '继续练习';
      start.disabled = false;
    } else if(e.data.nonce===nonce&&e.data.type==='finalize_exit'){
      if(typeof currentQuestion!=='undefined'&&currentQuestion&&!responses.some(r=>r.station===currentQuestion.station))recordAbandonedResponse();
      record('exit',{waitMs:Math.round(waitMs)});stop();room.pause();phase='exited';send('exit_finalized',{...payload(),reason:e.data.reason});
    } else if (e.data.nonce === nonce && e.data.type === 'pause') pause('parent_pause');
  });
  setInterval(() => { if (nonce && active() && !completed) send('checkpoint'); }, 3000);
  parent.postMessage({ channel: 'LG2_PLAYER', type: 'ready' }, expectedOrigin === 'null' ? '*' : expectedOrigin);
})();
