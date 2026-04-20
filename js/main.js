(function () {
  'use strict';

  // NAV SCROLL
  const header = document.getElementById('site-header');
  function updateNav() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }
  }
  if (header) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // MOBILE NAV
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (mobileClose) mobileClose.focus();
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (hamburger) hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener('click', openNav);
  if (mobileClose) mobileClose.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeNav();
    }
  });

  // FOCUS TRAP IN MOBILE NAV
  if (mobileNav) {
    mobileNav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = mobileNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ACTIVE NAV STATE
  const currentPath = window.location.pathname;
  document.querySelectorAll('.site-nav a, .mobile-nav-overlay a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const isHome = (currentPath === '/' || currentPath === '/index.html') && href === '/';
    const isMatch = href !== '/' && href !== '#' && currentPath.includes(href.replace('.html', ''));
    if (isHome || isMatch) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // SCROLL ANIMATIONS
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    const animStyle = document.createElement('style');
    animStyle.textContent = '.animate-in{opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease}.animate-in.visible{opacity:1;transform:translateY(0)}';
    document.head.appendChild(animStyle);
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.card, .pull-quote, h2, h3, .section-label').forEach(function (el) {
      el.classList.add('animate-in');
      observer.observe(el);
    });
  }

  // PORTFOLIO FILTER
  const filterBtns = document.querySelectorAll('[data-filter]');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-filter') === 'all' ? 'true' : 'false');
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        document.querySelectorAll('[data-category]').forEach(function (card) {
          card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? '' : 'none';
        });
      });
    });
  }

  // FAQ ACCORDION
  document.querySelectorAll('.faq-trigger').forEach(function (trigger) {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (panel) panel.hidden = true;
    trigger.addEventListener('click', function () {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-trigger').forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = true;
        const icon = t.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      });
      if (!expanded) {
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.hidden = false;
        const icon = trigger.querySelector('.faq-icon');
        if (icon) icon.textContent = '×';
      }
    });
  });

  // CONTACT FORM
  const form = document.querySelector('form[data-netlify]');
  if (form) {
    const announcer = document.getElementById('form-announcer');

    form.addEventListener('submit', function (e) {
      let valid = true;
      form.querySelectorAll('[aria-required="true"]').forEach(function (field) {
        const errorId = field.getAttribute('aria-describedby');
        const errorEl = errorId ? document.getElementById(errorId) : null;
        const label = (field.labels && field.labels[0]) ? field.labels[0].textContent.trim() : 'This field';
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (errorEl) errorEl.textContent = label + ' is required.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
        } else {
          field.setAttribute('aria-invalid', 'false');
          if (errorEl) errorEl.textContent = '';
        }
      });

      if (!valid) {
        e.preventDefault();
        if (announcer) announcer.textContent = 'Please fix the errors below before submitting.';
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
      }
    });

    // Clear errors on input
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        const errorId = field.getAttribute('aria-describedby');
        const errorEl = errorId ? document.getElementById(errorId) : null;
        if (field.value.trim()) {
          field.setAttribute('aria-invalid', 'false');
          if (errorEl) errorEl.textContent = '';
        }
      });
    });
  }

  // SMOOTH SCROLL FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

})();
