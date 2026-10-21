/* =====================================================================
   Page UI: year, header, menu, progress, reveal, motion preference, the
   decoding headline, and the live numbers in the hero. Started from the
   Stone Arch Silicon site's script. Each feature checks that its elements
   exist before it runs. The network map lives in index.html.
   ===================================================================== */
(function(){
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;

  /* storage is wrapped: private windows and locked-down browsers throw on access */
  function readPref(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function writePref(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  window.ASICNet = { readPref, writePref };

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- motion: OS setting by default, the hero toggle overrides ----------
     The choice is saved, so a paused page stays paused on the next visit. */
  const MOTION_KEY = 'asicnet-motion';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const saved = readPref(MOTION_KEY);
  const listeners = [];
  const motionBtn = $('#motionBtn'), motionLabel = $('#motionLabel');
  const Motion = {
    on: saved ? saved === 'on' : !reduceMQ.matches,
    set(v, persist){
      this.on = v;
      root.classList.toggle('motion-off', !v);
      if (motionBtn) motionBtn.setAttribute('aria-pressed', String(!v));
      if (motionLabel) motionLabel.textContent = v ? 'Pause motion' : 'Play motion';
      if (persist) writePref(MOTION_KEY, v ? 'on' : 'off');
      listeners.forEach(fn => fn(v));
    },
    subscribe(fn){ listeners.push(fn); }
  };
  window.ASICNet.Motion = Motion;
  if (motionBtn) motionBtn.addEventListener('click', () => Motion.set(!Motion.on, true));

  /* ---------- hero film ---------- */
  const video = $('#heroVideo');
  function syncVideo(on){
    if (!video) return;
    if (on){
      if (video.preload !== 'auto') video.preload = 'auto';
      const p = video.play();
      if (p && p.catch) p.catch(() => {});   // low-power mode etc.: the poster stays up
    } else {
      video.pause();
    }
  }
  if (video){
    video.muted = true;
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    // stop decoding while the hero is off screen
    new IntersectionObserver(([e]) => {
      if (!Motion.on) return;
      if (e.isIntersecting) syncVideo(true); else video.pause();
    }, { threshold: 0 }).observe(video);
    Motion.subscribe(syncVideo);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && Motion.on) syncVideo(true); });
  }

  /* ---------- decoding word in the headline ----------
     Cycles through data-words, scrambling each change like a signal locking on. */
  const dec = $('#decode');
  if (dec){
    let words = [];
    try { words = JSON.parse(dec.dataset.words || '[]'); } catch(e){}
    if (!words.length) words = [dec.textContent];
    const GLYPHS = 'abcdefghijklnopqrstuvxyz0123456789#+/<>=';   // no wide glyphs, so the line barely jitters
    let idx = 0, timer = null, raf = 0;
    function scramble(to){
      const from = dec.textContent, len = Math.max(from.length, to.length), t0 = performance.now(), DUR = 820;
      cancelAnimationFrame(raf);
      const step = now => {
        const p = Math.min(1, (now - t0) / DUR);
        let out = '';
        for (let k = 0; k < len; k++){
          const target = to[k] || '';
          if (p >= 0.2 + 0.7 * (k / len)) out += target;            // settles left to right
          else out += target === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        dec.textContent = out;
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function next(){
      idx = (idx + 1) % words.length;
      scramble(words[idx]);
      timer = setTimeout(next, idx === 0 ? 4200 : 2800);
    }
    function start(){ if (!timer && words.length > 1) timer = setTimeout(next, 3600); }
    function stop(){ clearTimeout(timer); timer = null; cancelAnimationFrame(raf); idx = 0; dec.textContent = words[0]; }
    Motion.subscribe(on => on ? start() : stop());
  }

  /* ---------- live numbers in the hero, filled in by the map script ---------- */
  window.ASICNet.setStats = stats => {
    Object.keys(stats).forEach(k => {
      const el = $('[data-stat="' + k + '"]'), v = stats[k];
      if (!el) return;
      const show = n => { el.textContent = String(n).padStart(2, '0'); };
      if (!Motion.on){ show(v); return; }
      const t0 = performance.now(), D = 1400;
      (function tick(now){
        const p = Math.min(1, Math.max(0, (now - t0) / D));
        show(Math.round(v * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  };

  const header = $('#siteHeader');

  /* ---------- nav takes the theme of the section under it ---------- */
  const nav = $('#nav');
  const themed = $$('[data-nav]');
  const progress = $('#progress');
  let ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      const probe = nav.getBoundingClientRect().bottom - 1;
      let theme = 'dark', inHeroTop = false;
      for (const s of themed){
        const r = s.getBoundingClientRect();
        // no break: a dark panel nested in a light section comes later in the page, so the innermost match wins
        if (r.top <= probe && r.bottom > probe){ theme = s.dataset.nav; inHeroTop = s.id === 'top' && y < 40; }
      }
      nav.classList.toggle('on-dark', theme === 'dark' && !inHeroTop);
      nav.classList.toggle('on-light', theme === 'light');
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      statementTick();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- menu ---------- */
  const menu = $('#menu'), toggle = $('#menuToggle'), closeBtn = $('#menuClose');
  let lastFocus = null;
  function openMenu(){
    lastFocus = document.activeElement;
    menu.classList.add('is-open'); document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => closeBtn.focus(), 30);
  }
  function closeMenu(restore = true){
    menu.classList.remove('is-open'); document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu());
  $$('[data-close]', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab'){
      const f = $$('a,button', menu); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- statement: words fill in as you scroll ---------- */
  const statement = $('#statement');
  let words = [];
  if (statement){
    const walker = document.createTreeWalker(statement, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    words = $$('.w', statement);
  }
  function statementTick(){
    if (!words.length) return;
    const r = statement.getBoundingClientRect();
    const start = innerHeight * 0.9, end = innerHeight * 0.35;
    const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
    const n = Math.round(p * words.length);
    // the newest lit word is the signal head, in blue
    words.forEach((w, k) => { w.classList.toggle('on', k < n); w.classList.toggle('head', k === n - 1 && n < words.length); });
  }

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- footer wordmark: fit to the container width ---------- */
  const wm = $('#wordmark');
  function fitWordmark(){
    if (!wm) return;
    const span = wm.firstElementChild;
    wm.style.fontSize = '100px';
    const w = span.getBoundingClientRect().width;
    if (w > 0) wm.style.fontSize = (100 * wm.clientWidth / w * 0.992) + 'px';
  }
  addEventListener('resize', fitWordmark);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark); else fitWordmark();
  fitWordmark();

  Motion.set(Motion.on, false);
  onScroll();
})();
