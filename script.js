gsap.registerPlugin(ScrollTrigger);

/* ===================== SPLIT TEXT INTO VISUAL LINES ===================== */
function splitIntoLines(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((word) => `<span class="split-word">${word}&nbsp;</span>`)
    .join("");

  const wordEls = [...el.querySelectorAll(".split-word")];
  const lines = [];
  let currentTop = null;
  let currentLine = [];

  wordEls.forEach((word) => {
    const top = word.offsetTop;
    if (currentTop === null) currentTop = top;

    if (Math.abs(top - currentTop) > 1) {
      lines.push(currentLine);
      currentLine = [];
      currentTop = top;
    }
    currentLine.push(word);
  });
  if (currentLine.length) lines.push(currentLine);

  el.innerHTML = "";
  lines.forEach((line) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    const inner = document.createElement("span");
    inner.className = "line-inner";
    line.forEach((word) => inner.appendChild(word));
    mask.appendChild(inner);
    el.appendChild(mask);
  });

  return [...el.querySelectorAll(".line-inner")];
}

/* ===================== SMOOTH SCROLL (Lenis) ===================== */
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ===================== HERO LINES REVEAL (ON LOAD) ===================== */
const heroReveal = gsap.timeline({ delay: 0.2 });

heroReveal
  .to(".line-title", { y: "0%", duration: 1.1, ease: "power4.out" })
  .to(
    ".line-subtitle",
    { y: "0%", duration: 1.1, ease: "power4.out" },
    "<+0.12",
  )
  .to(".line-avail", { y: "0%", duration: 1.1, ease: "power4.out" }, "<+0.12");

/* ===================== HERO PIN + STUDIO DARKEN ===================== */
const heroInner = document.querySelector(".hero-inner");
const heroOverlay = document.querySelector(".hero-overlay");

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: `+=${window.innerHeight * 2}px`,
  pin: true,
  pinSpacing: false,
});

ScrollTrigger.create({
  trigger: ".studio",
  start: "top bottom",
  end: "top top",
  scrub: true,
  onUpdate: (self) => {
    const exitProgress = self.progress;
    gsap.set(heroInner, { y: `${-25 * exitProgress}%` });
    gsap.set(heroOverlay, { opacity: exitProgress });
  },
});

/* ===================== FILL TEXT (ABOUT PARAGRAPHS) ===================== */
const fillTargets = gsap.utils.toArray(".js-fill > span");

if (
  fillTargets.length &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const fillTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".text",
      start: "top 85%",
      end: "bottom 45%",
      scrub: true,
    },
  });

  fillTargets.forEach((target) => {
    fillTimeline.to(target, {
      backgroundSize: "200% 200%",
      ease: "none",
    });
  });
}

/* ===================== NAVBAR COLOR ON DARK SECTION ===================== */
const header = document.querySelector(".page-header");

ScrollTrigger.create({
  trigger: ".studio",
  start: "top top",
  end: "bottom top",
  onEnter: () => header.classList.add("is-dark"),
  onLeave: () => header.classList.remove("is-dark"),
  onEnterBack: () => header.classList.add("is-dark"),
  onLeaveBack: () => header.classList.remove("is-dark"),
});

/* ===================== FAQ ===================== */
class FAQAccordion {
  constructor(selector) {
    this.accordion = document.querySelector(selector);

    if (!this.accordion) return;

    this.items = [...this.accordion.querySelectorAll(".faq__item")];

    this.init();
  }

  init() {
    this.items.forEach((item) => {
      const button = item.querySelector(".faq__trigger");
      const answer = item.querySelector(".faq__content p");

      if (answer) {
        item.lines = splitIntoLines(answer);
        gsap.set(item.lines, { y: "110%" });
      }

      button?.addEventListener("click", () => {
        this.toggle(item);
      });
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.updateOpenPanels();
    });

    this.items.forEach((item) => {
      const content = item.querySelector(".faq__content");

      if (content) {
        this.resizeObserver.observe(content);
      }
    });
  }

  toggle(item) {
    const isOpen = item.classList.contains("is-open");

    this.items.forEach((currentItem) => {
      if (currentItem !== item) {
        this.close(currentItem);
      }
    });

    isOpen ? this.close(item) : this.open(item);
  }

  open(item) {
    const button = item.querySelector(".faq__trigger");
    const panel = item.querySelector(".faq__panel");

    item.classList.add("is-open");

    button.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    panel.style.height = `${panel.scrollHeight}px`;

    if (item.lines) {
      gsap.fromTo(
        item.lines,
        { y: "110%" },
        {
          y: "0%",
          duration: 0.7,
          ease: "power4.out",
          stagger: 0.05,
          delay: 0.15,
        },
      );
    }
  }

  close(item) {
    const button = item.querySelector(".faq__trigger");
    const panel = item.querySelector(".faq__panel");

    item.classList.remove("is-open");

    button.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    panel.style.height = "0px";

    if (item.lines) {
      gsap.set(item.lines, { y: "110%" });
    }
  }

  updateOpenPanels() {
    this.items.forEach((item) => {
      if (!item.classList.contains("is-open")) return;

      const panel = item.querySelector(".faq__panel");

      panel.style.height = `${panel.scrollHeight}px`;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FAQAccordion(".questions");
});

/* ===================== ABOUT PANEL ===================== */
const aboutTrigger = document.querySelector(".about-trigger");
const aboutPanel = document.querySelector("#about-panel");
const aboutOverlay = document.querySelector("#about-panel-overlay");
const aboutClose = document.querySelector(".about-panel-close");

let aboutLines = [];

function initAboutLines() {
  aboutLines = gsap.utils
    .toArray(".about-panel-body .about-line")
    .flatMap((p) => splitIntoLines(p));
  gsap.set(aboutLines, { y: "110%" });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initAboutLines);
} else {
  window.addEventListener("load", initAboutLines);
}

function openAboutPanel(e) {
  e.preventDefault();
  aboutPanel.classList.add("is-open");
  aboutOverlay.classList.add("is-open");
  aboutPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lenis.stop();

  gsap.fromTo(
    aboutLines,
    { y: "110%" },
    { y: "0%", duration: 0.9, ease: "power4.out", stagger: 0.06, delay: 0.2 },
  );
}

function closeAboutPanel() {
  aboutPanel.classList.remove("is-open");
  aboutOverlay.classList.remove("is-open");
  aboutPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lenis.start();
  gsap.set(aboutLines, { y: "110%" });
}

aboutTrigger?.addEventListener("click", openAboutPanel);
aboutClose?.addEventListener("click", closeAboutPanel);
aboutOverlay?.addEventListener("click", closeAboutPanel);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && aboutPanel.classList.contains("is-open")) {
    closeAboutPanel();
  }
});
