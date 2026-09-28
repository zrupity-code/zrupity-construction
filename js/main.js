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
  const lbOpenFrom = (el) => {
    if (el.classList.contains('build__stage')) {
      const step = buildSteps[current];
      openLb(buildImgs[current].src, `${$('.build__num', step).textContent}. ${$('strong', step).textContent}`);
    } else {
      openLb(el.dataset.img, el.dataset.caption || $('strong', el).textContent);
    }
  };
  $$('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => lbOpenFrom(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpenFrom(el); }
    });
  });
  $('#lightbox-close').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

  /* ---------- Détail d'un métier ---------- */
  const SERVICES = {
    maconnerie: {
      eyebrow: 'Gros œuvre',
      title: 'Maçonnerie & gros œuvre',
      img: 'images/metier-maconnerie.jpg',
      intro: "Le gros œuvre, c'est tout ce qui fait tenir la maison debout. Nos maçons réalisent les fondations, les murs et les dalles en suivant les plans et l'étude de sol, avec des contrôles à chaque étape avant de passer à la suivante.",
      list: ['Fondations, semelles et longrines', 'Murs porteurs en parpaing, brique ou béton cellulaire', 'Dalles, planchers et chapes', 'Béton armé : poteaux, poutres, linteaux', 'Ouverture de murs porteurs avec pose de poutre', 'Murets, murs de clôture et de soutènement'],
      facts: [['Délai indicatif', '3 à 8 semaines selon le projet'], ['Garantie', 'Décennale sur la structure'], ['Devis', 'Gratuit, sous 48 h après la visite']],
      projet: 'Gros œuvre',
    },
    toiture: {
      eyebrow: 'Charpente et couverture',
      title: 'Toiture',
      img: 'images/metier-toiture.jpg',
      intro: "Une toiture en bon état protège toute la maison. Nous intervenons en neuf comme en rénovation : diagnostic de la charpente, remplacement des tuiles ou ardoises, étanchéité des toits plats et évacuation des eaux de pluie.",
      list: ['Charpente traditionnelle et fermettes', 'Couverture tuiles, ardoises et bac acier', 'Étanchéité des toitures terrasses', 'Zinguerie : gouttières, descentes, noues', 'Isolation de toiture et sarking', 'Pose de fenêtres de toit et réparations après tempête'],
      facts: [['Délai indicatif', '1 à 4 semaines'], ['Garantie', 'Décennale sur couverture et étanchéité'], ['Diagnostic', 'Inspection de toiture offerte']],
      projet: 'Toiture',
    },
    amenagement: {
      eyebrow: 'Second œuvre',
      title: 'Aménagement intérieur',
      img: 'images/metier-amenagement.jpg',
      intro: "Une fois les murs montés, nous rendons les pièces agréables à vivre : cloisons, isolation, sols et finitions. Vous choisissez les matériaux avec nous, et un seul chef d'équipe coordonne tous les artisans.",
      list: ['Cloisons, doublages et faux plafonds en plaques de plâtre', 'Isolation thermique et phonique', 'Enduits, peinture et revêtements muraux', 'Carrelage, faïence et parquet', 'Création de salles de bains et cuisines', 'Aménagement de combles et de sous-sols'],
      facts: [['Délai indicatif', '2 à 6 semaines par étage'], ['Garantie', 'Parfait achèvement 1 an, biennale 2 ans'], ['Conseil', 'Choix des matériaux en showroom']],
      projet: 'Aménagement intérieur',
    },
    terrassement: {
      eyebrow: 'Préparation du terrain',
      title: 'Terrassement',
      img: 'images/metier-terrassement.jpg',
      intro: "Avant de construire, il faut un terrain propre, plat et raccordé. Nos équipes et nos engins préparent la parcelle, creusent les fondations et amènent l'eau, l'électricité et l'assainissement jusqu'à la maison.",
      list: ['Décapage, nivellement et remblaiement', 'Fouilles pour fondations et sous-sols', 'Tranchées pour réseaux (eau, électricité, fibre)', 'Viabilisation et raccordement au tout-à-l\'égout', 'Assainissement individuel', 'Drainage, accès et plateformes de chantier'],
      facts: [['Délai indicatif', '1 à 3 semaines'], ['Matériel', 'Pelles et engins de notre propre parc'], ['Études', 'Coordination avec l\'étude de sol']],
      projet: 'Terrassement',
    },
    renovation: {
      eyebrow: 'Rénovation',
      title: 'Rénovation',
      img: 'images/equipe-enduit.jpg',
      intro: "Redonner vie à un bâtiment ancien, agrandir sa maison ou réduire ses factures d'énergie : nous étudions l'existant, vous proposons les travaux utiles et les réalisons en limitant la gêne si vous vivez sur place.",
      list: ['Rénovation complète de maisons et appartements', 'Extension de plain-pied ou à étage', 'Surélévation', 'Rénovation énergétique : isolation, ravalement, menuiseries', 'Mise aux normes électriques et accessibilité', 'Réhabilitation de bâtiments anciens'],
      facts: [['Délai indicatif', 'Selon l\'ampleur, planning remis avec le devis'], ['Aides', 'Accompagnement pour les aides à la rénovation'], ['Chantier', 'Possible en site occupé']],
      projet: 'Rénovation',
    },
    neuve: {
      eyebrow: 'Clés en main',
      title: 'Construction neuve',
      img: 'images/etape-4-maison-finie.jpg',
      intro: "De la première esquisse à la remise des clés, nous construisons votre maison ou votre local professionnel. Un interlocuteur unique suit le projet, les délais et le budget sont fixés dès le départ.",
      list: ['Maisons individuelles sur plan ou sur mesure', 'Locaux professionnels et commerces', 'Aide au dépôt du permis de construire', 'Gestion de tous les corps de métier', 'Réunions de chantier et comptes rendus réguliers', 'Réception des travaux et levée des réserves'],
      facts: [['Délai indicatif', '8 à 12 mois pour une maison'], ['Garanties', 'Décennale, biennale et parfait achèvement'], ['Suivi', 'Un conducteur de travaux dédié']],
      projet: 'Construction neuve',
    },
    'tous-travaux': {
      eyebrow: 'Interlocuteur unique',
      title: 'Tous travaux du bâtiment',
      img: 'images/showroom.jpg',
      intro: "Vous avez un projet qui mélange plusieurs métiers ? Nous coordonnons l'ensemble des artisans pour vous : un seul contact, un seul devis, un seul planning, et personne à relancer.",
      list: ['Coordination de tous les corps de métier', 'Planning global et suivi du chantier', 'Menuiseries intérieures et extérieures', 'Électricité, plomberie et chauffage via nos partenaires', 'Aménagements extérieurs : terrasses, clôtures, allées', 'Dépannages et petits travaux'],
      facts: [['Contact', 'Un chef de projet unique'], ['Devis', 'Un seul devis détaillé par poste'], ['Garantie', 'Décennale sur l\'ensemble des travaux']],
      projet: 'Autre',
    },
  };

  const sm = $('#service-modal');
  const smMedia = $('#sm-media');
  const projetSelect = $('#projet');
  let smCurrent = null;
  let smReturnFocus = null;

  const openService = (key, trigger) => {
    const s = SERVICES[key];
    if (!s) return;
    smCurrent = s;
    smReturnFocus = trigger;
    smMedia.style.backgroundImage = `url('${s.img}'), var(--photo-fallback)`;
    smMedia.setAttribute('aria-label', `Agrandir la photo : ${s.title}`);
    $('#sm-eyebrow').textContent = s.eyebrow;
    $('#sm-title').textContent = s.title;
    $('#sm-intro').textContent = s.intro;
    $('#sm-list').innerHTML = '';
    s.list.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      $('#sm-list').appendChild(li);
    });
    $('#sm-facts').innerHTML = '';
    s.facts.forEach(([label, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      row.append(dt, dd);
      $('#sm-facts').appendChild(row);
    });
    $('.service-modal__panel', sm).scrollTop = 0;
    sm.classList.add('is-open');
    sm.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    $('#sm-close').focus();
  };
  const closeService = (restoreFocus = true) => {
    if (!sm.classList.contains('is-open')) return;
    sm.classList.remove('is-open');
    sm.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (restoreFocus && smReturnFocus) smReturnFocus.focus({ preventScroll: true });
  };

  $$('[data-service]').forEach((card) => {
    card.addEventListener('click', () => openService(card.dataset.service, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openService(card.dataset.service, card); }
    });
  });
  $('#sm-close').addEventListener('click', () => closeService());
  sm.addEventListener('click', (e) => { if (e.target === sm) closeService(); });
  smMedia.addEventListener('click', () => { if (smCurrent) openLb(smCurrent.img, smCurrent.title); });
  $('#sm-back').addEventListener('click', () => {
    closeService(false);
    $('#services').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  // le bouton devis préremplit le type de projet puis descend au formulaire
  $('#sm-cta').addEventListener('click', () => {
    if (smCurrent) projetSelect.value = smCurrent.projet;
    closeService(false);
    setTimeout(() => $('#nom')?.focus({ preventScroll: true }), 700);
  });

  // garde le focus clavier à l'intérieur de la fenêtre ouverte
  sm.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button, a[href]', sm);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // ferme d'abord la photo agrandie si elle est par-dessus la fenêtre
    if (lb.classList.contains('is-open')) { closeLb(); return; }
    closeService();
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
