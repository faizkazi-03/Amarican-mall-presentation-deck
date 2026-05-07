import { useState, useEffect, useRef } from "react";

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
  body { background: ${BLACK}; }
  .deck-root { font-family: 'Cormorant Garamond', serif; background: ${BLACK}; color: ${CREAM}; height: 100vh; overflow: hidden; position: relative; }
  .slide { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1); }
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

  .nav-btn { background: transparent; border: 1px solid rgba(201,168,76,0.4); color: ${GOLD}; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 28px; cursor: pointer; transition: all 0.3s ease; }
  .nav-btn:hover { background: rgba(201,168,76,0.12); border-color: ${GOLD}; }

  .dot { width: 6px; height: 6px; border-radius: 50%; border: 1px solid ${GOLD}; cursor: pointer; transition: all 0.3s; }
  .dot.active { background: ${GOLD}; }

  .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.2); padding: 32px 28px; flex: 1; text-align: center; transition: all 0.4s; cursor: default; }
  .stat-card:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.5); transform: translateY(-4px); }

  .arch-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15); padding: 28px 24px; transition: all 0.4s; cursor: pointer; flex: 1; }
  .arch-card:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.4); }
  .arch-card.selected { background: rgba(201,168,76,0.1); border-color: ${GOLD}; }

  .exp-pill { border: 1px solid rgba(201,168,76,0.3); padding: 10px 22px; font-family: 'Josefin Sans', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; color: ${MUTED}; }
  .exp-pill:hover { border-color: ${GOLD}; color: ${GOLD}; }
  .exp-pill.active { border-color: ${GOLD}; color: ${CREAM}; background: rgba(201,168,76,0.15); }

  .timeline-item { display: flex; gap: 28px; align-items: flex-start; }
  .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: ${GOLD}; margin-top: 6px; flex-shrink: 0; }
  .timeline-line { width: 1px; background: rgba(201,168,76,0.2); flex-shrink: 0; margin-left: 4px; }

  .particle { position: absolute; border-radius: 50%; background: ${GOLD}; animation: float 4s ease-in-out infinite; }
  .hero-bg { position: absolute; inset: 0; overflow: hidden; }

  .future-card { border: 1px solid rgba(201,168,76,0.2); padding: 28px 24px; flex: 1; transition: all 0.4s; }
  .future-card:hover { border-color: rgba(201,168,76,0.6); background: rgba(201,168,76,0.06); transform: translateY(-4px); }
`;

const MALLS = [
  { name: "Mall of America", city: "Bloomington, MN", year: 1992, size: "5.6M sq ft", fact: "Largest mall in the US with 520+ stores, an indoor theme park, and an aquarium.", icon: "🏛" },
  { name: "Aventura Mall", city: "Miami, FL", year: 1983, size: "2.7M sq ft", fact: "Home to $7M Landmark tower sculpture. Top 5 grossing malls in the nation.", icon: "☀️" },
  { name: "Bal Harbour Shops", city: "Miami, FL", year: 1965, size: "450K sq ft", fact: "The most profitable mall per square foot in the world. Pure ultra-luxury.", icon: "💎" },
  { name: "King of Prussia", city: "Philadelphia, PA", year: 1963, size: "2.9M sq ft", fact: "One of the largest retail complexes on the East Coast with over 400 stores.", icon: "👑" },
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
  { title: "Mixed-Use Revolution", desc: "Transforming into live-work-play ecosystems with apartments, offices, and green spaces woven into the retail fabric.", icon: "◈" },
  { title: "Experiential Luxury", desc: "Curated experiences over commodities — personal styling suites, immersive brand activations, and members-only lounges.", icon: "◇" },
  { title: "Sustainability", desc: "Net-zero architecture, solar canopies, vertical gardens, and LEED certification define the next generation of mall design.", icon: "◉" },
  { title: "Digital Integration", desc: "AI-powered personal shopping, AR fitting rooms, and seamless omnichannel retail create the phygital mall experience.", icon: "◎" },
];

function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
    opacity: Math.random() * 0.25 + 0.05,
  }));
  return (
    <div className="hero-bg" style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <div key={i} className="particle" style={{ width: p.size, height: p.size, top: `${p.top}%`, left: `${p.left}%`, opacity: p.opacity, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)` }} />
    </div>
  );
}

function Slide1() {
  return (
    <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 900 }}>
      <Particles />
      <p className="rise sans" style={{ letterSpacing: "8px", fontSize: 11, color: GOLD, marginBottom: 32, position: "relative" }}>EST. 1956 · A CULTURAL INSTITUTION</p>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <h1 className="rise-2 serif" style={{ fontSize: "clamp(52px, 9vw, 104px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-2px", color: CREAM, position: "relative" }}>
          THE<br />
          <span style={{ color: GOLD, fontStyle: "italic" }}>American</span><br />
          MALL
        </h1>
      </div>
      <div className="rise-3 gold-line" style={{ width: 120, margin: "28px auto" }} />
      <p className="rise-3" style={{ fontSize: 22, fontWeight: 300, color: CREAM, opacity: 0.8, letterSpacing: 1, maxWidth: 480, margin: "0 auto 40px", fontStyle: "italic" }}>
        Where commerce meets culture, and luxury finds its cathedral.
      </p>
      <p className="rise-4 sans" style={{ fontSize: 10, letterSpacing: "5px", color: MUTED, textTransform: "uppercase" }}>
        A Luxury Presentation · 6 Chapters
      </p>
    </div>
  );
}

function Slide2() {
  const events = [
    { year: "1956", title: "The First Mall", desc: "Southdale Center opens in Edina, MN — the world's first climate-controlled enclosed mall. Victor Gruen's vision changes retail forever." },
    { year: "1970s", title: "Suburban Explosion", desc: "The mall boom reshapes America's suburbs. Anchor department stores and food courts become the new town squares." },
    { year: "1990s", title: "The Golden Era", desc: "Mall of America opens in 1992. Mega-malls with theme parks, hotels, and cineplexes define peak mall culture." },
    { year: "2010s", title: "The Digital Disruption", desc: "E-commerce challenges the model. Innovators pivot toward experience, luxury, and mixed-use development." },
    { year: "Today", title: "The Renaissance", desc: "Luxury repositioning, food halls, and experiential retail breathe new life. The mall evolves — it doesn't die." },
  ];
  return (
    <div style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER II</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 700, lineHeight: 1, color: CREAM }}>
          A History of <span style={{ color: GOLD, fontStyle: "italic" }}>Grandeur</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 20 }}>
        {events.map((e, i) => (
          <div key={i} className="timeline-item rise" style={{ animationDelay: `${i * 0.12}s`, opacity: 0, marginBottom: i < events.length - 1 ? 0 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 }}>
              <div className="timeline-dot" />
              {i < events.length - 1 && <div className="timeline-line" style={{ height: 52, marginTop: 4 }} />}
            </div>
            <div style={{ paddingBottom: i < events.length - 1 ? 28 : 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
                <span className="sans" style={{ fontSize: 11, letterSpacing: "3px", color: GOLD }}>{e.year}</span>
                <span className="serif" style={{ fontSize: 20, fontWeight: 600, color: CREAM }}>{e.title}</span>
              </div>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, maxWidth: 700 }}>{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide3() {
  const [selected, setSelected] = useState(0);
  const mall = MALLS[selected];
  return (
    <div style={{ width: "100%", maxWidth: 1100, position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER III</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(36px, 5.5vw, 66px)", fontWeight: 700, lineHeight: 1.1, color: CREAM }}>
          Icons of <span style={{ color: GOLD, fontStyle: "italic" }}>Architecture</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} />
      </div>
      <div className="rise-2" style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {MALLS.map((m, i) => (
          <div key={i} className={`arch-card ${selected === i ? "selected" : ""}`} onClick={() => setSelected(i)}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
            <p className="serif" style={{ fontSize: 17, fontWeight: 600, color: CREAM, marginBottom: 4 }}>{m.name}</p>
            <p className="sans" style={{ fontSize: 10, letterSpacing: "2px", color: GOLD }}>{m.city}</p>
          </div>
        ))}
      </div>
      <div className="rise-3" style={{ background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.3)`, padding: "32px 40px", display: "flex", gap: 48, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: GOLD, marginBottom: 12 }}>PROFILE</p>
          <h3 className="serif" style={{ fontSize: 34, fontWeight: 700, color: CREAM, marginBottom: 8 }}>{mall.name}</h3>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7 }}>{mall.fact}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 200 }}>
          {[{ label: "Est.", value: mall.year }, { label: "Total Area", value: mall.size }, { label: "Location", value: mall.city }].map((d, i) => (
            <div key={i}>
              <p className="sans" style={{ fontSize: 9, letterSpacing: "3px", color: MUTED, marginBottom: 4, textTransform: "uppercase" }}>{d.label}</p>
              <p className="serif" style={{ fontSize: 22, color: GOLD, fontWeight: 600 }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slide4() {
  const [active, setActive] = useState("Fashion");
  const exp = EXPERIENCES[active];
  return (
    <div style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER IV</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(34px, 5vw, 64px)", fontWeight: 700, color: CREAM }}>
          The <span style={{ color: GOLD, fontStyle: "italic" }}>Experience</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} />
      </div>
      <div className="rise-2" style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
        {Object.keys(EXPERIENCES).map(k => (
          <button key={k} className={`exp-pill ${active === k ? "active" : ""}`} onClick={() => setActive(k)}>{k}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div className="rise-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.15)", padding: "32px 28px" }}>
          <p className="sans" style={{ fontSize: 9, letterSpacing: "4px", color: GOLD, marginBottom: 20, textTransform: "uppercase" }}>Highlights</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {exp.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 4, height: 4, background: GOLD, borderRadius: "50%", flexShrink: 0 }} />
                <span className="serif" style={{ fontSize: 17, color: CREAM, fontWeight: 300 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="rise-3" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 56, fontFamily: "serif", color: GOLD, lineHeight: 1, marginBottom: 20, opacity: 0.3 }}>"</div>
            <p className="serif" style={{ fontSize: 19, lineHeight: 1.7, color: CREAM, fontStyle: "italic", fontWeight: 300 }}>{exp.desc}</p>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}44, transparent)`, marginBottom: 20 }} />
          <p className="sans" style={{ fontSize: 10, letterSpacing: "3px", color: MUTED }}>{active.toUpperCase()} · AMERICAN LUXURY RETAIL</p>
        </div>
      </div>
    </div>
  );
}

function Slide5() {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);
  const extra = [
    { label: "Average mall size", value: "800,000 sq ft" },
    { label: "Jobs supported", value: "15.9 Million" },
    { label: "Economic output", value: "$2.6 Trillion" },
    { label: "Mall types", value: "Super · Regional · Luxury · Outlet" },
  ];
  return (
    <div style={{ width: "100%", maxWidth: 1000, position: "relative", zIndex: 1 }} ref={ref}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER V</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(34px, 5vw, 64px)", fontWeight: 700, color: CREAM }}>
          Scale & <span style={{ color: GOLD, fontStyle: "italic" }}>Magnitude</span>
        </h2>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "20px auto 0" }} />
      </div>
      <div className="rise-2" style={{ display: "flex", gap: 16, marginBottom: 40 }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="serif" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: GOLD, marginBottom: 8, animation: visible ? `countUp 0.6s ${i * 0.15}s ease forwards` : "none", opacity: visible ? undefined : 0 }}>{s.value}</div>
            <p className="sans" style={{ fontSize: 11, letterSpacing: "2px", color: CREAM, marginBottom: 4, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ fontSize: 13, color: MUTED }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rise-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {extra.map((e, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(201,168,76,0.12)", paddingBottom: 12, paddingTop: 12 }}>
            <span className="sans" style={{ fontSize: 10, letterSpacing: "2px", color: MUTED, textTransform: "uppercase" }}>{e.label}</span>
            <span className="serif" style={{ fontSize: 17, color: CREAM, fontWeight: 400 }}>{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide6() {
  return (
    <div style={{ width: "100%", maxWidth: 1050, position: "relative", zIndex: 1, textAlign: "center" }}>
      <Particles />
      <div style={{ position: "relative" }}>
        <p className="rise sans" style={{ letterSpacing: "6px", fontSize: 11, color: GOLD, marginBottom: 16 }}>CHAPTER VI · FINAL</p>
        <h2 className="rise-2 serif" style={{ fontSize: "clamp(38px, 6vw, 78px)", fontWeight: 700, color: CREAM, marginBottom: 8 }}>
          The <span style={{ color: GOLD, fontStyle: "italic" }}>Renaissance</span>
        </h2>
        <p className="rise-2" style={{ fontSize: 20, fontWeight: 300, color: MUTED, fontStyle: "italic", marginBottom: 40 }}>The American mall is not dying — it is transforming.</p>
        <div className="rise-3 gold-line" style={{ width: 80, margin: "0 auto 48px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }}>
          {FUTURE.map((f, i) => (
            <div key={i} className="future-card rise" style={{ animationDelay: `${0.4 + i * 0.1}s`, opacity: 0 }}>
              <div className="serif" style={{ fontSize: 32, color: GOLD, marginBottom: 16, opacity: 0.7 }}>{f.icon}</div>
              <p className="serif" style={{ fontSize: 20, fontWeight: 600, color: CREAM, marginBottom: 10 }}>{f.title}</p>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="rise-4" style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "5px", color: MUTED }}>THE AMERICAN MALL · A LEGACY OF LUXURY · PAST, PRESENT & FUTURE</p>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { component: Slide1, label: "Introduction" },
  { component: Slide2, label: "History" },
  { component: Slide3, label: "Architecture" },
  { component: Slide4, label: "Experience" },
  { component: Slide5, label: "Numbers" },
  { component: Slide6, label: "Future" },
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(0);

  const go = (idx) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setCurrent(idx);
    setKey(k => k + 1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  const Comp = SLIDES[current].component;

  return (
    <>
      <style>{fonts}{globalStyles}</style>
      <div className="deck-root">
        <div key={key} className="slide active" style={{ background: `radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%), ${BLACK}` }}>
          <Comp />
        </div>

        {/* Top label */}
        <div style={{ position: "absolute", top: 28, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: `${GOLD}88`, textTransform: "uppercase" }}>
            The American Mall
          </p>
          <p className="sans" style={{ fontSize: 10, letterSpacing: "4px", color: `${GOLD}88` }}>
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </p>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 100 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {SLIDES.map((s, i) => (
              <div key={i} className={`dot ${current === i ? "active" : ""}`} onClick={() => go(i)} title={s.label} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button className="nav-btn" onClick={() => go(current - 1)} disabled={current === 0} style={{ opacity: current === 0 ? 0.3 : 1 }}>← Prev</button>
            <button className="nav-btn" onClick={() => go(current + 1)} disabled={current === SLIDES.length - 1} style={{ opacity: current === SLIDES.length - 1 ? 0.3 : 1 }}>Next →</button>
          </div>
        </div>

        {/* Side chapter indicators */}
        <div style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
          {SLIDES.map((s, i) => (
            <div key={i} onClick={() => go(i)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse" }}>
              <div style={{ width: current === i ? 24 : 16, height: 1, background: current === i ? GOLD : `${GOLD}44`, transition: "all 0.3s" }} />
              {current === i && <span className="sans" style={{ fontSize: 9, letterSpacing: "2px", color: GOLD, whiteSpace: "nowrap" }}>{s.label.toUpperCase()}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}