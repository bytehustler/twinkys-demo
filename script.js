/* Twinky's demo – vanilla JS (no libraries).
   Sections: loader · header/menu · progress · scrollspy · reveal · hero effects ·
   service filter · service finder · card tilt · gallery lightbox · copy buttons · theme switcher */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- LOADER (intro screen). Delete this block + #loader in index.html to remove it ----- */
  var loader = $('#loader');
  function hideLoader() { if (loader) loader.classList.add('done'); }
  window.addEventListener('load', function () { setTimeout(hideLoader, 1500); });
  setTimeout(hideLoader, 3000); // safety

  /* ----- Header, scroll progress, back-to-top ----- */
  var header = $('.site-header');
  var progress = $('#progress');
  var toTop = $('#toTop');
  var heroMedia = $('#heroMedia');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 40);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    toTop.classList.toggle('show', y > 700);
    if (heroMedia && !reduceMotion && y < window.innerHeight * 1.2) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ----- Mobile menu ----- */
  var nav = $('#nav');
  var toggle = $('#menuToggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });

  /* ----- Scrollspy: highlights the current section in the menu ----- */
  var navLinks = $$('a[href^="#"]', nav);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'services', 'gallery', 'why', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ----- Reveal on scroll ----- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(idx % 4, 3) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ----- Hero sparkles (light gold dust on a canvas) ----- */
  var canvas = $('#sparkles');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var parts = [], W = 0, H = 0, heroVisible = true, frame = 0, rgb = '201,169,110';
    var hero = $('#hero');
    var resize = function () {
      var r = hero.getBoundingClientRect(); var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 600 ? 28 : 55; parts = [];
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, v: Math.random() * .25 + .08, t: Math.random() * 6.28, s: Math.random() * .02 + .008 });
    };
    resize(); window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(hero);
    (function loop() {
      if (heroVisible) {
        if (frame++ % 60 === 0) { var v = getComputedStyle(document.documentElement).getPropertyValue('--gold-rgb').trim(); if (v) rgb = v.replace(/\s/g, ''); }
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i]; p.t += p.s; p.y -= p.v; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
          ctx.beginPath(); ctx.fillStyle = 'rgba(' + rgb + ',' + (0.25 + 0.5 * Math.abs(Math.sin(p.t))).toFixed(2) + ')';
          ctx.arc(p.x + Math.sin(p.t) * 6, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ----- Cursor glow + magnetic buttons (desktop mouse only) ----- */
  if (finePointer && !reduceMotion) {
    var glow = $('.cursor-glow');
    window.addEventListener('mousemove', function (e) {
      glow.classList.add('on');
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

    $$('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ----- Service cards: 3D tilt + light that follows the mouse (desktop only) ----- */
  if (finePointer && !reduceMotion) {
    $$('.sc-inner').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (x * 100) + '%'); c.style.setProperty('--my', (y * 100) + '%');
      });
      c.addEventListener('mouseleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ----- Service filter ----- */
  var cards = $$('.service-card');
  var chips = $$('.filters .chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { var on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('pop');
        if (show) { card.classList.add('in'); void card.offsetWidth; card.classList.add('pop'); }
      });
    });
  });

  /* ----- Service finder ("What are you visiting for?") ----- */
  var fResult = $('#finderResult'), fList = $('#frList');
  var fChips = $$('.finder-opts .chip');
  fChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      fChips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      fList.innerHTML = chip.getAttribute('data-pick').split('|').join(' &nbsp;·&nbsp; ');
      fResult.hidden = false;
      fResult.style.animation = 'none'; void fResult.offsetWidth; fResult.style.animation = '';
    });
  });

  /* ----- Gallery lightbox with next / previous, keyboard and swipe ----- */
  var lightbox = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  var shots = $$('[data-lightbox]'), cur = 0;

  function show(i) {
    cur = (i + shots.length) % shots.length;
    var img = $('img', shots[cur]);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbCap.textContent = $('.g-cap', shots[cur]).textContent;
    lbCount.textContent = (cur + 1) + ' / ' + shots.length;
  }
  function openLb(i) {
    show(i);
    if (typeof lightbox.showModal === 'function') lightbox.showModal(); else lightbox.setAttribute('open', '');
  }
  function closeLb() { if (typeof lightbox.close === 'function') lightbox.close(); else lightbox.removeAttribute('open'); }
  shots.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { show(cur - 1); });
  $('#lbNext').addEventListener('click', function () { show(cur + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.hasAttribute('open')) return;
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lbImg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lbImg.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });

  /* ----- Copy buttons + toast ----- */
  var toast = $('#toast'), toastTimer;
  function say(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta);
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy'), label = btn.getAttribute('data-label') || 'Text';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { say(label + ' copied'); }, function () { fallbackCopy(text); say(label + ' copied'); });
      } else { fallbackCopy(text); say(label + ' copied'); }
    });
  });

  /* ----- THEME SWITCHER (demo only: delete this block with the switcher HTML) -----
     Themes are defined in style.css as :root[data-theme="..."].
     Open the page with ?theme=rose or ?theme=sage to share a specific one. */
  var themeSwitch = $('#themeSwitch'), themeBtn = $('#themeBtn');
  var themeColors = { champagne: '#fbf7ef', rose: '#fff8f6', sage: '#f8f8f1' };
  var root = document.documentElement;
  function applyTheme(name) {
    if (!themeColors[name]) name = 'champagne';
    if (name === 'champagne') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', name);
    var meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', themeColors[name]);
    $$('[data-theme]', themeSwitch).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme') === name)); });
    try { localStorage.setItem('twinkys-theme', name); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem('twinkys-theme'); } catch (e) {}
  applyTheme(new URLSearchParams(window.location.search).get('theme') || saved || 'champagne');
  themeBtn.addEventListener('click', function () {
    var open = !themeSwitch.classList.contains('open');
    themeSwitch.classList.toggle('open', open); themeBtn.setAttribute('aria-expanded', String(open));
  });
  $$('[data-theme]', themeSwitch).forEach(function (b) {
    b.addEventListener('click', function () {
      applyTheme(b.getAttribute('data-theme')); themeSwitch.classList.remove('open'); themeBtn.setAttribute('aria-expanded', 'false');
      say(b.textContent.trim() + ' theme');
    });
  });
  document.addEventListener('click', function (e) {
    if (!themeSwitch.contains(e.target)) { themeSwitch.classList.remove('open'); themeBtn.setAttribute('aria-expanded', 'false'); }
  });
})();
