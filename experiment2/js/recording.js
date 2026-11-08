window.LG2Recording = {
  async start(target, consent, config, save) {
    if (!consent || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return () => {};
    const section = document.createElement('section');
    section.className = 'recording';
    section.innerHTML = '<p>也可以说一说（可选，最多90秒）。录音不会自动开始。</p><button type="button">开始录音</button><span role="status"></span>';
    target.append(section);
    const button = section.querySelector('button'), label = section.querySelector('span');
    let recorder, stream, timer, chunks = [], stopped = false, pending = null;
    const stop = () => {
      if (recorder?.state === 'recording') recorder.stop();
      stream?.getTracks().forEach(track => track.stop());
      clearTimeout(timer);
    };
    button.onclick = async () => {
      if (recorder?.state === 'recording') { stop(); return; }
      button.disabled = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(t => MediaRecorder.isTypeSupported(t));
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        chunks = [];
        let size = 0;
        recorder.ondataavailable = event => {
          size += event.data.size;
          if (size <= config.RECORDING_MAX_BYTES) chunks.push(event.data);
          else { label.textContent = '录音已达到文件大小限制。'; stop(); }
        };
        recorder.onstop = () => {
          clearTimeout(timer); stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          pending = blob.size ? save(blob).then(() => {
            label.textContent = '录音已保存在本次作答中。'; button.disabled = true;
          }).catch(error => {
            label.textContent = '录音保存失败，请打字回答或继续。'; console.error(error);
          }) : Promise.resolve();
        };
        recorder.start(500); button.disabled = false; button.textContent = '停止录音';
        label.textContent = '正在录音'; timer = setTimeout(stop, config.RECORDING_MAX_SECONDS * 1000);
      } catch {
        stream?.getTracks().forEach(t => t.stop());
        label.textContent = '未能开启麦克风，可以打字或跳过。'; button.disabled = false;
      }
    };
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', visibility);
    return async () => {
      stopped = true;
      const wasRecording = recorder?.state === 'recording';
      let completed;
      if (wasRecording) completed = new Promise(resolve => recorder.addEventListener('stop', resolve, { once: true }));
      stop();
      if (completed) await completed;
      if (pending) await pending;
      document.removeEventListener('visibilitychange', visibility);
    };
  }
};
