/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

'use strict';

/* ── Section Loader ───────────────────────────────────────── */
(async function loadSections() {
  const app = document.getElementById('app');
  const sectionFiles = [
    'sections/nav.html',
    'sections/hero.html',
    'sections/about.html',
    'sections/skills.html',
    'sections/experience.html',
    'sections/activities.html',
    'sections/contact.html',
    'sections/footer.html',
  ];

  const fragments = await Promise.all(
    sectionFiles.map(file => fetch(file).then(r => r.text()))
  );
  app.innerHTML = fragments.join('\n');

  // After all sections are loaded, initialize everything
  initAll();
})();

function initAll() {

/* ── 0. i18n Language Switcher ────────────────────────────── */
(function initI18n() {
  const STORAGE_KEY = 'portfolio-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  // Typed effect instance reference — reset on lang change
  let typedRestart = null;

  function applyLang(lang) {
    const t = I18N[lang];
    if (!t) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // html[lang]
    document.getElementById('htmlRoot').setAttribute('lang', t.htmlLang);

    // <title>
    document.title = t.pageTitle;

    // All [data-i18n] elements — textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // Placeholder attributes [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });

    // aria-label on hamburger
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
      const isOpen = hamburger.classList.contains('open');
      hamburger.setAttribute('aria-label', isOpen ? t.menuClose : t.menuOpen);
    }

    // Update active lang button (both desktop + mobile)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Restart typed text with new phrases
    if (typedRestart) typedRestart(t.typedPhrases);
  }

  // Wire up all lang buttons (desktop + mobile)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // Expose restart hook for typed effect
  window.__setTypedRestart = function(fn) { typedRestart = fn; };

  // Apply on load
  applyLang(currentLang);
})();

/* ── 1. Custom Cursor ─────────────────────────────────────── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let rafId = null;

  // Directly move the dot cursor
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left    = mouseX + 'px';
    cursor.style.top     = mouseY + 'px';
    // Show on first move
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });

  // Smooth-follow for the ring
  function animateFollower() {
    const ease = 0.12;
    followerX += (mouseX - followerX) * ease;
    followerY += (mouseY - followerY) * ease;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover state on interactive elements
  const interactiveSelector = 'a, button, [role="button"], input, textarea, .project-card, .filter-btn, .timeline__card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Click state
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // Hide when cursor leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '1';
  });
})();


/* ── 2. Navigation ────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const navLinks    = document.querySelectorAll('.nav__link');

  // Scroll → add .scrolled class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');

  const updateActiveLink = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav__link[href="#${id}"]`);
      if (!link) return;
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Smooth scroll for all internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ── 3. Scroll Reveal ─────────────────────────────────────── */
(function initReveal() {
  // Exclude hero reveals (they animate on load, not scroll)
  const elements = Array.from(document.querySelectorAll('.reveal')).filter(
    el => !el.closest('.hero')
  );
  if (!elements.length) return;

  // Stagger siblings inside the same parent
  document.querySelectorAll('.skills__grid, .projects__grid, .about__grid, .contact__grid, .about__info-grid').forEach(parent => {
    let delay = 0;
    parent.querySelectorAll(':scope > .reveal').forEach(child => {
      child.style.transitionDelay = delay + 's';
      delay += 0.12;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ── 4. Typed Text Effect ─────────────────────────────────── */
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;

  let phrases    = (typeof I18N !== 'undefined') ? I18N['en'].typedPhrases : ['Trilingual Communicator'];
  let phraseIdx  = 0;
  let charIdx    = 0;
  let isDeleting = false;
  let timerId    = null;

  const TYPING_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER  = 2000;
  const PAUSE_BEFORE = 400;

  // Create cursor element once
  const cursorEl = document.createElement('span');
  cursorEl.className = 'typed-cursor';
  el.after(cursorEl);

  function type() {
    const current = phrases[phraseIdx];
    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? DELETE_SPEED : TYPING_SPEED;

    if (!isDeleting && charIdx === current.length) {
      delay = PAUSE_AFTER;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      delay      = PAUSE_BEFORE;
    }
    timerId = setTimeout(type, delay);
  }

  // Expose restart hook so i18n switcher can reset phrases
  if (typeof window.__setTypedRestart === 'function') {
    window.__setTypedRestart(function(newPhrases) {
      clearTimeout(timerId);
      phrases    = newPhrases;
      phraseIdx  = 0;
      charIdx    = 0;
      isDeleting = false;
      el.textContent = '';
      timerId = setTimeout(type, PAUSE_BEFORE);
    });
  }

  type();
})();


/* ── 5. Counter Animation ─────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.hero__stat-number[data-count]');
  if (!counters.length) return;

  const DURATION = 2000;

  function animateCounter(el) {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '+';   // GPA → ".32", 나머지 → "+"
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + (progress < 1 ? '' : suffix);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ── 6. Skill Bars ────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar   = entry.target;
      const fill  = bar.querySelector('.skill-bar__fill');
      if (!fill) return;
      const width = fill.dataset.width;
      fill.style.setProperty('--width', width + '%');
      // Small delay so the CSS transition fires after width is set
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.classList.add('animated');
          fill.style.width = width + '%';
        });
      });
      observer.unobserve(bar);
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
})();


/* ── 7. Hero Floating Particles ──────────────────────────── */
(function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'hero__particle';

    const size     = Math.random() * 4 + 2;
    const left     = Math.random() * 100;
    const duration = Math.random() * 14 + 10;
    const delay    = Math.random() * -20;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
})();


/* ── 8. Project Filter ────────────────────────────────────── */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        const show     = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          card.style.opacity   = '0';
          card.style.transform = 'translateY(24px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity .4s ease, transform .4s ease';
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            });
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ── 9. (Contact Form removed — replaced with Gmail button) ── */


/* ── 10. Parallax Scroll Effect ──────────────────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero__container');
  if (!hero) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.scrollY;
    const opacity  = Math.max(1 - scrolled / 600, 0);
    const translateY = scrolled * 0.4;

    hero.style.transform = `translateY(${translateY}px)`;
    hero.style.opacity   = opacity;

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ── 11. Timeline Card Reveal ─────────────────────────────── */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.3 });

  items.forEach((item, i) => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `opacity .6s ease ${i * 0.15}s, transform .6s ease ${i * 0.15}s`;
    observer.observe(item);
  });
})();

/* ── 12. Prevent FOUC / Initialize ───────────────────────── */
document.body.style.opacity = '1';

console.log('%c박규리 (Park Gyuri) — Portfolio', 'font-size:14px; font-weight:bold; color:#2563eb;');
console.log('%c🌏 고려대 일어일문학과 · JLPT N1 · TOEIC 900', 'font-size:12px; color:#64748b;');

} // end initAll
