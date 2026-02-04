"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * =================================================================
 * MEMORA - Landing Page Style Polarsteps
 * =================================================================
 * Téléphone sticky avec animations au scroll
 * Changement d'écran synchronisé avec les sections
 * =================================================================
 */

// Données des écrans du téléphone
const PHONE_SCREENS = [
  { id: "hero", label: "Accueil" },
  { id: "planifier", label: "Planifier" },
  { id: "planifier2", label: "Planifier 2" },
  { id: "suivre", label: "Suivre" },
  { id: "suivre2", label: "Suivre 2" },
  { id: "revivre", label: "Revivre" },
];

export default function MemoraLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("planifier");

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Gestion optimisée du scroll
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    setIsNavScrolled(currentScrollY > 100);

    const windowHeight = window.innerHeight;
    const viewportCenter = currentScrollY + windowHeight / 2;

    let newActiveSection = "hero";
    let newScreenIndex = 0;

    // Hero section
    const heroHeight = heroRef.current?.offsetHeight || windowHeight;
    if (currentScrollY < heroHeight * 0.8) {
      newActiveSection = "hero";
      newScreenIndex = 0;
    }

    // Mapping sections -> screens
    const sectionToScreen: Record<string, number> = {
      planifier: 1,
      planifier2: 2,
      suivre: 3,
      suivre2: 4,
      revivre: 5,
    };

    // Tab mapping
    const sectionToTab: Record<string, string> = {
      planifier: "planifier",
      planifier2: "planifier",
      suivre: "suivre",
      suivre2: "suivre",
      revivre: "revivre",
    };

    sectionsRef.current.forEach((section, id) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + currentScrollY;
      const sectionBottom = sectionTop + rect.height;

      if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
        newActiveSection = id;
        newScreenIndex = sectionToScreen[id] ?? 0;
        if (sectionToTab[id]) {
          setActiveTab(sectionToTab[id]);
        }
      }
    });

    setActiveSection(newActiveSection);
    setActiveScreenIndex(newScreenIndex);

    // Cacher le téléphone après revivre
    const revivreSection = sectionsRef.current.get("revivre");
    if (revivreSection) {
      const revivreRect = revivreSection.getBoundingClientRect();
      setPhoneVisible(revivreRect.bottom > windowHeight * 0.3);
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const registerSection = (id: string, el: HTMLElement | null) => {
    if (el) sectionsRef.current.set(id, el);
  };

  // Calculs des transformations du téléphone
  const heroHeight =
    typeof window !== "undefined"
      ? heroRef.current?.offsetHeight || window.innerHeight
      : 800;
  const heroProgress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.6)));

  // Style du téléphone selon la section
  const getPhoneStyle = () => {
    let translateX = 0;
    let translateY = 0;
    let rotateY = 0;
    let rotateX = 5;
    let scale = 1;

    switch (activeSection) {
      case "hero":
        translateY = 150 + heroProgress * 100;
        rotateY = 0;
        rotateX = 5;
        scale = 1;
        break;

      case "planifier":
      case "planifier2":
        translateX = -250;
        translateY = 0;
        rotateY = -10;
        rotateX = 5;
        scale = 0.95;
        break;

      case "suivre":
      case "suivre2":
        translateX = 250;
        translateY = 0;
        rotateY = 10;
        rotateX = 5;
        scale = 0.95;
        break;

      case "revivre":
        translateX = 0;
        translateY = -100;
        rotateY = 0;
        rotateX = 5;
        scale = 1.05;
        break;
    }

    return {
      transform: `
        translateX(${translateX}px)
        translateY(${translateY}px)
        perspective(1200px)
        rotateY(${rotateY}deg)
        rotateX(${rotateX}deg)
        scale(${scale})
      `,
      opacity: phoneVisible ? 1 : 0,
    };
  };

  const phoneStyle = getPhoneStyle();

  return (
    <div className="memora" ref={containerRef}>
      {/* Navigation flottante */}
      <nav className={`nav ${isNavScrolled ? "nav--scrolled" : ""}`}>
        <div className="nav__inner">
          <div className="nav__logo">Memora</div>

          <div className="nav__center">
            <span className="nav__badge">
              <span className="nav__badge-icon">★</span>
              App of the Day
            </span>
          </div>

          <div className="nav__right">
            <a href="#" className="nav__link">
              Connexion
            </a>
            <button className="nav__cta">Obtenir l&apos;appli</button>
            <button
              className="nav__menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>
            Connexion
          </a>
          <button onClick={() => scrollToSection("planifier")}>
            Planifiez
          </button>
          <button onClick={() => scrollToSection("suivre")}>Suivez</button>
          <button onClick={() => scrollToSection("revivre")}>Revivez</button>
        </div>
      )}

      {/* TÉLÉPHONE STICKY */}
      <div className="sticky-phone" style={phoneStyle}>
        <div className="phone">
          <div className="phone__frame">
            <div className="phone__notch"></div>
            <div className="phone__screen">
              {PHONE_SCREENS.map((screen, index) => (
                <div
                  key={screen.id}
                  className={`phone__screen-content ${activeScreenIndex === index ? "active" : ""}`}
                >
                  <PhoneScreenContent screenId={screen.id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg">
          <div className="hero__overlay"></div>
        </div>

        <div
          className="hero__content"
          style={{
            opacity: 1 - heroProgress * 0.8,
            transform: `translateY(${heroProgress * -80}px)`,
          }}
        >
          <h1 className="hero__title">
            Une seule appli de voyage
            <br />
            pour toutes vos aventures
          </h1>
          <p className="hero__subtitle">
            Rejoignez des millions de voyageurs qui planifient,
            <br />
            suivent et revivent leurs voyages avec Memora.
          </p>

          <div className="hero__cta">
            <button className="hero__btn">
              <span className="hero__btn-icon">📍</span>
              Obtenir l&apos;appli
            </button>
            <div className="hero__rating">
              <span className="hero__stars">★★★★★</span>
              <span className="hero__reviews">4.8 (140 000 AVIS)</span>
            </div>
          </div>
        </div>

        <div className="hero__scroll" style={{ opacity: 1 - heroProgress * 3 }}>
          <span>↓ DÉCOUVREZ L&apos;APPLI</span>
        </div>
      </section>

      {/* Section Planifiez 1 */}
      <section
        id="planifier"
        className="section section--light"
        ref={(el) => registerSection("planifier", el)}
      >
        <div className="section__content section__content--right">
          <span className="section__supertitle section__supertitle--green">
            CARNET INTIME
          </span>
          <h2 className="section__title">
            Un espace personnel
            <br />
            pour préserver vos souvenirs
          </h2>
        </div>
      </section>

      {/* Section Planifiez 2 */}
      <section
        id="planifier2"
        className="section section--light"
        ref={(el) => registerSection("planifier2", el)}
      >
        <div className="section__content section__content--right">
          <span className="section__supertitle section__supertitle--green">
            CARTE DES SOUVENIRS
          </span>
          <h2 className="section__title">
            Visualisez votre parcours, trace
            <br />
            après trace
            <br />
          </h2>
        </div>
      </section>

      {/* Section Suivez 1 */}
      <section
        id="suivre"
        className="section section--dark"
        ref={(el) => registerSection("suivre", el)}
      >
        <div className="section__content section__content--left">
          <span className="section__supertitle section__supertitle--red">
            OUTIL DE SUIVI DE VOYAGE
          </span>
          <h2 className="section__title">
            Enregistrez
            <br />
            automatiquement
            <br />
            votre itinéraire
          </h2>
        </div>
      </section>

      {/* Section Suivez 2 */}
      <section
        id="suivre2"
        className="section section--dark"
        ref={(el) => registerSection("suivre2", el)}
      >
        <div className="section__content section__content--left">
          <span className="section__supertitle section__supertitle--red">
            CONSEILS VÉCUS
          </span>
          <h2 className="section__title">
            Partagez ce que vous avez vraiment vécu
            <br />
          </h2>
        </div>
      </section>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      {/* Section Revivez */}
      <section
        id="revivre"
        className="section section--gallery"
        ref={(el) => registerSection("revivre", el)}
      >
        <div className="gallery">
          <div className="gallery__card gallery__card--1"></div>
          <div className="gallery__card gallery__card--2"></div>
          <div className="gallery__card gallery__card--3"></div>
          <div className="gallery__card gallery__card--4"></div>
          <div className="gallery__card gallery__card--5"></div>
          <div className="gallery__card gallery__card--6"></div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className="section__text-center">
          <span className="section__supertitle section__supertitle--red">
            UN RÉCAPITULATIF DE VOTRE VOYAGE
          </span>
          <h2 className="section__title">
            Revivez votre
            <br />
            aventure
          </h2>
        </div>
      </section>

      {/* Section Travel Book */}
      <section className="section section--book">
        <div className="book-preview">
          <div className="book">
            <div className="book__page book__page--left">
              <div className="book__content">
                <span className="book__flag">🇱🇰 SRI LANKA</span>
                <h3 className="book__place">ELLA</h3>
                <p className="book__text">
                  This train ride is famous for a reason! It was so much fun to
                  hang out with the locals and enjoy the view of the tea fields
                  in the hills.
                </p>
              </div>
            </div>
            <div className="book__page book__page--right">
              <div className="book__photos">
                <div className="book__photo book__photo--1"></div>
                <div className="book__photo book__photo--2"></div>
                <div className="book__photo book__photo--3"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section__text-center">
          <span className="section__supertitle section__supertitle--red">
            DANS LE CREUX DE VOTRE MAIN
          </span>
          <h2 className="section__title">
            Transformez votre
            <br />
            aventure en Travel Book
          </h2>
          <div className="section__buttons">
            <button className="btn btn--primary">
              Découvrir nos Travel Books →
            </button>
            <button className="btn btn--secondary">
              Offrir un Travel Book →
            </button>
          </div>
        </div>
      </section>

      {/* Tabs de navigation */}
      <div className={`tabs ${!phoneVisible ? "tabs--hidden" : ""}`}>
        {[
          { id: "planifier", label: "PLANIFIEZ" },
          { id: "suivre", label: "SUIVEZ" },
          { id: "revivre", label: "REVIVEZ" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "tab--active" : ""}`}
            onClick={() => scrollToSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__content">
          <div className="footer__section">
            <h3>Compétences mobilisées</h3>
            <ul>
              <li>UX/UI Design</li>
              <li>Prototypage Figma</li>
              <li>Design System</li>
              <li>Recherche utilisateur</li>
            </ul>
          </div>
          <div className="footer__section">
            <h3>Prototype</h3>
            <a
              href="https://www.figma.com/design/7d3o2Hc4jRR0fSONzMg7cX/Memora?node-id=47-183&t=duv0QMuqSy8LblTP-1"
              className="footer__link"
            >
              Voir sur Figma →
            </a>
          </div>
          <div className="footer__section">
            <p>Projet réalisé dans le cadre d&apos;un chef-d&apos;œuvre</p>
            <p className="footer__year">2024</p>
          </div>
        </div>
        <div className="footer__bottom">
          <p>Memora — Voyagez. Vivez. Racontez.</p>
        </div>
      </footer>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap");

        :root {
          --color-cream: #fdf8f3;
          --color-dark: #0f2027;
          --color-dark-gradient: linear-gradient(
            135deg,
            #0f2027 0%,
            #162a30 50%,
            #1b3a40 100%
          );
          --color-red: #e63946;
          --color-green-dark: #1b4332;
          --color-green-light: #40916c;
          --color-text: #1a1a1a;
          --color-text-light: #6b6b6b;
          --font-display: "Playfair Display", Georgia, serif;
          --font-body: "Inter", system-ui, sans-serif;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: var(--font-body);
          background: var(--color-cream);
          color: var(--color-text);
          overflow-x: hidden;
        }

        .memora {
          position: relative;
        }

        /* ============================================
           TÉLÉPHONE STICKY
           ============================================ */
        .sticky-phone {
          position: fixed;
          top: 50%;
          left: 50%;
          margin-left: -140px;
          margin-top: -300px;
          z-index: 50;
          transition:
            transform 0.5s cubic-bezier(0.33, 1, 0.68, 1),
            opacity 0.4s ease;
          will-change: transform, opacity;
          pointer-events: none;
        }

        .phone {
          position: relative;
        }

        .phone__frame {
          position: relative;
          width: 280px;
          height: 580px;
          background: linear-gradient(
            145deg,
            #2a2a2a 0%,
            #1a1a1a 50%,
            #0d0d0d 100%
          );
          border-radius: 45px;
          padding: 10px;
          box-shadow:
            0 50px 100px -20px rgba(0, 0, 0, 0.5),
            0 30px 60px -30px rgba(0, 0, 0, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.1);
        }

        .phone__notch {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 28px;
          background: #000;
          border-radius: 14px;
          z-index: 20;
        }

        .phone__screen {
          position: relative;
          width: 100%;
          height: 100%;
          background: #1b4332;
          border-radius: 38px;
          overflow: hidden;
        }

        .phone__screen-content {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition:
            opacity 0.4s ease,
            transform 0.4s ease;
          transform: scale(0.96);
        }

        .phone__screen-content.active {
          opacity: 1;
          transform: scale(1);
        }

        /* Mobile: cacher le téléphone sticky */
        @media (max-width: 1023px) {
          .sticky-phone {
            display: none;
          }
        }

        /* ============================================
           NAVIGATION
           ============================================ */
        .nav {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .nav__inner {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 100px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }

        .nav__logo {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .nav__center {
          display: none;
        }

        @media (min-width: 768px) {
          .nav__center {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
        }

        .nav__badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-text-light);
        }

        .nav__badge-icon {
          color: #ffd700;
        }

        .nav__right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav__link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text);
          text-decoration: none;
          display: none;
        }

        @media (min-width: 768px) {
          .nav__link {
            display: block;
          }
        }

        .nav__cta {
          padding: 0.625rem 1.25rem;
          background: var(--color-red);
          color: white;
          border: none;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.2s,
            background 0.2s;
        }

        .nav__cta:hover {
          background: #d62839;
          transform: scale(1.02);
        }

        .nav__menu {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .nav__menu span {
          width: 20px;
          height: 2px;
          background: var(--color-text);
          border-radius: 2px;
        }

        @media (min-width: 768px) {
          .nav__menu {
            display: none;
          }
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 200px;
        }

        .mobile-menu a,
        .mobile-menu button {
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          font-size: 1rem;
          text-align: left;
          cursor: pointer;
          color: var(--color-text);
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .mobile-menu a:hover,
        .mobile-menu button:hover {
          background: var(--color-cream);
        }

        /* ============================================
           HERO SECTION
           ============================================ */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 8rem 1.5rem 4rem;
          overflow: hidden;
        }

        .hero__bg {
          position: absolute;
          inset: 0;
          background: url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80")
            center/cover no-repeat;
          z-index: 0;
        }

        .hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 50, 30, 0.5) 0%,
            rgba(0, 50, 30, 0.6) 50%,
            rgba(0, 50, 30, 0.4) 100%
          );
        }

        .hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 800px;
          transition:
            transform 0.1s ease-out,
            opacity 0.1s ease-out;
          will-change: transform, opacity;
        }

        .hero__title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 400;
          font-style: italic;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .hero__subtitle {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          font-weight: 300;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .hero__cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .hero__btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: white;
          color: var(--color-text);
          border: none;
          border-radius: 100px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .hero__btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .hero__btn-icon {
          font-size: 1.25rem;
        }

        .hero__rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero__stars {
          color: #ffd700;
          font-size: 1rem;
        }

        .hero__reviews {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .hero__scroll {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          transition: opacity 0.3s ease;
        }

        /* ============================================
           SECTIONS
           ============================================ */
        .section {
          min-height: 100vh;
          padding: 6rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .section--light {
          background: var(--color-cream);
        }

        .section--dark {
          background: var(--color-dark-gradient);
          color: white;
        }

        .section--gallery {
          background: white;
          flex-direction: column;
          gap: 3rem;
          padding: 4rem 2rem;
          min-height: auto;
        }

        .section--book {
          background: white;
          flex-direction: column;
          gap: 3rem;
          min-height: auto;
          padding: 6rem 2rem;
        }

        .section__content {
          max-width: 500px;
        }

        .section__content--right {
          margin-left: auto;
          margin-right: 15%;
          text-align: left;
        }

        .section__content--left {
          margin-right: auto;
          margin-left: 15%;
          text-align: left;
        }

        @media (max-width: 1023px) {
          .section__content--right,
          .section__content--left {
            margin: 0 auto;
            text-align: center;
          }
        }

        .section__text-center {
          text-align: center;
          max-width: 600px;
        }

        .section__supertitle {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-bottom: 1rem;
          font-family: var(--font-body);
        }

        .section__supertitle--green {
          color: var(--color-green-dark);
        }

        .section__supertitle--red {
          color: var(--color-red);
        }

        .section__title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 400;
          line-height: 1.2;
        }

        .section__buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        /* ============================================
           GALLERY
           ============================================ */
        .gallery {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 1rem;
          width: 100%;
          max-width: 1200px;
          padding: 0 1rem;
          flex-wrap: wrap;
        }

        .gallery__card {
          width: 150px;
          height: 200px;
          background: linear-gradient(135deg, #40916c 0%, #2d6a4f 100%);
          border-radius: 20px;
          flex-shrink: 0;
        }

        .gallery__card--1 {
          height: 220px;
          transform: translateY(10px);
        }
        .gallery__card--2 {
          height: 180px;
          transform: translateY(-20px);
        }
        .gallery__card--3 {
          height: 280px;
          transform: translateY(0);
        }
        .gallery__card--4 {
          height: 180px;
          transform: translateY(-10px);
        }
        .gallery__card--5 {
          height: 200px;
          transform: translateY(30px);
        }
        .gallery__card--6 {
          height: 240px;
          transform: translateY(-15px);
        }

        @media (max-width: 768px) {
          .gallery__card {
            width: 100px;
            height: 150px !important;
            transform: none !important;
          }
        }

        /* ============================================
           BOOK PREVIEW
           ============================================ */
        .book-preview {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .book {
          display: flex;
          background: var(--color-green-dark);
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }

        .book__page {
          flex: 1;
          background: white;
          border-radius: 4px;
          overflow: hidden;
        }

        .book__page--left {
          margin-right: 8px;
        }

        .book__page--right {
          margin-left: 8px;
        }

        .book__content {
          padding: 1.5rem;
        }

        .book__flag {
          font-size: 0.75rem;
          color: var(--color-text-light);
        }

        .book__place {
          font-family: var(--font-display);
          font-size: 1.5rem;
          margin: 0.5rem 0 1rem;
        }

        .book__text {
          font-size: 0.8rem;
          color: var(--color-text-light);
          line-height: 1.6;
        }

        .book__photos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 8px;
          height: 100%;
        }

        .book__photo {
          background: linear-gradient(135deg, #ffb74d 0%, #ff8a65 100%);
          border-radius: 4px;
        }

        .book__photo--1 {
          grid-column: 1 / -1;
        }

        @media (max-width: 640px) {
          .book {
            flex-direction: column;
          }

          .book__page--left {
            margin-right: 0;
            margin-bottom: 8px;
          }

          .book__page--right {
            margin-left: 0;
            margin-top: 8px;
          }
        }

        /* ============================================
           BUTTONS
           ============================================ */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn--primary {
          background: var(--color-green-dark);
          color: white;
          border: none;
        }

        .btn--primary:hover {
          background: #143d28;
          transform: translateY(-2px);
        }

        .btn--secondary {
          background: white;
          color: var(--color-text);
          border: 1px solid #ddd;
        }

        .btn--secondary:hover {
          background: #f5f5f5;
          transform: translateY(-2px);
        }

        /* ============================================
           TABS
           ============================================ */
        .tabs {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          transition:
            opacity 0.3s,
            transform 0.3s;
        }

        .tabs--hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
          pointer-events: none;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--color-text-light);
          background: transparent;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: var(--color-text);
        }

        .tab--active {
          background: var(--color-green-dark);
          color: white;
        }

        /* ============================================
           FOOTER
           ============================================ */
        .footer {
          background: var(--color-cream);
          padding: 6rem 2rem 4rem;
        }

        .footer__content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 3rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .footer__section h3 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-light);
          margin-bottom: 1rem;
        }

        .footer__section ul {
          list-style: none;
        }

        .footer__section li {
          font-size: 0.875rem;
          color: var(--color-text-light);
          margin-bottom: 0.5rem;
        }

        .footer__section p {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .footer__year {
          font-weight: 700;
          color: var(--color-text) !important;
          margin-top: 0.5rem;
        }

        .footer__link {
          display: inline-block;
          font-size: 0.875rem;
          color: var(--color-green-dark);
          text-decoration: none;
          font-weight: 600;
        }

        .footer__link:hover {
          text-decoration: underline;
        }

        .footer__bottom {
          text-align: center;
          padding-top: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .footer__bottom p {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* Composant pour le contenu des écrans du téléphone */
function PhoneScreenContent({ screenId }: { screenId: string }) {
  switch (screenId) {
    case "hero":
      return (
        <div className="screen-content">
          <div className="screen-map"></div>
          <div className="screen-label">
            <span>Emma Meunier</span>
            <strong>Backpacking Asia</strong>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: linear-gradient(180deg, #1b4332 0%, #2d6a4f 100%);
              padding: 45px 15px 20px;
              display: flex;
              flex-direction: column;
            }
            .screen-map {
              flex: 1;
              background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
              border-radius: 15px;
              margin-bottom: 1rem;
            }
            .screen-label {
              color: white;
              text-align: center;
            }
            .screen-label span {
              display: block;
              font-size: 0.7rem;
              opacity: 0.7;
            }
            .screen-label strong {
              font-size: 0.9rem;
            }
          `}</style>
        </div>
      );

    case "planifier":
      return (
        <div className="screen-content">
          <div className="screen-header">
            <span>Emma Meunier</span>
            <strong>Mexico & Guatemala</strong>
          </div>
          <div className="screen-map"></div>
          <div className="screen-list">
            <div className="list-item">
              <div className="item-img"></div>
              <div className="item-text">
                <strong>Mexico City</strong>
                <span>Fri 29 Jan - Sat 30 Jan</span>
              </div>
            </div>
            <div className="list-item">
              <div
                className="item-img"
                style={{
                  background:
                    "linear-gradient(135deg, #81C784 0%, #4CAF50 100%)",
                }}
              ></div>
              <div className="item-text">
                <strong>Oaxaca</strong>
                <span>Sat 30 Jan - Mon 1 Feb</span>
              </div>
            </div>
            <div className="list-item list-item--highlight">
              <div
                className="item-img"
                style={{
                  background:
                    "linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)",
                }}
              ></div>
              <div className="item-text">
                <strong>San Cristobal</strong>
                <span>1 night</span>
              </div>
            </div>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: white;
              padding: 45px 12px 15px;
            }
            .screen-header {
              margin-bottom: 0.75rem;
            }
            .screen-header span {
              display: block;
              font-size: 0.65rem;
              color: #6b6b6b;
            }
            .screen-header strong {
              font-size: 0.85rem;
            }
            .screen-map {
              width: 100%;
              height: 30%;
              background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
              border-radius: 12px;
              margin-bottom: 0.75rem;
            }
            .screen-list {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }
            .list-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.5rem;
              background: #f5f5f5;
              border-radius: 10px;
            }
            .list-item--highlight {
              background: #e8f5e9;
              border: 1px solid #4caf50;
            }
            .item-img {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #ffb74d 0%, #ff8a65 100%);
              border-radius: 8px;
              flex-shrink: 0;
            }
            .item-text strong {
              display: block;
              font-size: 0.75rem;
            }
            .item-text span {
              font-size: 0.6rem;
              color: #6b6b6b;
            }
          `}</style>
        </div>
      );

    case "planifier2":
      return (
        <div className="screen-content">
          <div className="screen-map"></div>
          <div className="screen-card">
            <div className="card-header">
              <strong>Palenque</strong>
              <span>Mexico</span>
            </div>
            <div className="card-row">
              <span>Arrival date</span>
              <span className="red">1 Feb 2027</span>
            </div>
            <div className="card-row">
              <span>Nights</span>
              <div className="counter">- 3 +</div>
            </div>
          </div>
          <div className="screen-accommodation">
            <div className="acc-img"></div>
            <div className="acc-text">
              <span className="booked">BOOKED</span>
              <strong>Palenque Jungle Cabin</strong>
            </div>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: white;
              padding: 45px 12px 15px;
              display: flex;
              flex-direction: column;
            }
            .screen-map {
              width: 100%;
              height: 25%;
              background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
              border-radius: 12px;
              margin-bottom: 0.75rem;
            }
            .screen-card {
              background: white;
              border-radius: 12px;
              padding: 1rem;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              margin-bottom: 0.75rem;
            }
            .card-header {
              margin-bottom: 0.75rem;
            }
            .card-header strong {
              display: block;
              font-size: 0.9rem;
            }
            .card-header span {
              font-size: 0.65rem;
              color: #6b6b6b;
            }
            .card-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              border-top: 1px solid #eee;
              font-size: 0.75rem;
            }
            .red {
              color: #e63946;
            }
            .counter {
              background: #f5f5f5;
              padding: 0.25rem 0.5rem;
              border-radius: 6px;
              font-size: 0.7rem;
            }
            .screen-accommodation {
              background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
              border-radius: 12px;
              padding: 0.75rem;
              display: flex;
              align-items: center;
              gap: 0.75rem;
            }
            .acc-img {
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #40916c 0%, #52b788 100%);
              border-radius: 8px;
            }
            .acc-text {
              color: white;
            }
            .booked {
              display: inline-block;
              background: #4caf50;
              padding: 0.125rem 0.375rem;
              border-radius: 4px;
              font-size: 0.5rem;
              font-weight: 700;
              margin-bottom: 0.25rem;
            }
            .acc-text strong {
              display: block;
              font-size: 0.75rem;
            }
          `}</style>
        </div>
      );

    case "suivre":
      return (
        <div className="screen-content">
          <div className="screen-header">
            <span>Emma Meunier</span>
            <strong>Road trip coast to coast</strong>
          </div>
          <div className="screen-map"></div>
          <div className="screen-card">
            <div className="card-img"></div>
            <div className="card-text">
              <strong>On the road!</strong>
              <span>United States</span>
            </div>
          </div>
          <div className="screen-stats">
            <div className="stat">
              <span className="value">48</span>
              <span className="label">likes</span>
            </div>
            <div className="stat">
              <span className="value">6</span>
              <span className="label">comments</span>
            </div>
            <div className="stat">
              <span className="value">24</span>
              <span className="label">photos</span>
            </div>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: #1a1a1a;
              padding: 45px 12px 15px;
              color: white;
            }
            .screen-header {
              margin-bottom: 0.75rem;
            }
            .screen-header span {
              display: block;
              font-size: 0.65rem;
              opacity: 0.7;
            }
            .screen-header strong {
              font-size: 0.85rem;
            }
            .screen-map {
              width: 100%;
              height: 35%;
              background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
              border-radius: 12px;
              margin-bottom: 0.75rem;
            }
            .screen-card {
              display: flex;
              gap: 0.75rem;
              padding: 0.75rem;
              background: white;
              border-radius: 12px;
              margin-bottom: 0.75rem;
            }
            .card-img {
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
              border-radius: 8px;
            }
            .card-text {
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .card-text strong {
              font-size: 0.85rem;
              color: #1a1a1a;
            }
            .card-text span {
              font-size: 0.65rem;
              color: #6b6b6b;
            }
            .screen-stats {
              display: flex;
              justify-content: space-around;
            }
            .stat {
              text-align: center;
            }
            .stat .value {
              display: block;
              font-size: 1.25rem;
              font-weight: 600;
              color: #40916c;
            }
            .stat .label {
              font-size: 0.55rem;
              text-transform: uppercase;
              opacity: 0.7;
            }
          `}</style>
        </div>
      );

    case "suivre2":
      return (
        <div className="screen-content">
          <div className="screen-globe"></div>
          <div className="screen-card">
            <strong>Travel Stats</strong>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">24</span>
                <span className="stat-label">countries</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">12%</span>
                <span className="stat-label">of the world</span>
              </div>
            </div>
            <div className="flags">
              <span>Flags collected</span>
              <div className="flag-row">🇺🇸 🇨🇦 🇧🇷 🇫🇷 🇮🇹 🇪🇸</div>
              <div className="flag-row">🇬🇧 🇩🇪 🇯🇵 🇦🇺 🇲🇽 🇹🇭</div>
            </div>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: #1a1a1a;
              padding: 45px 12px 15px;
              display: flex;
              flex-direction: column;
            }
            .screen-globe {
              flex: 1;
              background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
              border-radius: 12px;
              margin-bottom: 0.75rem;
            }
            .screen-card {
              background: white;
              border-radius: 12px;
              padding: 1rem;
            }
            .screen-card strong {
              display: block;
              font-size: 0.9rem;
              margin-bottom: 0.75rem;
              color: #1a1a1a;
            }
            .stats-grid {
              display: flex;
              gap: 0.5rem;
              margin-bottom: 0.75rem;
            }
            .stat-box {
              flex: 1;
              background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
              border-radius: 8px;
              padding: 0.75rem;
              text-align: center;
              color: white;
            }
            .stat-value {
              display: block;
              font-size: 1.25rem;
              font-weight: 600;
            }
            .stat-label {
              font-size: 0.55rem;
              opacity: 0.8;
            }
            .flags span {
              display: block;
              font-size: 0.65rem;
              color: #6b6b6b;
              margin-bottom: 0.5rem;
            }
            .flag-row {
              font-size: 1.25rem;
              margin-bottom: 0.25rem;
            }
          `}</style>
        </div>
      );

    case "revivre":
      return (
        <div className="screen-content">
          <div className="screen-video">
            <div className="play-btn">▶</div>
          </div>
          <div className="screen-label">
            <span>DAY 13</span>
            <strong>Hiriketiya Beach</strong>
            <small>SRI LANKA</small>
          </div>
          <style jsx>{`
            .screen-content {
              width: 100%;
              height: 100%;
              background: linear-gradient(180deg, #2d6a4f 0%, #1b4332 100%);
              padding: 45px 15px 20px;
              display: flex;
              flex-direction: column;
            }
            .screen-video {
              flex: 1;
              background: linear-gradient(135deg, #1b4332 0%, #40916c 100%);
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1rem;
            }
            .play-btn {
              width: 50px;
              height: 50px;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1rem;
              color: #1b4332;
            }
            .screen-label {
              color: white;
              text-align: center;
            }
            .screen-label span {
              display: block;
              font-size: 0.55rem;
              opacity: 0.7;
              letter-spacing: 0.1em;
              margin-bottom: 0.25rem;
            }
            .screen-label strong {
              display: block;
              font-size: 1rem;
              margin-bottom: 0.25rem;
            }
            .screen-label small {
              font-size: 0.6rem;
              opacity: 0.7;
            }
          `}</style>
        </div>
      );

    default:
      return null;
  }
}
