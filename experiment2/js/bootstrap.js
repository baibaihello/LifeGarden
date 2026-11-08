(() => {
  class CompleteExperiment {
    static info = { name: 'lifegarden-experiment2', parameters: {} };
    constructor(jsPsych) { this.jsPsych = jsPsych; }
    trial() {
      window.LG2_RUN_EXPERIMENT().then(()=>this.jsPsych.finishTrial({completed:true,version:window.LG2_CONFIG.VERSION})).catch(error => {
        console.error(error);
        document.getElementById('app').textContent = '页面未能继续，请联系研究者。';
      });
    }
  }
  const engine = initJsPsych({ display_element: 'engine' });
  // The outer trial owns the full lifecycle. We never duplicate unfiltered form values into jsPsych data.
  engine.run([{ type: CompleteExperiment }]);
})();
