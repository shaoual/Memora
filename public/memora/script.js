/**
 * =================================================================
 * MEMORA - Landing Page JavaScript
 * =================================================================
 * Gestion des interactions :
 * - Effet sticky phone avec changement d'écran au scroll
 * - Navigation responsive
 * - Animations au scroll (IntersectionObserver)
 * - Navigation clavier accessible
 * =================================================================
 */

(function () {
  "use strict";

  // =================================================================
  // CONFIGURATION
  // =================================================================

  /**
   * Association entre les sections et les écrans du téléphone
   * Chaque section data-screen correspond à un numéro d'écran
   */
  const SCREEN_MAPPING = {
    1: "screen-01", // Hero
    2: "screen-02", // Concept
    3: "screen-03", // Fonctionnalités
    4: "screen-04", // Maquette
    5: "screen-05", // Démarche
    6: "screen-06", // Analyse
    7: "screen-07", // Conclusion
    8: "screen-08", // Footer
  };

  // =================================================================
  // DOM ELEMENTS
  // =================================================================

  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");
  const phoneImages = document.querySelectorAll(".phone__image");
  const sections = document.querySelectorAll("[data-screen]");
  const allNavLinks = document.querySelectorAll(".nav__links a");

  // =================================================================
  // NAVIGATION - SCROLL EFFECT
  // =================================================================

  /**
   * Ajoute une classe à la navigation quand on scroll
   * pour afficher un fond semi-transparent avec blur
   */
  function handleNavScroll() {
    const scrollY = window.scrollY;
    const threshold = 50;

    if (scrollY > threshold) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  }

  // =================================================================
  // NAVIGATION - MOBILE MENU
  // =================================================================

  /**
   * Toggle du menu mobile
   */
  function toggleMobileMenu() {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !isExpanded);
    navLinks.classList.toggle("open");

    // Met à jour le label pour l'accessibilité
    navToggle.setAttribute(
      "aria-label",
      isExpanded ? "Ouvrir le menu" : "Fermer le menu",
    );
  }

  /**
   * Ferme le menu mobile quand on clique sur un lien
   */
  function closeMobileMenu() {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  // =================================================================
  // NAVIGATION - ACTIVE LINK
  // =================================================================

  /**
   * Met à jour le lien actif dans la navigation
   * en fonction de la section visible
   */
  function updateActiveNavLink(sectionId) {
    allNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "#" + sectionId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // =================================================================
  // PHONE SCREEN - SCROLL SYNCHRONIZATION
  // =================================================================

  /**
   * Change l'écran affiché sur le mockup du téléphone
   * avec une transition en fondu
   * @param {number} screenNumber - Numéro de l'écran à afficher (1-8)
   */
  function changePhoneScreen(screenNumber) {
    // Retire la classe active de toutes les images
    phoneImages.forEach((img) => {
      img.classList.remove("active");
    });

    // Ajoute la classe active à l'image correspondante
    const targetImage = document.querySelector(
      `.phone__image[data-screen="${screenNumber}"]`,
    );
    if (targetImage) {
      targetImage.classList.add("active");
    }
  }

  /**
   * Détermine l'écran à afficher en fonction de la position de scroll
   * Utilise le centre de la fenêtre comme point de référence
   */
  function handlePhoneScreenChange() {
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const viewportCenter = scrollY + windowHeight / 2;

    let activeScreen = 1;
    let activeSectionId = "hero";

    // Parcourt les sections pour trouver celle qui contient le centre du viewport
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionBottom = sectionTop + rect.height;

      if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
        activeScreen = parseInt(section.dataset.screen, 10);
        activeSectionId = section.id || "";
      }
    });

    // Change l'écran du téléphone
    changePhoneScreen(activeScreen);

    // Met à jour le lien actif
    if (activeSectionId) {
      updateActiveNavLink(activeSectionId);
    }
  }

  // =================================================================
  // SECTIONS - VISIBILITY ANIMATIONS
  // =================================================================

  /**
   * IntersectionObserver pour animer les sections au scroll
   * Les sections deviennent visibles quand elles entrent dans le viewport
   */
  function initSectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: "-10% 0px -10% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    // Observe toutes les sections
    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  // =================================================================
  // SMOOTH SCROLL - KEYBOARD NAVIGATION
  // =================================================================

  /**
   * Gère le scroll smooth pour les liens d'ancrage
   * avec support de la navigation clavier
   */
  function handleSmoothScroll(event) {
    const target = event.target.closest('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute("href");
    if (!href || href === "#") return;

    const targetElement = document.querySelector(href);
    if (!targetElement) return;

    event.preventDefault();

    // Ferme le menu mobile si ouvert
    closeMobileMenu();

    // Scroll vers la cible
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Met le focus sur l'élément cible pour l'accessibilité
    targetElement.setAttribute("tabindex", "-1");
    targetElement.focus({ preventScroll: true });
  }

  // =================================================================
  // KEYBOARD NAVIGATION
  // =================================================================

  /**
   * Gère la navigation clavier pour le menu mobile
   */
  function handleKeyboardNavigation(event) {
    // Escape ferme le menu mobile
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      closeMobileMenu();
      navToggle.focus();
    }

    // Enter ou Space sur le toggle ouvre/ferme le menu
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === navToggle
    ) {
      event.preventDefault();
      toggleMobileMenu();
    }
  }

  // =================================================================
  // THROTTLE UTILITY
  // =================================================================

  /**
   * Limite la fréquence d'exécution d'une fonction
   * Utile pour les événements scroll et resize
   */
  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // =================================================================
  // DEBOUNCE UTILITY
  // =================================================================

  /**
   * Retarde l'exécution d'une fonction jusqu'à ce que
   * les événements arrêtent de se produire
   */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // =================================================================
  // INITIALIZATION
  // =================================================================

  /**
   * Initialise tous les gestionnaires d'événements
   * et démarre les observers
   */
  function init() {
    // Vérifie que les éléments existent
    if (!nav || !sections.length) {
      console.warn("Memora: Éléments DOM manquants");
      return;
    }

    // Navigation scroll effect
    window.addEventListener("scroll", throttle(handleNavScroll, 100));

    // Phone screen synchronization
    window.addEventListener("scroll", throttle(handlePhoneScreenChange, 50));

    // Mobile menu toggle
    if (navToggle) {
      navToggle.addEventListener("click", toggleMobileMenu);
    }

    // Smooth scroll pour les liens d'ancrage
    document.addEventListener("click", handleSmoothScroll);

    // Keyboard navigation
    document.addEventListener("keydown", handleKeyboardNavigation);

    // Ferme le menu mobile au resize si on passe en desktop
    window.addEventListener(
      "resize",
      debounce(() => {
        if (window.innerWidth >= 1024) {
          closeMobileMenu();
        }
      }, 250),
    );

    // Initialize section observer pour les animations
    initSectionObserver();

    // État initial
    handleNavScroll();
    handlePhoneScreenChange();

    // Marque le hero comme visible immédiatement
    const heroSection = document.querySelector(".section--hero");
    if (heroSection) {
      heroSection.classList.add("visible");
    }

    console.log("Memora: Initialisation terminée");
  }

  // =================================================================
  // PLACEHOLDER IMAGES HANDLER
  // =================================================================

  /**
   * Génère des placeholders visuels pour les images manquantes
   * Affiche un gradient avec le numéro de l'écran
   */
  function handleMissingImages() {
    phoneImages.forEach((img) => {
      img.addEventListener("error", function () {
        // Crée un canvas pour générer un placeholder
        const screenNum = this.dataset.screen;
        const canvas = document.createElement("canvas");
        canvas.width = 340;
        canvas.height = 700;
        const ctx = canvas.getContext("2d");

        // Gradient de fond
        const gradient = ctx.createLinearGradient(0, 0, 340, 700);
        gradient.addColorStop(0, "#E8E2D9");
        gradient.addColorStop(1, "#F5F3EF");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 340, 700);

        // Cercle décoratif
        ctx.beginPath();
        ctx.arc(170, 280, 60, 0, Math.PI * 2);
        ctx.fillStyle = "#D4CBC0";
        ctx.fill();

        // Numéro de l'écran
        ctx.font = "bold 48px Georgia";
        ctx.fillStyle = "#4A6741";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(screenNum.toString().padStart(2, "0"), 170, 280);

        // Texte "Écran"
        ctx.font = "14px system-ui";
        ctx.fillStyle = "#6B6B6B";
        ctx.fillText("Écran", 170, 380);

        // Ligne décorative
        ctx.beginPath();
        ctx.moveTo(120, 420);
        ctx.lineTo(220, 420);
        ctx.strokeStyle = "#D4CBC0";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Applique le placeholder
        this.src = canvas.toDataURL();
      });
    });
  }

  // =================================================================
  // DOM READY
  // =================================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      handleMissingImages();
      init();
    });
  } else {
    handleMissingImages();
    init();
  }
})();
