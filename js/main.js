/* =========================================================
   Zrupity Construction : interactions
   ========================================================= */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Header au scroll + bouton retour en haut ---------- */
  const header = $('#header');
  const toTop = $('#to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Lien actif selon la section visible ---------- */
  const links = $$('.nav__link');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Apparition au défilement ---------- */
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => {
    // léger décalage pour les éléments d'une même grille
    const siblings = $$(':scope > .reveal', el.parentElement);
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
    revealer.observe(el);
  });

  /* ---------- Compteurs animés ---------- */
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counter = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      animateCount(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => counter.observe(el));

  /* ---------- Chantier de A à Z : étapes à défilement automatique ---------- */
  const build = $('#build');
  const buildImgs = $$('.build__img', build);
  const buildSteps = $$('.build__step', build);
  const buildBadge = $('#build-badge');
  const BUILD_DELAY = 5000;
  let current = 0;
  let timer = null;
  build.style.setProperty('--build-delay', `${BUILD_DELAY}ms`);

  const showStep = (i) => {
    current = (i + buildSteps.length) % buildSteps.length;
    buildImgs.forEach((img, k) => img.classList.toggle('is-active', k === current));
    buildSteps.forEach((s, k) => {
      const on = k === current;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-selected', String(on));
      // relance l'animation de la barre de progression
      const bar = $('.build__bar', s);
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    });
    buildBadge.textContent = `Étape ${current + 1} / ${buildSteps.length}`;
  };
  const stopAuto = () => { clearInterval(timer); timer = null; };
  const startAuto = () => {
    stopAuto();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(() => showStep(current + 1), BUILD_DELAY);
  };

  buildSteps.forEach((s, k) => s.addEventListener('click', () => { showStep(k); startAuto(); }));
  build.addEventListener('mouseenter', () => { stopAuto(); build.classList.add('is-paused'); });
  build.addEventListener('mouseleave', () => { build.classList.remove('is-paused'); showStep(current); startAuto(); });

  // ne démarre le défilement que lorsque la section est visible
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { showStep(current); startAuto(); } else stopAuto();
  }, { threshold: 0.35 }).observe(build);

  /* ---------- Vidéo slogan : lecteur sur mesure ---------- */
  const player = $('#player');
  const video = $('#brand-video');
  const fill = $('#player-fill');
  const progress = $('#player-progress');
  const time = $('#player-time');
  const soundBtn = $('#player-sound');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = false;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const syncState = () => player.classList.toggle('is-paused', video.paused);
  const toggle = () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  };

  video.addEventListener('play', syncState);
  video.addEventListener('pause', syncState);
  video.addEventListener('timeupdate', () => {
    const p = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    fill.style.width = `${p}%`;
    progress.setAttribute('aria-valuenow', String(Math.round(p)));
    time.textContent = fmt(video.currentTime);
  });

  video.addEventListener('click', toggle);
  $('#player-big').addEventListener('click', toggle);
  $('#player-play').addEventListener('click', toggle);

  const seek = (clientX) => {
    const r = progress.getBoundingClientRect();
    if (video.duration) video.currentTime = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * video.duration;
  };
  progress.addEventListener('click', (e) => seek(e.clientX));
  progress.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') video.currentTime = Math.min(video.currentTime + 2, video.duration || 0);
    if (e.key === 'ArrowLeft') video.currentTime = Math.max(video.currentTime - 2, 0);
  });

  soundBtn.addEventListener('click', () => {
    const on = video.muted;
    video.muted = !on;
    if (on) { video.currentTime = 0; userPaused = false; video.play().catch(() => {}); }
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
  });

  $('#player-full').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (player.requestFullscreen) player.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
  });

  // lecture muette automatique quand la vidéo est visible, sauf si le visiteur l'a mise en pause
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduceMotion && !userPaused) video.play().catch(() => {});
    else if (!e.isIntersecting) video.pause();
  }, { threshold: 0.45 }).observe(video);

  // léger zoom de la vidéo pendant le défilement
  if (!reduceMotion) {
    const stage = $('#brand-stage');
    let ticking = false;
    const zoom = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh - r.top) / (vh * 0.75), 0), 1);
      player.style.setProperty('--s', (0.86 + 0.14 * p).toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(zoom); }
    }, { passive: true });
    zoom();
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCap = $('#lightbox-caption');
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); };
  const openLb = (src, title) => {
    lbImg.src = src;
    lbImg.alt = title;
    lbCap.textContent = title;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  };
  $$('[data-lightbox]').forEach((el) => el.addEventListener('click', () => {
    if (el.classList.contains('build__stage')) {
      const step = buildSteps[current];
      openLb(buildImgs[current].src, `${$('.build__num', step).textContent}. ${$('strong', step).textContent}`);
    } else {
      openLb(el.dataset.img, $('strong', el).textContent);
    }
  }));
  $('#lightbox-close').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeLb();
    setMenu(false);
  });

  /* ---------- Formulaire de contact ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    $$('[required]', form).forEach((input) => {
      const ok = input.value.trim() !== '' && input.checkValidity();
      input.closest('.field').classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });
    status.className = 'form__status';
    if (!valid) {
      status.textContent = 'Merci de compléter correctement les champs obligatoires.';
      status.classList.add('is-error');
      return;
    }
    // À brancher sur un service d'envoi (Formspree, backend PHP, etc.)
    status.textContent = 'Site de démonstration : le formulaire fonctionne, mais aucun message n’est réellement envoyé.';
    status.classList.add('is-ok');
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
