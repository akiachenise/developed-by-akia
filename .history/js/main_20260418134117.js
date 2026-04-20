(function () {
  "use strict";

  // ==========================================
  // NAV SCROLL
  // ==========================================
  const header = document.getElementById("site-header");

  function updateNav() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  if (header) {
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();
  }

  // ==========================================
  // MOBILE NAV
  // ==========================================
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileClose = document.querySelector(".mobile-nav-close");

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (mobileClose) mobileClose.focus();
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (hamburger) hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener("click", openNav);
  if (mobileClose) mobileClose.addEventListener("click", closeNav);

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mobileNav &&
      mobileNav.classList.contains("open")
    ) {
      closeNav();
    }
  });

  // ==========================================
  // ACTIVE NAV STATE
  // ==========================================
  const currentPath = window.location.pathname;

  document
    .querySelectorAll(".site-nav a, .mobile-nav-overlay a")
    .forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const isHome =
        (currentPath === "/" || currentPath === "/index.html") && href === "/";
      const isMatch =
        href !== "/" && currentPath.includes(href.replace(".html", ""));
      if (isHome || isMatch) {
        link.setAttribute("aria-current", "page");
      }
    });

  // ==========================================
  // SCROLL ANIMATIONS
  // ==========================================
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion) {
    const style = document.createElement("style");
    style.textContent = `
      .animate-in {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .animate-in.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".card, .pull-quote, h2, h3").forEach((el) => {
      el.classList.add("animate-in");
      observer.observe(el);
    });
  }

  // ==========================================
  // PORTFOLIO FILTER
  // ==========================================
  const filterBtns = document.querySelectorAll("[data-filter]");

  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.getAttribute("data-filter") === "all" ? "true" : "false",
      );
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        document.querySelectorAll("[data-category]").forEach((card) => {
          card.style.display =
            filter === "all" || card.getAttribute("data-category") === filter
              ? ""
              : "none";
        });
      });
    });
  }

  // ==========================================
  // FAQ ACCORDION
  // ==========================================
  document.querySelectorAll(".faq-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-trigger").forEach((t) => {
        t.setAttribute("aria-expanded", "false");
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = true;
      });
      if (!expanded) {
        trigger.setAttribute("aria-expanded", "true");
        const panel = document.getElementById(
          trigger.getAttribute("aria-controls"),
        );
        if (panel) panel.hidden = false;
      }
    });
  });

  // ==========================================
  // CONTACT FORM VALIDATION
  // ==========================================
  const form = document.querySelector("form[data-netlify]");

  if (form) {
    form.addEventListener("submit", (e) => {
      let valid = true;

      form.querySelectorAll('[aria-required="true"]').forEach((field) => {
        const errorId = field.getAttribute("aria-describedby");
        const errorEl = errorId ? document.getElementById(errorId) : null;
        const label =
          field.labels && field.labels[0]
            ? field.labels[0].textContent.trim()
            : "This field";

        if (!field.value.trim()) {
          valid = false;
          field.setAttribute("aria-invalid", "true");
          if (errorEl) errorEl.textContent = `${label} is required.`;
        } else if (
          field.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
        ) {
          valid = false;
          field.setAttribute("aria-invalid", "true");
          if (errorEl)
            errorEl.textContent = "Please enter a valid email address.";
        } else {
          field.setAttribute("aria-invalid", "false");
          if (errorEl) errorEl.textContent = "";
        }
      });

      if (!valid) {
        e.preventDefault();
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }
})();
