/* Custom dropdowns for the site's native <select>s.
   The OS option list can't be styled (it's the grey macOS menu), so each select gets a
   button + listbox that we draw ourselves. The real <select> stays in the DOM, hidden,
   and is still the source of truth: picking sets its value and fires "change", so form
   submits, form.reset() and existing change listeners keep working untouched.
   Opt out with data-native on a select. */
(function () {
  'use strict';
  var CSS = "\
.xs{position:relative;display:block}\
.xs>select{position:absolute!important;inset:0;width:100%;height:100%;opacity:0;pointer-events:none}\
.xs-btn{display:flex;align-items:center;gap:10px;width:100%;text-align:left;cursor:pointer;font:inherit;color:inherit;background:none;-webkit-tap-highlight-color:transparent}\
.xs-val{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\
.xs-chev{flex:0 0 auto;display:grid;place-items:center;transition:transform .35s cubic-bezier(.3,1.5,.5,1),background .2s,color .2s}\
.xs-chev svg{display:block}\
.xs.is-open .xs-chev{transform:rotate(180deg)}\
.xs-pop{display:none;position:absolute;z-index:1000;margin:0;padding:6px;list-style:none;overflow:auto;overscroll-behavior:contain;opacity:0;transform:translateY(-6px) scale(.98);transform-origin:top center;transition:opacity .16s ease,transform .26s cubic-bezier(.2,1.3,.4,1);pointer-events:none}\
.xs-pop:focus{outline:none}\
.xs-pop.is-up{transform-origin:bottom center;transform:translateY(6px) scale(.98)}\
.xs-pop.is-open{opacity:1;transform:none;pointer-events:auto}\
.xs-opt{position:relative;display:flex;line-height:1.35;align-items:center;gap:12px;cursor:pointer;outline:none;opacity:0;transform:translateY(-4px);transition:background .15s,color .15s,padding-left .22s cubic-bezier(.3,1.4,.5,1),opacity .25s ease,transform .25s ease}\
.xs-pop.is-open .xs-opt{opacity:1;transform:none}\
.xs-opt-txt{flex:1;min-width:0}\
.xs-tick{flex:0 0 auto;display:grid;place-items:center;opacity:0;transform:scale(.3);transition:opacity .2s,transform .3s cubic-bezier(.2,1.6,.4,1)}\
.xs-opt[aria-selected=true] .xs-tick{opacity:1;transform:none}\
.xs-ico{flex:0 0 auto;display:grid;place-items:center}\
\
/* ── booking modal: soft and rounded — pill field, floating card list ── */\
.xs--ed .xs-btn{border:1px solid var(--ink);border-radius:16px;background:#fff;padding:13px 10px 13px 18px;font-family:var(--font-d);font-size:15px;color:var(--ink);box-shadow:0 1px 2px rgba(22,21,15,.06);transition:border-color .15s,box-shadow .25s,transform .2s}\
.xs--ed .xs-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px -10px rgba(22,21,15,.35)}\
.xs--ed .xs-btn:focus-visible,.xs--ed.is-open .xs-btn{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px rgba(33,107,172,.14);transform:none}\
.xs--ed .xs-btn.is-empty .xs-val{color:var(--ink-30)}\
.xs--ed .xs-chev{width:30px;height:30px;border-radius:50%;background:var(--accent-2);color:var(--accent)}\
.xs--ed.is-open .xs-chev,.xs--ed .xs-btn:hover .xs-chev{background:var(--accent);color:#fff}\
.xs-pop--ed{background:#fff;border:1px solid rgba(22,21,15,.12);border-radius:20px;padding:6px;box-shadow:0 2px 6px rgba(22,21,15,.06),0 24px 50px -16px rgba(22,21,15,.4)}\
.xs-pop--ed .xs-opt{padding:12px 12px;margin:2px 0;border-radius:14px;font-family:var(--font-d);font-size:15px;color:var(--ink)}\
.xs-pop--ed .xs-num{display:grid;place-items:center;flex:0 0 28px;height:28px;border-radius:50%;background:var(--paper);font-family:var(--font-m);font-size:10px;letter-spacing:.04em;color:var(--ink-50);transition:background .15s,color .15s}\
.xs-pop--ed .xs-opt.is-active{background:linear-gradient(90deg,rgba(193,220,232,.75),rgba(193,220,232,.35));padding-left:16px}\
.xs-pop--ed .xs-opt.is-active .xs-num{background:#fff;color:var(--accent)}\
.xs-pop--ed .xs-tick{width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;box-shadow:0 4px 10px rgba(33,107,172,.3)}\
.xs-pop--ed .xs-opt[aria-selected=true]{color:var(--accent)}\
.xs-pop--ed .xs-opt[aria-selected=true] .xs-num{background:var(--accent);color:#fff}\
\
/* ── workspace mock (Slack / Teams model picker): app-like, soft, rounded ── */\
.xs--ws{display:inline-block}\
.xs--ws .xs-btn{gap:7px;border:1px solid #d6d6d6;border-radius:999px;background:#fff;padding:5px 8px 5px 6px;font-family:var(--ws-font);font-size:12.5px;color:var(--ws-text);box-shadow:0 1px 2px rgba(0,0,0,.05);transition:border-color .15s,box-shadow .2s}\
.xs--ws .xs-btn:hover,.xs--ws.is-open .xs-btn,.xs--ws .xs-btn:focus-visible{outline:none;border-color:var(--ws-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--ws-brand) 14%,transparent)}\
.xs--ws .xs-chev{width:16px;height:16px;color:var(--ws-dim)}\
.xs--ws .xs-ico,.xs-pop--ws .xs-ico{width:20px;height:20px;border-radius:6px;background:#fff;box-shadow:0 0 0 1px #e8e8e8}\
.xs--ws .xs-ico svg,.xs-pop--ws .xs-ico svg{width:13px;height:13px}\
.xs-pop--ws{min-width:230px;background:#fff;border:1px solid #e4e4e4;border-radius:14px;box-shadow:0 2px 6px rgba(0,0,0,.05),0 22px 50px -14px rgba(20,20,40,.3);font-family:var(--ws-font)}\
.xs-pop--ws .xs-head{padding:8px 10px 6px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a999a}\
.xs-pop--ws .xs-opt{gap:10px;padding:9px 10px;border-radius:9px;font-size:13.5px;color:var(--ws-text)}\
.xs-pop--ws .xs-opt.is-active{background:color-mix(in srgb,var(--ws-brand) 9%,#fff)}\
.xs-pop--ws .xs-opt.is-active .xs-ico{box-shadow:0 0 0 1px color-mix(in srgb,var(--ws-brand) 35%,#fff)}\
.xs-pop--ws .xs-sub{display:block;font-weight:400;font-size:11px;color:var(--ws-dim);margin-top:1px}\
.xs-pop--ws .xs-tick{width:18px;height:18px;border-radius:50%;background:var(--ws-brand);color:#fff}\
.xs-pop--ws .xs-opt[aria-selected=true]{font-weight:600}\
@media (prefers-reduced-motion:reduce){.xs-pop,.xs-opt,.xs-chev,.xs-tick{transition:none}}";

  var CHEV = '<svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true"><path d="M1 1.2l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TICK = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.8 6.3 2.1 2.1L9.3 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var GEMINI = '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="xsGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b8df8"/><stop offset=".55" stop-color="#9168f0"/><stop offset="1" stop-color="#e2667f"/></linearGradient></defs><path fill="url(#xsGem)" d="M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5C11.3 16.9 7.1 12.7 1.5 12 7.1 11.3 11.3 7.1 12 1.5z"/></svg>';
  var COIN = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="#8a8a8a" stroke-width="1.8"/><path d="M14.6 9.2c-.5-.8-1.5-1.2-2.6-1.2-1.6 0-2.7.8-2.7 2s1.1 1.6 2.7 2c1.6.4 2.8.9 2.8 2.1s-1.2 2-2.8 2c-1.2 0-2.2-.5-2.7-1.3M12 6.5v11" stroke="#8a8a8a" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function useLogo(id) { return document.getElementById(id) ? '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + id + '"/></svg>' : ''; }
  // The model list is rewritten daily by a scheduled task, so match on the name, not the value.
  function modelMeta(text) {
    var t = text.toLowerCase();
    if (/fable|claude|opus|sonnet|haiku/.test(t)) return { ico: useLogo('lg-claude'), sub: 'Anthropic' };
    if (/gpt|openai|\bo\d/.test(t)) return { ico: useLogo('lg-openai'), sub: 'OpenAI' };
    if (/gemini|google/.test(t)) return { ico: GEMINI, sub: 'Google' };
    return { ico: COIN, sub: 'Lower cost, same agent' };
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var uid = 0, openOne = null;

  function enhance(sel) {
    if (sel.dataset.native != null || sel.closest('.xs')) return;
    var kind = sel.closest('.model-pill') ? 'ws' : 'ed';
    var id = 'xs' + (++uid);
    var wrap = document.createElement('div');
    wrap.className = 'xs xs--' + kind;
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    var label = sel.id && document.querySelector('label[for="' + sel.id + '"]');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'xs-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    if (sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    wrap.appendChild(btn);
    // Clicking the <label> should open ours, not focus the hidden select.
    if (label) label.addEventListener('click', function (e) { e.preventDefault(); btn.focus(); });

    var pop = document.createElement('ul');
    pop.className = 'xs-pop xs-pop--' + kind;
    pop.id = id;
    pop.setAttribute('role', 'listbox');
    pop.tabIndex = -1;
    if (label) { if (!label.id) label.id = id + '-l'; pop.setAttribute('aria-labelledby', label.id); }
    document.body.appendChild(pop);

    var opts = [], active = -1;

    function real() { return [].filter.call(sel.options, function (o) { return !(o.value === '' && o.index === 0); }); }
    function build() {
      var list = real();
      pop.innerHTML = (kind === 'ws' ? '<li class="xs-head" role="presentation">Choose a model</li>' : '') + list.map(function (o, i) {
        var m = kind === 'ws' ? modelMeta(o.text) : null;
        var lead = m ? '<span class="xs-ico">' + m.ico + '</span>' : '<span class="xs-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>';
        var txt = m ? esc(o.text) + '<span class="xs-sub">' + esc(m.sub) + '</span>' : esc(o.text);
        return '<li class="xs-opt" role="option" id="' + id + '-' + i + '" data-v="' + esc(o.value) + '" style="transition-delay:0s,0s,0s,' + (i * 35) + 'ms,' + (i * 35) + 'ms">' + lead + '<span class="xs-opt-txt">' + txt + '</span><span class="xs-tick">' + TICK + '</span></li>';
      }).join('');
      opts = [].slice.call(pop.querySelectorAll('.xs-opt'));
      opts.forEach(function (li, i) {
        li.addEventListener('click', function () { choose(i); });
        li.addEventListener('mousemove', function () { if (active !== i) setActive(i); });
      });
      sync();
    }
    function sync() {
      var o = sel.options[sel.selectedIndex];
      var empty = !o || o.value === '';
      var txt = o ? o.text : '';
      var lead = '';
      if (kind === 'ws' && !empty) lead = '<span class="xs-ico">' + modelMeta(txt).ico + '</span>';
      btn.innerHTML = lead + '<span class="xs-val">' + esc(txt) + '</span><span class="xs-chev">' + CHEV + '</span>';
      btn.classList.toggle('is-empty', empty);
      opts.forEach(function (li) { li.setAttribute('aria-selected', String(li.dataset.v === sel.value && !empty)); });
    }
    function setActive(i) {
      active = i;
      opts.forEach(function (li, j) { li.classList.toggle('is-active', j === i); });
      if (opts[i]) { pop.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); }
    }
    function place() {
      var r = btn.getBoundingClientRect(), gap = 8, pad = 12;
      var h = Math.min(pop.scrollHeight, 340);
      var below = innerHeight - r.bottom - gap - pad, above = r.top - gap - pad;
      var up = below < h && above > below;
      pop.classList.toggle('is-up', up);
      pop.style.maxHeight = Math.max(160, Math.min(340, up ? above : below)) + 'px';
      pop.style.minWidth = r.width + 'px';
      if (kind === 'ed') pop.style.width = r.width + 'px';   // flush with the field, like the modal's inputs
      var w = pop.offsetWidth;
      var left = kind === 'ws' ? r.right - w : r.left;       // the model pill sits at the right edge
      left = Math.max(pad, Math.min(left, innerWidth - w - pad));
      pop.style.left = (left + scrollX) + 'px';
      pop.style.top = (up ? r.top - gap - pop.offsetHeight : r.bottom + gap) + scrollY + 'px';
    }
    function open() {
      if (openOne && openOne !== api) openOne.close();
      // The list lives on <body>, outside the mock, so carry the mock's theme across (Slack ↔ Teams).
      var cs = getComputedStyle(wrap);
      ['--ws-font', '--ws-brand', '--ws-text', '--ws-dim'].forEach(function (v) { var x = cs.getPropertyValue(v); if (x) pop.style.setProperty(v, x.trim()); });
      build();
      pop.style.display = 'block';
      place();
      requestAnimationFrame(function () { pop.classList.add('is-open'); });
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var cur = opts.findIndex(function (li) { return li.dataset.v === sel.value; });
      setActive(cur < 0 ? 0 : cur);
      pop.focus({ preventScroll: true });
      openOne = api;
    }
    function close(refocus) {
      if (openOne !== api) return;
      pop.classList.remove('is-open');
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      openOne = null;
      setTimeout(function () { if (openOne !== api) pop.style.display = 'none'; }, 260);
      if (refocus) btn.focus({ preventScroll: true });
    }
    function choose(i) {
      var v = opts[i] && opts[i].dataset.v;
      close(true);
      if (v == null || v === sel.value) return;
      sel.value = v;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var typed = '', typedAt = 0;
    function keys(e) {
      var k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, opts.length - 1)); }
      else if (k === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (k === 'Home') { e.preventDefault(); setActive(0); }
      else if (k === 'End') { e.preventDefault(); setActive(opts.length - 1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
      else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (k === 'Tab') close(true);   // hand focus back so Tab carries on from the field
      else if (k.length === 1) {
        typed = (Date.now() - typedAt > 700 ? '' : typed) + k.toLowerCase(); typedAt = Date.now();
        var hit = opts.findIndex(function (li) { return li.textContent.toLowerCase().indexOf(typed) === 0; });
        if (hit >= 0) setActive(hit);
      }
    }

    var api = { close: close, place: place, pop: pop, wrap: wrap };
    btn.addEventListener('click', function () { openOne === api ? close(true) : open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    pop.addEventListener('keydown', keys);
    // Keep the button in step with programmatic changes: form.reset(), code setting .value.
    sel.addEventListener('change', sync);
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(sync, 0); });
    new MutationObserver(build).observe(sel, { childList: true, subtree: true, characterData: true });
    build();
  }

  function init() {
    if (!document.getElementById('xs-css')) {
      var st = document.createElement('style'); st.id = 'xs-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    [].forEach.call(document.querySelectorAll('select'), enhance);
  }
  // Close on outside press, and on page scroll / resize (the list is positioned against the page).
  document.addEventListener('pointerdown', function (e) {
    if (openOne && !openOne.wrap.contains(e.target) && !openOne.pop.contains(e.target)) openOne.close(false);
  }, true);
  addEventListener('scroll', function (e) { if (openOne && !openOne.pop.contains(e.target)) openOne.close(false); }, true);
  addEventListener('resize', function () { if (openOne) openOne.place(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
