/* ============================================
   Developed By Akia — main.js
   ============================================ */

(function () {
  'use strict';

  /* ----------------------------------------
     Utility: respect reduced motion
  ---------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------
     Navigation: scroll behavior
  ---------------------------------------- */
  const nav = document.getElementById('siteNav');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ----------------------------------------
     Mobile navigation
  ---------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');

  if (navToggle && navOverlay) {
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    function openNav() {
      navOverlay.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      const firstFocusable = navOverlay.querySelector(focusableSelectors);
      if (firstFocusable) firstFocusable.focus();
    }

    function closeNav() {
      navOverlay.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }

    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navOverlay.classList.contains('is-open')) {
        closeNav();
      }
    });

    // Focus trap
    navOverlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(navOverlay.querySelectorAll(focusableSelectors));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Close when overlay link clicked
    navOverlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* ----------------------------------------
     Active nav state
  ---------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop() || 'index.html';
    if (linkFile === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ----------------------------------------
     Scroll reveal (IntersectionObserver)
  ---------------------------------------- */
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(function (el, i) {
        el.style.transitionDelay = ((i % 3) * 0.1) + 's';
        revealObserver.observe(el);
      });
    }
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* ----------------------------------------
     FAQ accordion
  ---------------------------------------- */
  document.querySelectorAll('.faq-item__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      document.querySelectorAll('.faq-item__btn').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.faq-item__answer').forEach(function (a) {
        a.classList.remove('is-open');
      });

      // Open clicked (unless it was already open)
      if (!isExpanded && answer) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
      }
    });
  });

  /* ----------------------------------------
     Portfolio filter
  ---------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('[data-filter]');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      projectCards.forEach(function (card) {
        const cardFilter = card.getAttribute('data-filter');
        if (filter === 'all' || cardFilter === filter) {
          card.removeAttribute('hidden');
          card.style.display = '';
        } else {
          card.setAttribute('hidden', '');
          card.style.display = 'none';
        }
      });
    });
  });

  /* ----------------------------------------
     Contact form: accessible validation
  ---------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const ariaLiveRegion = document.getElementById('ariaLive');

  function announce(message) {
    if (!ariaLiveRegion) return;
    ariaLiveRegion.textContent = '';
    setTimeout(function () {
      ariaLiveRegion.textContent = message;
    }, 50);
  }

  function showError(input, errorEl, message) {
    input.classList.add('is-error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
  }

  function clearError(input, errorEl) {
    input.classList.remove('is-error');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (contactForm) {
    // Live validation on blur
    contactForm.querySelectorAll('[data-required]').forEach(function (field) {
      const errorEl = document.getElementById(field.getAttribute('aria-describedby'));
      field.addEventListener('blur', function () {
        if (!field.value.trim()) {
          const label = field.closest('.form-group').querySelector('.form-label').textContent.replace('*', '').trim();
          showError(field, errorEl, label + ' is required.');
        } else if (field.type === 'email' && !validateEmail(field.value)) {
          showError(field, errorEl, 'Please enter a valid email address.');
        } else {
          clearError(field, errorEl);
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let hasErrors = false;
      const errors = [];

      contactForm.querySelectorAll('[data-required]').forEach(function (field) {
        const errorEl = document.getElementById(field.getAttribute('aria-describedby'));
        if (!field.value.trim()) {
          const label = field.closest('.form-group').querySelector('.form-label').textContent.replace('*', '').trim();
          showError(field, errorEl, label + ' is required.');
          errors.push(label);
          hasErrors = true;
        } else if (field.type === 'email' && !validateEmail(field.value)) {
          showError(field, errorEl, 'Please enter a valid email address.');
          errors.push('Email');
          hasErrors = true;
        } else {
          clearError(field, errorEl);
        }
      });

      if (hasErrors) {
        announce('There are ' + errors.length + ' errors in the form. Please fix: ' + errors.join(', ') + '.');
        const firstError = contactForm.querySelector('.is-error');
        if (firstError) firstError.focus();
        return;
      }

      // Netlify handles actual submission — show success state
      contactForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('is-visible');
        formSuccess.setAttribute('tabindex', '-1');
        formSuccess.focus();
        announce('Your message was sent. I\'ll be in touch within 2 business days.');
      }
    });
  }

})();
