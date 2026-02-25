import { setupMarqueeAnimation } from "./marquee";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
function initHorizontalShowcase() {
  const section = document.querySelector(".h-scroll");
  const track = document.querySelector(".h-track");

  if (!section || !track) return;

  const horizontalTween = gsap.to(track, {
    x: () => -(track.scrollWidth - section.clientWidth),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${Math.max(track.scrollWidth - section.clientWidth, 0)}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  window.addEventListener("resize", () => {
    horizontalTween.scrollTrigger?.refresh();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const cards = gsap.utils.toArray(".card");
  const cardsSection = document.querySelector(".cards");
  const introCard = cards[0];
  const titles = gsap.utils.toArray(".card-title h1");
  const progressWidget = document.querySelector(".cards-progress");
  const progressFill = document.querySelector(".cards-progress-fill");

  titles.forEach((title) => {
    const split = new SplitText(title, {
      type: "chars",
      charsClass: "char",
      tag: "div",
    });
    split.chars.forEach((char) => {
      char.innerHTML = `<span>${char.textContent}</span>`;
    });
  });

  const cardImgwrapers = introCard.querySelector(".card-img");
  const cardImg = introCard.querySelector(".card-img img");
  gsap.set(cardImgwrapers, { scale: 0.5, borderRadius: "400px" });
  gsap.set(cardImg, { scale: 1.5 });

  function animateContentIn(titleChars, description) {
    gsap.to(titleChars, {
      x: 0,
      duration: 1,
      ease: "power4.out",
      stagger: 0.03,
    });
    gsap.to(description, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: "power4.out",
      delay: 0.1,
    });
  }

  function animateContentOut(titleChars, description) {
    gsap.to(titleChars, {
      x: 100,
      duration: 1,
      ease: "power4.out",
      stagger: 0.03,
    });
    gsap.to(description, {
      x: "40px",
      opacity: 0,
      duration: 0.5,
      ease: "power4.out",
    });
  }

  const marquee = introCard.querySelector(".card-marquee .marquee");
  const titleChars = introCard.querySelectorAll(".card-title .char span");
  const description = introCard.querySelector(".card-description");

  ScrollTrigger.create({
    trigger: introCard,
    start: "top top",
    end: "+=300vh",
    onUpdate: (self) => {
      const progress = self.progress;
      const imgScale = 0.5 + progress * 0.5;
      const borderRadius = 400 - progress * 375;
      const innerImagScale = 1.5 - progress * 0.5;

      gsap.to(cardImgwrapers, {
        scale: imgScale,
        borderRadius: `${borderRadius}px`,
      });
      gsap.to(cardImg, { scale: innerImagScale });

      if (imgScale >= 0.5 && imgScale <= 0.75) {
        const fadeProgress = (imgScale - 0.5) / 0.25;
        gsap.set(marquee, { opacity: 1 - fadeProgress });
      } else if (imgScale < 0.5) {
        gsap.set(marquee, { opacity: 1 });
      } else {
        gsap.set(marquee, { opacity: 0 });
      }

      if (imgScale >= 0.999 && !introCard.contentRevealed) {
        introCard.contentRevealed = true;
        animateContentIn(titleChars, description);
        if (progressWidget) {
          gsap.to(progressWidget, { autoAlpha: 1, duration: 0.2 });
        }
      }

      if (imgScale < 0.999 && introCard.contentRevealed) {
        introCard.contentRevealed = false;
        animateContentOut(titleChars, description);
        if (progressWidget) {
          gsap.to(progressWidget, { autoAlpha: 0, duration: 0.2 });
        }
      }
    },
  });

  cards.forEach((card, index) => {
    const isLastCard = index === cards.length - 1;
    ScrollTrigger.create({
      trigger: card,
      start: "top top",
      end: isLastCard ? "+=100vh" : "top top",
      endTrigger: isLastCard ? undefined : cards[index + 1],
      pin: true,
      pinSpacing: isLastCard,
    });
  });

  if (cardsSection && progressWidget && progressFill) {
    ScrollTrigger.create({
      trigger: cardsSection,
      start: "top top",
      end: "bottom bottom",
      onEnter: () => {
        if (introCard.contentRevealed) {
          gsap.to(progressWidget, { autoAlpha: 1, duration: 0.2 });
        }
      },
      onLeave: () => gsap.to(progressWidget, { autoAlpha: 0, duration: 0.2 }),
      onEnterBack: () => {
        if (introCard.contentRevealed) {
          gsap.to(progressWidget, { autoAlpha: 1, duration: 0.2 });
        }
      },
      onLeaveBack: () => gsap.to(progressWidget, { autoAlpha: 0, duration: 0.2 }),
    });

    ScrollTrigger.create({
      trigger: cardsSection,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(progressFill, { scaleX: self.progress });
      },
    });
  }

  cards.forEach((card, index) => {
    if (index < cards.length - 1) {
      const cardWraper = card.querySelector(".card-wrapper");
      ScrollTrigger.create({
        trigger: cards[index + 1],
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(cardWraper, {
            scale: 1 - progress * 0.25,
            opacity: 1 - progress,
          });
        },
      });
    }
  });

  cards.forEach((card, index) => {
    if (index > 0) {
      const cardImgEl = card.querySelector(".card-img img");
      const imgWraper = card.querySelector(".card-img");
      ScrollTrigger.create({
        trigger: card,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          const progress = self.progress;
          const scale = 2 - progress;
          const borderRadius = 150 - progress * 125;
          gsap.set(cardImgEl, { scale });
          gsap.set(imgWraper, { borderRadius: `${borderRadius}px` });
        },
      });
    }
  });

  cards.forEach((card, index) => {
    if (index === 0) return;
    const cardDescription = card.querySelector(".card-description");
    const cardTitleChars = card.querySelectorAll(".char span");
    ScrollTrigger.create({
      trigger: card,
      start: "top top",
      onEnter: () => {
        animateContentIn(cardTitleChars, cardDescription);
      },
      onLeaveBack: () => {
        animateContentOut(cardTitleChars, cardDescription);
      },
    });
  });
  setupMarqueeAnimation();
  initHorizontalShowcase();
});
