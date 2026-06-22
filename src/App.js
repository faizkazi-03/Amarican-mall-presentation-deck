import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { FaLandmark, FaCrown, FaLeaf } from "react-icons/fa";
import { IoSunny, IoDiamond, IoSparkles } from "react-icons/io5";
import { HiOutlineBuildingOffice2, HiOutlineCpuChip } from "react-icons/hi2";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const CREAM = "#F5F0E8";
const BLACK = "#0A0A08";
const DARK = "#111109";
const SURFACE = "#1A1A14";
const MUTED = "#888880";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Josefin+Sans:wght@100;300;400&display=swap');
`;

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${BLACK}; overflow-x: hidden; }
  .deck-root { font-family: 'Cormorant Garamond', serif; background: ${BLACK}; color: ${CREAM}; height: 100vh; overflow: hidden; position: relative; }
  .slide { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1); will-change: transform, opacity; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
  .slide.active { opacity: 1; transform: translateY(0); pointer-events: all; }
  .slide.prev { opacity: 0; transform: translateY(-40px); pointer-events: none; }
  .slide.next { opacity: 0; transform: translateY(40px); pointer-events: none; }

  .gold-line { height: 1px; background: linear-gradient(90deg, transparent, ${GOLD}, transparent); }
  .gold-text { color: ${GOLD}; }
  .serif { font-family: 'Playfair Display', serif; }
  .sans { font-family: 'Josefin Sans', sans-serif; }

  @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes rise { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes expandW { from{width:0} to{width:100%} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes countUp { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .rise { animation: rise 0.9s ease forwards; }
  .rise-2 { animation: rise 0.9s 0.2s ease forwards; opacity:0; }
  .rise-3 { animation: rise 0.9s 0.4s ease forwards; opacity:0; }
  .rise-4 { animation: rise 0.9s 0.6s ease forwards; opacity:0; }

  .nav-btn { background: transparent; border: 1px solid rgba(201,168,76,0.4); color: ${GOLD}; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 28px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 6px; }
  .nav-btn:hover { background: rgba(201,168,76,0.12); border-color: ${GOLD}; }
  .nav-btn:disabled { cursor: default; }
  .nav-btn:disabled:hover { background: transparent; border-color: rgba(201,168,76,0.4); }

  .dot { width: 6px; height: 6px; border-radius: 50%; border: 1px solid ${GOLD}; cursor: pointer; transition: all 0.3s; }
  .dot.active { background: ${GOLD}; }

  .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.2); padding: 32px 28px; flex: 1; text-align: center; transition: all 0.4s; cursor: default; min-width: 0; }
  .stat-card:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.5); transform: translateY(-4px); }

  .arch-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15); padding: 28px 24px; transition: all 0.4s; cursor: pointer; flex: 1; min-width: 0; }
  .arch-card:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.4); }
  .arch-card.selected { background: rgba(201,168,76,0.1); border-color: ${GOLD}; }

  .exp-pill { border: 1px solid rgba(201,168,76,0.3); padding: 10px 22px; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; color: ${MUTED}; background: transparent; }
  .exp-pill:hover { border-color: ${GOLD}; color: ${GOLD}; }
  .exp-pill.active { border-color: ${GOLD}; color: ${CREAM}; background: rgba(201,168,76,0.15); }

  .timeline-item { display: flex; gap: 28px; align-items: flex-start; }
  .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: ${GOLD}; margin-top: 6px; flex-shrink: 0; }
  .timeline-line { width: 1px; background: rgba(201,168,76,0.2); flex-shrink: 0; margin-left: 4px; }

  .particle { position: absolute; border-radius: 50%; background: ${GOLD}; will-change: transform; }
  .hero-bg { position: absolute; inset: 0; overflow: hidden; }

  .future-card { border: 1px solid rgba(201,168,76,0.2); padding: 28px 24px; flex: 1; transition: all 0.4s; min-width: 0; }
  .future-card:hover { border-color: rgba(201,168,76,0.6); background: rgba(201,168,76,0.06); transform: translateY(-4px); }

  /* ===== SIDE NAV ===== */
  .side-nav { position: absolute; right: 28px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 100; }

  /* ===== RESPONSIVE ===== */

  /* Tablets and below */
  @media (max-width: 1024px) {
    .slide { padding: 60px 36px 100px; }
    .arch-cards-grid { grid-template-columns: 1fr 1fr !important; }
    .future-grid { grid-template-columns: 1fr 1fr !important; }
  }

  /* Tablets portrait */
  @media (max-width: 768px) {
    .deck-root { overflow-y: auto; overflow-x: hidden; height: auto; min-height: 100vh; }
    .slide { position: relative; padding: 80px 24px 120px; min-height: 100vh; overflow: visible; }
    .slide.prev, .slide.next { display: none; }

    .top-bar { left: 20px !important; right: 20px !important; top: 16px !important; }
    .bottom-nav { bottom: 20px !important; }
    .side-nav { display: none !important; }

    .arch-cards-grid { grid-template-columns: 1fr 1fr !important; }
    .arch-detail { flex-direction: column !important; }
    .arch-detail-meta { min-width: unset !important; flex-direction: row !important; flex-wrap: wrap; gap: 16px !important; }
    .arch-detail-meta > div { flex: 1; min-width: 100px; }

    .exp-grid { grid-template-columns: 1fr !important; }
    .stat-cards { grid-template-columns: 1fr 1fr !important; }
    .extra-stats-grid { grid-template-columns: 1fr !important; }
    .future-grid { grid-template-columns: 1fr !important; }

    .timeline-item { gap: 16px; }
  }

  /* Large phones */
  @media (max-width: 480px) {
    .slide { padding: 72px 16px 110px; }
    .top-bar { left: 12px !important; right: 12px !important; top: 12px !important; }

    .arch-cards-grid { grid-template-columns: 1fr !important; }
    .stat-cards { grid-template-columns: 1fr !important; }

    .nav-btn { padding: 10px 18px; font-size: 10px; letter-spacing: 2px; }

    .arch-detail { padding: 20px 16px !important; }
    .arch-detail-meta { flex-direction: column !important; }

    .timeline-item { gap: 12px; }

    .exp-pill { padding: 8px 14px; font-size: 10px; letter-spacing: 1px; }
  }

  /* Small phones */
  @media (max-width: 375px) {
    .slide { padding: 68px 12px 100px; }
    .nav-btn { padding: 8px 14px; font-size: 9px; letter-spacing: 1.5px; }
  }
`;

const MALLS = [
  { name: "Mall of America", city: "Bloomington, MN", year: 1992, size: "5.6M sq ft", fact: "Largest mall in the US with 520+ stores, an indoor theme park, and an aquarium.", Icon: FaLandmark },
  { name: "Aventura Mall", city: "Miami, FL", year: 1983, size: "2.7M sq ft", fact: "Home to $7M Landmark tower sculpture. Top 5 grossing malls in the nation.", Icon: IoSunny },
  { name: "Bal Harbour Shops", city: "Miami, FL", year: 1965, size: "450K sq ft", fact: "The most profitable mall per square foot in the world. Pure ultra-luxury.", Icon: IoDiamond },
  { name: "King of Prussia", city: "Philadelphia, PA", year: 1963, size: "2.9M sq ft", fact: "One of the largest retail complexes on the East Coast with over 400 stores.", Icon: FaCrown },
];

const EXPERIENCES = {
  Fashion: { items: ["Gucci", "Louis Vuitton", "Prada", "Nordstrom", "Saks Fifth Avenue", "Bloomingdale's"], desc: "American malls birthed a retail revolution — from Main Street couture to democratic luxury, housing the world's most coveted brands under one magnificent roof." },
  Dining: { items: ["Fine Dining", "Food Halls", "Celebrity Chef Restaurants", "International Cuisine", "Artisan Bakeries", "Rooftop Bars"], desc: "The modern mall is a culinary destination. Michelin-starred chefs, craft cocktail bars, and curated food halls redefine the dining landscape." },
  Entertainment: { items: ["Cineplex Theaters", "Ice Skating Rinks", "Indoor Theme Parks", "VR Arcades", "Live Music Venues", "Art Galleries"], desc: "Entertainment has transformed the mall into an experience economy powerhouse — where memories are made and every visit is a new adventure." },
  Wellness: { items: ["Luxury Spas", "Fitness Studios", "Meditation Centers", "Beauty Salons", "Medical Clinics", "Yoga Studios"], desc: "The wellness revolution has arrived in retail. Premium spas, boutique fitness, and holistic health destinations elevate the mall into a sanctuary." },
};

const STATS = [
  { value: "1,000+", label: "Shopping Malls", sub: "across America" },
  { value: "$400B", label: "Annual Revenue", sub: "retail sales" },
  { value: "12M", label: "Daily Visitors", sub: "across all malls" },
  { value: "180M", label: "Americans", sub: "visit malls monthly" },
];

const FUTURE = [
  { title: "Mixed-Use Revolution", desc: "Transforming into live-work-play ecosystems with apartments, offices, and green spaces woven into the retail fabric.", Icon: HiOutlineBuildingOffice2 },
  { title: "Experiential Luxury", desc: "Curated experiences over commodities — personal styling suites, immersive brand activations, and members-only lounges.", Icon: IoSparkles },
  { title: "Sustainability", desc: "Net-zero architecture, solar canopies, vertical gardens, and LEED certification define the next generation of mall design.", Icon: FaLeaf },
  { title: "Digital Integration", desc: "AI-powered personal shopping, AR fitting rooms, and seamless omnichannel retail create the phygital mall experience.", Icon: HiOutlineCpuChip },
];

const SLIDES_CONFIG = [
  { label: "Introduction" },
  { label: "History" },
  { label: "Architecture" },
  { label: "Experience" },
  { label: "Numbers" },
  { label: "Future" },
];

/* ─── Particles (memoized) ─── */
const Particles = memo(function Particles() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const particles = useMemo(() => {
    const count = isMobile ? 10 : 18;
    return Array.from({ length: count }, () => ({
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      opacity: Math.random() * 0.25 + 0.05,
    }));
  }, [isMobile]);

  return (
    <div className="hero-bg" aria-hidden="true" style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)` }} />
    </div>
  );
});

/* ─── Slide 1: Hero ─── */
const Slide1 = memo(function Slide1() {
  return (
    <header style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 900, width: "100%" }}>
      <Particles />
      <p className="rise sans" style={{ letterSpacing: "8px", fontSize: 11, color: GOLD, marginBottom: 32, position: "relative" }}>
        EST. 1956 · A CULTURAL INSTITUTION
      </p>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <h1 className="rise-2 serif" style={{ fontSize: "clamp(40px, 9vw, 104px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-2px", color: CREAM, position: "relative" }}>
          THE<br />
          <span style={{ color: GOLD, fontStyle: "italic" }}>American</span><br />
          MALL
        </h1>
      </div>
      <div className="rise-3 gold-line" style={{ width: 120, margin: "28px auto" }} aria-hidden="true" />
      <p className="rise-3" style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 300, color: CREAM, opacity: 0.8, letterSpacing: 1, maxWidth: 480, margin: "0 auto 40px", fontStyle: "italic" }}>
        Where commerce meets culture, and luxury finds its cathedral.
      </p>
      <p className="rise-4 sans" style={{ fontSize: 10, letterSpacing: "5px", color: MUTED, textTransform: "uppercase" }}>
        A Luxury Presentation · 6 Chapters
      </p>
    </header>
  );
});

/* ─── Slide 2: Timeline ─── */
const Slide2 = memo(function Slide2() {
  const events = useMemo(() => [
    { year: "1956", title: "The First Mall", desc: "Southdale Center opens in Edina, MN — the world's first climate-controlled enclosed mall. Victor Gruen's vision changes retail forever." },
    { year: "1970s", title: "Suburban Explosion", desc: "The mall boom reshapes America's suburbs. Anchor department stores and food courts become the new town squares." },
    { year: "1990s", title: "The Golden Era", desc: "Mall of America opens in 1992. Mega-malls with theme parks, hotels, and cineplexes define peak mall culture." },
    { year: "2010s", title: "The Digital Disruption", desc: "E-commerce challenges the model. Innovators pivot toward experience, luxury, and mixed-use development." },
    { year: "Today", title: "The Renaissance", desc: "Luxury repositioning, food halls, and experiential retail breathe new life. The mall evolves — it doesn't die." },
  ], []);

  return (
    <section style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }} aria-label="History of American Malls">
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER II</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(30px, 6vw, 72px)", fontWeight: 700, lineHeight: 1, color: CREAM }}>
          A History of <span style={{ color: GOLD, fontStyle: "italic" }}>Grandeur</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} aria-hidden="true" />
      </div>
      <ol style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 20, listStyle: "none" }}>
        {events.map((e, i) => (
          <li key={i} className="timeline-item rise" style={{ animationDelay: `${i * 0.12}s`, opacity: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 }}>
              <div className="timeline-dot" aria-hidden="true" />
              {i < events.length - 1 && <div className="timeline-line" style={{ height: 52, marginTop: 4 }} aria-hidden="true" />}
            </div>
            <div style={{ paddingBottom: i < events.length - 1 ? 28 : 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
                <span className="sans" style={{ fontSize: 11, letterSpacing: "3px", color: GOLD }}>{e.year}</span>
                <span className="serif" style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 600, color: CREAM }}>{e.title}</span>
              </div>
              <p style={{ fontSize: "clamp(13px, 1.8vw, 15px)", color: MUTED, lineHeight: 1.6, maxWidth: 700 }}>{e.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
});

/* ─── Slide 3: Architecture ─── */
function Slide3() {
  const [selected, setSelected] = useState(0);
  const mall = MALLS[selected];
  const MallIcon = mall.Icon;

  return (
    <section style={{ width: "100%", maxWidth: 1100, position: "relative", zIndex: 1 }} aria-label="Iconic Mall Architecture">
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER III</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(28px, 5.5vw, 66px)", fontWeight: 700, lineHeight: 1.1, color: CREAM }}>
          Icons of <span style={{ color: GOLD, fontStyle: "italic" }}>Architecture</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} aria-hidden="true" />
      </div>
      <div className="rise-2 arch-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {MALLS.map((m, i) => (
          <article
            key={i}
            className={`arch-card ${selected === i ? "selected" : ""}`}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => e.key === "Enter" && setSelected(i)}
            tabIndex={0}
            role="button"
            aria-pressed={selected === i}
            aria-label={`Select ${m.name}`}
          >
            <div style={{ fontSize: 28, marginBottom: 12, color: GOLD }}>
              <m.Icon aria-hidden="true" />
            </div>
            <p className="serif" style={{ fontSize: "clamp(14px, 1.8vw, 17px)", fontWeight: 600, color: CREAM, marginBottom: 4 }}>{m.name}</p>
            <p className="sans" style={{ fontSize: 10, letterSpacing: "2px", color: GOLD }}>{m.city}</p>
          </article>
        ))}
      </div>
      <div className="rise-3 arch-detail" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.3)", padding: "32px 40px", display: "flex", gap: 48, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: GOLD, marginBottom: 12 }}>PROFILE</p>
          <h3 className="serif" style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, color: CREAM, marginBottom: 8 }}>{mall.name}</h3>
          <p style={{ fontSize: "clamp(14px, 1.6vw, 16px)", color: MUTED, lineHeight: 1.7 }}>{mall.fact}</p>
        </div>
        <div className="arch-detail-meta" style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 200 }}>
          {[{ label: "Est.", value: mall.year }, { label: "Total Area", value: mall.size }, { label: "Location", value: mall.city }].map((d, i) => (
            <div key={i}>
              <p className="sans" style={{ fontSize: 9, letterSpacing: "3px", color: MUTED, marginBottom: 4, textTransform: "uppercase" }}>{d.label}</p>
              <p className="serif" style={{ fontSize: "clamp(17px, 2.2vw, 22px)", color: GOLD, fontWeight: 600 }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Slide 4: Experience ─── */
function Slide4() {
  const [active, setActive] = useState("Fashion");
  const exp = EXPERIENCES[active];

  return (
    <section style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }} aria-label="Mall Experiences">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER IV</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(28px, 5vw, 64px)", fontWeight: 700, color: CREAM }}>
          The <span style={{ color: GOLD, fontStyle: "italic" }}>Experience</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} aria-hidden="true" />
      </div>
      <nav className="rise-2" style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }} aria-label="Experience categories">
        {Object.keys(EXPERIENCES).map(k => (
          <button
            key={k}
            className={`exp-pill ${active === k ? "active" : ""}`}
            onClick={() => setActive(k)}
            aria-pressed={active === k}
          >
            {k}
          </button>
        ))}
      </nav>
      <div className="exp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div className="rise-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.15)", padding: "32px 28px" }}>
          <p className="sans" style={{ fontSize: 9, letterSpacing: "4px", color: GOLD, marginBottom: 20, textTransform: "uppercase" }}>Highlights</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none" }}>
            {exp.items.map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 4, height: 4, background: GOLD, borderRadius: "50%", flexShrink: 0 }} aria-hidden="true" />
                <span className="serif" style={{ fontSize: "clamp(15px, 1.8vw, 17px)", color: CREAM, fontWeight: 300 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="rise-3" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 56, fontFamily: "serif", color: GOLD, lineHeight: 1, marginBottom: 20, opacity: 0.3 }} aria-hidden="true">"</div>
            <p className="serif" style={{ fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, color: CREAM, fontStyle: "italic", fontWeight: 300 }}>{exp.desc}</p>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}44, transparent)`, marginBottom: 20 }} aria-hidden="true" />
          <p className="sans" style={{ fontSize: 10, letterSpacing: "3px", color: MUTED }}>{active.toUpperCase()} · AMERICAN LUXURY RETAIL</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Slide 5: Stats ─── */
function Slide5() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const extra = useMemo(() => [
    { label: "Average mall size", value: "800,000 sq ft" },
    { label: "Jobs supported", value: "15.9 Million" },
    { label: "Economic output", value: "$2.6 Trillion" },
    { label: "Mall types", value: "Super · Regional · Luxury · Outlet" },
  ], []);

  return (
    <section style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }} aria-label="Statistics and Scale">
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER V</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(28px, 5vw, 64px)", fontWeight: 700, color: CREAM }}>
          Scale & <span style={{ color: GOLD, fontStyle: "italic" }}>Magnitude</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} aria-hidden="true" />
      </div>
      <div className="rise-2 stat-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
        {STATS.map((s, i) => (
          <article key={i} className="stat-card">
            <div
              className="serif"
              style={{
                fontSize: "clamp(24px, 3.5vw, 48px)",
                fontWeight: 700,
                color: GOLD,
                marginBottom: 8,
                animation: visible ? `countUp 0.6s ${i * 0.15}s ease forwards` : "none",
                opacity: visible ? undefined : 0,
              }}
            >
              {s.value}
            </div>
            <p className="sans" style={{ fontSize: "clamp(9px, 1.2vw, 11px)", letterSpacing: "2px", color: CREAM, marginBottom: 4, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ fontSize: "clamp(11px, 1.4vw, 13px)", color: MUTED }}>{s.sub}</p>
          </article>
        ))}
      </div>
      <div className="rise-3 extra-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {extra.map((e, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(201,168,76,0.12)", paddingBottom: 12, paddingTop: 12, gap: 12, flexWrap: "wrap" }}>
            <span className="sans" style={{ fontSize: 10, letterSpacing: "2px", color: MUTED, textTransform: "uppercase" }}>{e.label}</span>
            <span className="serif" style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: CREAM, fontWeight: 400 }}>{e.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Slide 6: Future ─── */
const Slide6 = memo(function Slide6() {
  return (
    <section style={{ width: "100%", maxWidth: 1050, position: "relative", zIndex: 1, textAlign: "center" }} aria-label="The Future of American Malls">
      <Particles />
      <div style={{ position: "relative" }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER VI · FINAL</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(28px, 6vw, 78px)", fontWeight: 700, color: CREAM, marginBottom: 8 }}>
          The <span style={{ color: GOLD, fontStyle: "italic" }}>Renaissance</span>
        </h2>
        <p className="rise-2" style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 300, color: MUTED, fontStyle: "italic", marginBottom: 40 }}>
          The American mall is not dying — it is transforming.
        </p>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "0 auto 48px" }} aria-hidden="true" />
        <div className="future-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }}>
          {FUTURE.map((f, i) => (
            <article key={i} className="future-card rise" style={{ animationDelay: `${0.4 + i * 0.1}s`, opacity: 0 }}>
              <div style={{ fontSize: 28, color: GOLD, marginBottom: 16, opacity: 0.7 }}>
                <f.Icon aria-hidden="true" />
              </div>
              <p className="serif" style={{ fontSize: "clamp(17px, 2vw, 20px)", fontWeight: 600, color: CREAM, marginBottom: 10 }}>{f.title}</p>
              <p style={{ fontSize: "clamp(13px, 1.4vw, 14px)", color: MUTED, lineHeight: 1.7 }}>{f.desc}</p>
            </article>
          ))}
        </div>
        <footer className="rise-4" style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "5px", color: MUTED }}>THE AMERICAN MALL · A LEGACY OF LUXURY · PAST, PRESENT & FUTURE</p>
           <p className="sans" style={{ fontSize: 10, letterSpacing: "5px", color: GOLD,marginTop:40, textAlign:"Right",marginRight:0 }}>~MADE BY KAZI FAIZ</p>
        </footer>
      </div>
    </section>
  );
});

/* ─── Slide Components Array ─── */
const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];

/* ─── Main App ─── */
export default function App() {
  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(0);

  const go = useCallback((idx) => {
    if (idx < 0 || idx >= SLIDES_CONFIG.length) return;
    setCurrent(idx);
    setKey(k => k + 1);
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrent(prev => {
          const next = prev + 1;
          if (next >= SLIDES_CONFIG.length) return prev;
          setKey(k => k + 1);
          return next;
        });
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrent(prev => {
          const next = prev - 1;
          if (next < 0) return prev;
          setKey(k => k + 1);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Touch swipe */
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const SWIPE_THRESHOLD = 50;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      // Only trigger if horizontal swipe is greater than vertical (avoid scroll conflicts)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx < 0) {
          // Swipe left → next
          setCurrent(prev => {
            const next = prev + 1;
            if (next >= SLIDES_CONFIG.length) return prev;
            setKey(k => k + 1);
            return next;
          });
        } else {
          // Swipe right → prev
          setCurrent(prev => {
            const next = prev - 1;
            if (next < 0) return prev;
            setKey(k => k + 1);
            return next;
          });
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const Comp = SLIDE_COMPONENTS[current];

  return (
    <>
      <style>{fonts}{globalStyles}</style>
      <main className="deck-root" role="region" aria-label="The American Mall presentation" aria-roledescription="carousel">

        {/* Active Slide */}
        <div
          key={key}
          className="slide active"
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${current + 1} of ${SLIDES_CONFIG.length}: ${SLIDES_CONFIG[current].label}`}
          style={{ background: `radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%), ${BLACK}` }}
        >
          <Comp />
        </div>

        {/* Top label */}
        <div className="top-bar" style={{ position: "absolute", top: 28, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: `${GOLD}88`, textTransform: "uppercase" }}>
            The American Mall
          </p>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: `${GOLD}88` }} aria-live="polite">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES_CONFIG.length).padStart(2, "0")}
          </p>
        </div>

        {/* Bottom nav */}
        <nav className="bottom-nav" style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 100 }} aria-label="Slide navigation">
          <div style={{ display: "flex", gap: 10 }} role="tablist" aria-label="Slide indicators">
            {SLIDES_CONFIG.map((s, i) => (
              <button
                key={i}
                className={`dot ${current === i ? "active" : ""}`}
                onClick={() => go(i)}
                role="tab"
                aria-selected={current === i}
                aria-label={`Go to slide ${i + 1}: ${s.label}`}
                style={{ background: current === i ? GOLD : "transparent" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              className="nav-btn"
              onClick={() => go(current - 1)}
              disabled={current === 0}
              style={{ opacity: current === 0 ? 0.3 : 1 }}
              aria-label="Previous slide"
            >
              <FiChevronLeft size={14} aria-hidden="true" /> Prev
            </button>
            <button
              className="nav-btn"
              onClick={() => go(current + 1)}
              disabled={current === SLIDES_CONFIG.length - 1}
              style={{ opacity: current === SLIDES_CONFIG.length - 1 ? 0.3 : 1 }}
              aria-label="Next slide"
            >
              Next <FiChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>

        {/* Side chapter indicators (hidden on mobile via CSS) */}
        <div className="side-nav" aria-label="Chapter indicators">
          {SLIDES_CONFIG.map((s, i) => (
            <div
              key={i}
              onClick={() => go(i)}
              onKeyDown={(e) => e.key === "Enter" && go(i)}
              tabIndex={0}
              role="button"
              aria-label={`Go to ${s.label}`}
              aria-current={current === i ? "step" : undefined}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse" }}
            >
              <div style={{ width: current === i ? 24 : 16, height: 1, background: current === i ? GOLD : `${GOLD}44`, transition: "all 0.3s" }} />
              {current === i && <span className="sans" style={{ fontSize: 9, letterSpacing: "2px", color: GOLD, whiteSpace: "nowrap" }}>{s.label.toUpperCase()}</span>}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
