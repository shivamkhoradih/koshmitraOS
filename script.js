(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* navigation */
  var nav = $('.nav'), menu = $('.menu'), burger = $('.burger');
  function onScroll() { nav.classList.toggle('solid', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* reveal on scroll */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* counters */
  function count(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end + suf; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cs = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.4 });
    cs.forEach(function (el) { co.observe(el); });
  } else { cs.forEach(count); }

  /* hero particles (light: about 50 dots, paused when hidden) */
  var cv = $('#fx');
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, pts = [], run = true;
    var N = window.innerWidth < 700 ? 24 : 52;
    function size() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
    function init() { size(); pts = []; for (var i = 0; i < N; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }); }
    function draw() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fillStyle = 'rgba(165,180,255,.7)'; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14000) { ctx.strokeStyle = 'rgba(140,160,255,' + (0.18 * (1 - d / 14000)) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    }
    init(); draw();
    window.addEventListener('resize', init);
    document.addEventListener('visibilitychange', function () { run = !document.hidden; if (run) draw(); });
  }

  /* 3D tilt on the hero dashboard + soft mouse glow (mouse devices only) */
  var fine = window.matchMedia('(pointer: fine)').matches;
  var stage = $('.stage'), dash = $('.stage .dash');
  if (stage && dash && fine && !reduce && window.innerWidth > 980) {
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      dash.style.transform = 'rotateY(' + (-9 + x * 12) + 'deg) rotateX(' + (5 - y * 12) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () { dash.style.transform = ''; });
  }
  var glow = $('#glow');
  if (glow && fine && !reduce) {
    window.addEventListener('mousemove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });
  } else if (glow) { glow.remove(); }

  /* contact form: opens WhatsApp with the typed message (no server needed) */
  var f = $('#cf');
  if (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (f.elements[n].value || '').trim(); };
      var msg = 'Hello KoshMitra OS,\nName: ' + v('name') + '\nInstitute / business: ' + v('org') + '\nType: ' + v('type') + '\nMobile: ' + v('mobile') + '\n' + v('msg');
      window.open('https://wa.me/918756891890?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* language switcher: every language has its own page (/, /en/, /mr/, /bn/), so Google can read each one */
  var sel = $('#lang');
  if (sel) {
    sel.addEventListener('change', function () {
      var c = sel.value, about = /about\.html$/.test(location.pathname);
      location.href = (c === 'hi' ? '/' : '/' + c + '/') + (about ? 'about.html' : '');
    });
  }
  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
