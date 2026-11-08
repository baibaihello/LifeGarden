window.LG2UI = (() => {
  const main = document.getElementById('app');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let cancel = null;
  function abort(reason) { if (cancel) cancel(reason); }
  function field(name, label, type = 'text', options = {}) {
    if (type === 'radio') {
      return '<fieldset><legend>' + label + '</legend>' + options.values.map(value => {
        const item = typeof value === 'object' ? value : { value, text: value };
        return '<label class="option"><input required type="radio" name="' + name + '" value="' +
          escape(item.value) + '">' + escape(item.text) + '</label>';
      }).join('') + '</fieldset>';
    }
    if (type === 'scale') {
      const min = options.min ?? 0, max = options.max ?? 10;
      return '<fieldset><legend>' + label + '</legend><div class="ends"><span>' + min + ' ' + escape(options.low || '完全没有') +
        '</span><span>' + max + ' ' + escape(options.high || '非常强烈') + '</span></div><div class="rating-line"><input type="range" name="' +
        name + '" min="' + min + '" max="' + max + '" step="1" value="' + min +
        '" data-required-touch="1" aria-label="' + escape(label) + '"><output>尚未选择</output></div></fieldset>';
    }
    if (type === 'likert') {
      const max = options.max || 7;
      const low = options.low || '完全不符合', high = options.high || '完全符合';
      // Reuse Study 1's horizontal numeric choices and separate endpoint labels.
      return '<fieldset class="likert-question"><legend>' + label + '</legend>' +
        '<div class="ends likert-ends"><span>1 ' + escape(low) + '</span><span>' + max + ' ' + escape(high) + '</span></div>' +
        '<div class="likert" style="--steps:' + max + '">' + Array.from({ length: max }, (_, i) =>
          '<label><input required type="radio" name="' + escape(name) + '" value="' + (i + 1) +
          '" aria-label="' + (i + 1) + (i === 0 ? ' ' + escape(low) : i === max - 1 ? ' ' + escape(high) : '') + '"><span>' + (i + 1) + '</span></label>'
        ).join('') + '</div></fieldset>';
    }
    if (type === 'textarea') return '<label class="field">' + label + '<textarea name="' + name + '" rows="4" maxlength="5000"></textarea></label>';
    const attrs = Object.entries(options).map(([k, v]) => k + '="' + escape(v) + '"').join(' ');
    return '<label class="field">' + label + '<input required name="' + name + '" type="' + type + '" ' + attrs + '></label>';
  }
  function mount(title, content) {
    main.innerHTML = '<section class="card"><h1 tabindex="-1">' + escape(title) + '</h1>' + content + '</section>';
    main.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function form(title, html, options = {}) {
    return new Promise((resolve, reject) => {
      const start = performance.now(), changes = {};
      mount(title, '<form id="responseForm">' + html + '<p id="formError" class="error" role="alert"></p>' +
        '<button class="primary" type="submit">' + escape(options.submit || '继续') + '</button></form>');
      const form = document.getElementById('responseForm');
      cancel = reason => { cancel = null; options.cleanup?.(); reject({ flowExit: reason }); };
      const track = input => {
        const key = input.name;
        if (!key) return;
        changes[key] ||= { firstMs: Math.round(performance.now() - start), changes: 0 };
        changes[key].changes++;
        if (input.type === 'range') input.nextElementSibling.textContent = input.value;
        input.dataset.touched = '1';
      };
      form.addEventListener('input', event => track(event.target));
      form.addEventListener('change', event => { if (!event.target.dataset.touched) track(event.target); });
      form.querySelectorAll('input[type=range]').forEach(input => {
        // A first pointer click at the default zero is still a deliberate answer.
        input.addEventListener('pointerup', () => { if (!input.dataset.touched) track(input); });
        input.addEventListener('keydown', event => {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) track(input);
        });
      });
      options.onMount?.(form);
      form.onsubmit = event => {
        event.preventDefault();
        const untouched = form.querySelector('[data-required-touch]:not([data-touched])');
        const error = document.getElementById('formError');
        if (untouched) {
          error.textContent = '请在线上选择每一项，包括选择 0 的项目。'; untouched.focus(); return;
        }
        const values = Object.fromEntries(new FormData(form).entries());
        const invalid = options.validate?.(values, form);
        if (invalid) { error.textContent = invalid; return; }
        cancel = null;
        resolve({ values, responseMs: Math.round(performance.now() - start), interactions: changes });
      };
    });
  }
  function choice(title, html, choices) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      mount(title, html + '<div id="choiceButtons" class="stack"></div>');
      cancel = reason => { cancel = null; reject({ flowExit: reason }); };
      choices.forEach((text, i) => {
        const button = document.createElement('button'); button.textContent = text;
        button.onclick = () => {
          cancel = null;
          document.querySelectorAll('#choiceButtons button').forEach(b => b.disabled = true);
          resolve({ choice: i, responseMs: Math.round(performance.now() - start) });
        };
        document.getElementById('choiceButtons').append(button);
      });
    });
  }
  async function dialog(title, text, choices) {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = '<h2>' + escape(title) + '</h2><p>' + escape(text) + '</p><div class="stack"></div>';
    document.body.append(dialog);
    return new Promise(resolve => {
      dialog.addEventListener('cancel', e => e.preventDefault());
      choices.forEach((label, i) => {
        const button = document.createElement('button'); button.textContent = label;
        button.onclick = () => { dialog.close(); dialog.remove(); resolve(i); };
        dialog.querySelector('.stack').append(button);
      });
      dialog.showModal();
    });
  }
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  return { main, escape, field, mount, form, choice, dialog, abort, download };
})();
