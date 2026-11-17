(function () {
  'use strict';
  var d = document, w = window;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  d.documentElement.classList.add('js');

  var dialog = $('#contato-demo');
  function demoContato(e) { if (e) e.preventDefault(); dialog.showModal(); }
  $$('[data-wa], [data-demo-contact]').forEach(function (a) { a.addEventListener('click', demoContato); });
  $('#demo-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  /* ---------- menu do celular ---------- */
  var hd = $('#hd'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = !hd.classList.contains('open');
    hd.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.firstElementChild.textContent = open ? 'Fechar' : 'Menu';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { hd.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.firstElementChild.textContent = 'Menu'; }); });

  /* ---------- seletor do site (sem menu do sistema) ---------- */
  var sel = $('#qSel'), selBtn = $('.sel-btn', sel), selV = $('.sel-v', sel), selItems = $$('li', sel);
  function selOpen(o) { sel.classList.toggle('open', o); selBtn.setAttribute('aria-expanded', o); }
  selBtn.addEventListener('click', function (e) { e.stopPropagation(); selOpen(!sel.classList.contains('open')); });
  selItems.forEach(function (li) {
    li.addEventListener('click', function () {
      selItems.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      li.setAttribute('aria-selected', 'true'); selV.textContent = li.textContent; selOpen(false);
    });
  });
  d.addEventListener('click', function (e) { if (!sel.contains(e.target)) selOpen(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') selOpen(false); });

  /* ---------- máscara de data e pedido pelo WhatsApp ---------- */
  var qDate = $('#qDate'), qGuests = $('#qGuests');
  qDate.addEventListener('input', function () {
    var v = qDate.value.replace(/\D/g, '').slice(0, 8), o = v;
    if (v.length > 4) o = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
    else if (v.length > 2) o = v.slice(0, 2) + '/' + v.slice(2);
    qDate.value = o;
  });
  qGuests.addEventListener('input', function () { qGuests.value = qGuests.value.replace(/\D/g, '').slice(0, 4); });
  $('#qbar').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = 'Olá! Quero um orçamento na Casa Mirante. Evento: ' + selV.textContent + '.';
    if (qDate.value) t += ' Data: ' + qDate.value + '.';
    if (qGuests.value) t += ' Convidados: ' + qGuests.value + '.';
    demoContato();
  });
  $('#ftForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#ftMsg').value.trim();
    demoContato();
  });

  /* ---------- aparecer ao rolar ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- citação palavra por palavra ---------- */
  var qt = $('#quoteText');
  if (qt) {
    var words = qt.textContent.trim().split(/\s+/);
    qt.innerHTML = words.map(function (x) { return '<span class="w">' + x + '</span>'; }).join(' ');
  }
  var qWords = $$('.w', qt || d);

  /* ---------- peças que dependem da rolagem ---------- */
  var hero = $('#topo'), heroMedia = $('#heroMedia'), heroBody = $('#heroBody'), prog = $('#prog');
  var rooms = $('#ambientes'), roomsTrack = $('#roomsTrack'), roomsFill = $('#roomsFill');
  var band = $('#salao'), bandImg = $('#bandImg');
  var exp = $('#expPin'), expFigs = $$('.ex'), expLis = $$('#expList li'), expSt = $('.exp-st', exp);
  var quote = $('#quoteText'), vh = w.innerHeight, vw = w.innerWidth, desk = vw > 900;
  var expIdx = 0;

  function layout() {
    vh = w.innerHeight; vw = w.innerWidth; desk = vw > 900;
    if (desk) {
      var over = Math.max(0, roomsTrack.scrollWidth - vw);
      rooms.style.height = (vh + over) + 'px';
      exp.style.height = (vh * (expFigs.length * 0.85 + 0.35)) + 'px';
    } else {
      rooms.style.height = ''; exp.style.height = '';
      roomsTrack.style.transform = '';
    }
    tick();
  }

  function setExp(i) {
    if (i === expIdx) return;
    expIdx = i;
    expFigs.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    expLis.forEach(function (l, k) { l.classList.toggle('on', k === i); });
  }
  expLis.forEach(function (li, k) {
    $('button', li).addEventListener('click', function () {
      if (!desk) return;
      var r = exp.getBoundingClientRect(), top = r.top + w.scrollY, span = exp.offsetHeight - vh;
      w.scrollTo({ top: top + span * ((k + 0.5) / expFigs.length), behavior: 'smooth' });
    });
  });

  var ticking = false;
  function tick() {
    ticking = false;
    var y = w.scrollY, H = d.documentElement.scrollHeight - vh;
    prog.style.transform = 'scaleX(' + (H > 0 ? clamp(y / H, 0, 1) : 0).toFixed(4) + ')';
    hd.classList.toggle('solid', y > 40);

    /* capa: foto cresce devagar e o texto sobe e some */
    var p = clamp(y / vh, 0, 1.4);
    if (p < 1.3) {
      heroMedia.style.transform = 'scale(' + (1 + p * 0.07).toFixed(4) + ') translate3d(0,' + (p * 24).toFixed(1) + 'px,0)';
      heroBody.style.transform = 'translate3d(0,' + (-p * 46).toFixed(1) + 'px,0)';
      heroBody.style.opacity = clamp(1 - p * 1.15, 0, 1).toFixed(3);
      hero.style.visibility = '';
    } else { hero.style.visibility = 'hidden'; }

    /* ambientes: a faixa anda na horizontal enquanto a seção fica presa */
    if (desk) {
      var rs = rooms.offsetTop, rd = rooms.offsetHeight - vh;
      var t = rd > 0 ? clamp((y - rs) / rd, 0, 1) : 0;
      var over = Math.max(0, roomsTrack.scrollWidth - vw);
      roomsTrack.style.transform = 'translate3d(' + (-t * over).toFixed(1) + 'px,0,0)';
      roomsFill.style.setProperty('--f', (t * 100).toFixed(1) + '%');

      var es = exp.offsetTop + (exp.offsetParent ? 0 : 0);
      var er = exp.getBoundingClientRect();
      var span = exp.offsetHeight - vh;
      var u = span > 0 ? clamp(-er.top / span, 0, 0.9999) : 0;
      setExp(Math.floor(u * expFigs.length));
    }

    /* faixa do salão: paralaxe suave */
    var br = band.getBoundingClientRect();
    if (br.bottom > 0 && br.top < vh) {
      var bp = (br.top + br.height / 2 - vh / 2) / vh;
      bandImg.style.transform = 'translate3d(0,' + (bp * -7).toFixed(2) + '%,0) scale(1.06)';
    }

    /* citação acende palavra por palavra */
    if (qWords.length) {
      var qr = quote.getBoundingClientRect();
      var qp = clamp((vh * 0.88 - qr.top) / (vh * 0.5), 0, 1);
      var n = Math.round(qp * qWords.length);
      qWords.forEach(function (el, k) { el.classList.toggle('on', k < n); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; w.requestAnimationFrame(tick); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', layout);
  w.addEventListener('load', layout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(layout);
  layout();

  /* âncoras: rolagem suave considerando o cabeçalho */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var id = a.getAttribute('href'); if (id.length < 2) { return; }
      var el = $(id); if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + w.scrollY - (id === '#topo' ? 0 : 0);
      w.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
