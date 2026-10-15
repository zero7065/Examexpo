// src/pages/LandingPage.jsx — composes theme-aware landing sections.
import { useAuth } from "../context/AuthContext";
import ImageCarousel from "../components/ImageCarousel";
import LandingStyles from "../components/landing/LandingStyles";
import LandingNav from "../components/landing/LandingNav";
import LandingHero from "../components/landing/LandingHero";
import LandingBento, { LandingStats } from "../components/landing/LandingBento";
import LandingMission from "../components/landing/LandingMission";
import {
  LandingWhyUs,
  LandingAbout,
  LandingHow,
  LandingTestimonials,
  LandingStrategic,
  LandingIELTS,
  LandingWhyForYou,
} from "../components/landing/LandingSections";
import LandingPricing from "../components/landing/LandingPricing";
import { LandingFaq, LandingCta, LandingFooter } from "../components/landing/LandingClosing";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <LandingStyles />
      <LandingNav user={user} />
      <LandingHero user={user} />
      <LandingStats />
      <LandingBento />

      {/* ─── PRODUCT TOUR ─── */}
      <section className="lp-section" style={{
        background: "linear-gradient(180deg, var(--bg), rgb(var(--primary-rgb) / 0.05), var(--bg))",
      }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="lp-h2">See What's <span className="lp-gradient-text">Inside</span></h2>
            <p className="lp-sub">Explore the features that help thousands of students pass their exams.</p>
          </div>
          <ImageCarousel autoPlay={true} interval={4000} />
        </div>
      </section>

      <LandingHow />
      <LandingMission />
      <LandingStrategic />
      <LandingIELTS />
      <LandingWhyForYou />
      <LandingWhyUs />
      <LandingAbout />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFaq />
      <LandingCta user={user} />
      <LandingFooter />
    </div>
  );
}
