const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setupMobileNav() {
  const toggle = $(".nav__toggle");
  const links = $("#nav-links");
  if (!toggle || !links) return;

  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.contains("is-open");
    setOpen(!open);
  });

  $$("#nav-links a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!links.classList.contains("is-open")) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function animateCounts() {
  const els = $$("[data-count]");
  if (!els.length) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) {
    els.forEach((el) => (el.textContent = String(el.dataset.count ?? "")));
    return;
  }

  const fmt = (n) => {
    const target = Number(n);
    if (!Number.isFinite(target)) return String(n);
    const hasDecimal = String(n).includes(".");
    return hasDecimal ? target.toFixed(1) : String(Math.round(target));
  };

  const animate = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    const start = 0;
    const duration = 900;
    const hasDecimal = String(el.dataset.count).includes(".");
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = start + (target - start) * eased;
      el.textContent = hasDecimal ? value.toFixed(1) : String(Math.round(value));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(el.dataset.count);
    };

    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        animate(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  els.forEach((el) => obs.observe(el));
}

function setupYear() {
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function setupLeadForm() {
  const form = $("#lead-form");
  const status = $(".form__status");
  if (!form || !status) return;

  const setStatus = (msg, ok = true) => {
    status.textContent = msg;
    status.style.color = ok ? "rgba(233,238,252,.92)" : "rgba(248,113,113,.95)";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const goal = String(data.get("goal") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !goal || !message) {
      setStatus("Please fill in your name, email, goal, and message.", false);
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setStatus("Please enter a valid email address.", false);
      return;
    }

    // No backend yet: simulate a successful send.
    form.querySelectorAll("input,select,textarea,button").forEach((el) => (el.disabled = true));
    setStatus("Sending…");

    window.setTimeout(() => {
      setStatus("Thanks — we received your request. We’ll email you within 1 business day.");
      form.reset();
      form.querySelectorAll("input,select,textarea,button").forEach((el) => (el.disabled = false));
    }, 700);
  });
}

setupMobileNav();
setupYear();
animateCounts();
setupLeadForm();
