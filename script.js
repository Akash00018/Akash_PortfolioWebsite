const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = document.querySelectorAll(".nav-link");
const currentYear = document.querySelector("[data-current-year]");
const revealItems = document.querySelectorAll(".reveal");
const caseModal = document.querySelector("[data-case-modal]");
const openCaseStudy = document.querySelector("[data-open-case-study]");
const closeCaseStudy = document.querySelector("[data-close-case-study]");
const contactForm = document.querySelector("[data-contact-form]");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (header) {
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();
}

if (navToggle && navMenu && header) {
  const setMenuState = (isOpen, restoreFocus = false) => {
    navMenu.classList.toggle("is-open", isOpen);
    header.classList.toggle("menu-active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

    if (restoreFocus) navToggle.focus();
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
    setMenuState(isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false, true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && navToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
    }
  });
}

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("has-reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
  );

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
}

if (caseModal && openCaseStudy) {
  openCaseStudy.addEventListener("click", () => {
    if (typeof caseModal.showModal === "function") {
      caseModal.showModal();
    } else {
      caseModal.setAttribute("open", "");
    }
  });

  if (closeCaseStudy) {
    closeCaseStudy.addEventListener("click", () => {
      if (typeof caseModal.close === "function") {
        caseModal.close();
      } else {
        caseModal.removeAttribute("open");
        openCaseStudy.focus();
      }
    });
  }

  caseModal.addEventListener("click", (event) => {
    if (event.target !== caseModal) return;
    if (typeof caseModal.close === "function") {
      caseModal.close();
    } else {
      caseModal.removeAttribute("open");
      openCaseStudy.focus();
    }
  });
}

if (contactForm) {
  const formStatus = contactForm.querySelector("[data-form-status]");
  const validators = {
    name(value) {
      return value.trim().length >= 2 ? "" : "Please enter your name.";
    },
    email(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address.";
    },
    subject(value) {
      return value.trim().length >= 3 ? "" : "Please enter a subject.";
    },
    message(value) {
      return value.trim().length >= 20 ? "" : "Please write at least 20 characters.";
    }
  };

  const setError = (fieldName, message) => {
    const field = contactForm.querySelector(`[name="${fieldName}"]`);
    const error = contactForm.querySelector(`[data-error-for="${fieldName}"]`);
    if (!field || !error) return;

    error.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
  };

  const setStatus = (message, state = "") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.toggle("is-error", state === "error");
  };

  let hasSubmitted = false;

  contactForm.addEventListener("input", (event) => {
    if (!hasSubmitted || !event.target.name || !validators[event.target.name]) return;
    const fieldName = event.target.name;
    setError(fieldName, validators[fieldName](event.target.value));
    setStatus("");
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmitted = true;
    setStatus("");

    const values = Object.fromEntries(new FormData(contactForm).entries());
    const errors = Object.keys(validators).map((fieldName) => {
      const message = validators[fieldName](values[fieldName] || "");
      setError(fieldName, message);
      return { fieldName, message };
    });
    const firstInvalid = errors.find((error) => error.message);

    if (firstInvalid) {
      setStatus("Please fix the highlighted fields.", "error");
      contactForm.querySelector(`[name="${firstInvalid.fieldName}"]`)?.focus();
      return;
    }

    const subject = encodeURIComponent(values.subject.trim());
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\n\n${values.message.trim()}`
    );

    setStatus("Your email app should open with a draft. Review and send the message there.");
    window.location.href = `mailto:akashdevganiya5@gmail.com?subject=${subject}&body=${body}`;
  });
}
