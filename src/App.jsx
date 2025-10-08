import React, { useEffect, useMemo, useRef, useState } from "react";
import { HashRouter, Routes, Route, Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ===============================
//  AppStore – Figma → React (Tailwind + Router + Recharts)
//  - HashRouter to avoid reload issues after deploy
//  - LocalStorage installs, toast, loading animations
//  - Home, All Apps (search + sort), App Details (chart), My Installation, 404
//  Replace copy/images/colors to match your Figma exactly
// ===============================

// ---- Theme (adjust to your Figma) ----
const theme = {
  brand: {
    // ==== Figma Tokens (sample) ====
    // Primary: Violet 600, Accent: Cyan 400
    primary: "#7C3AED",
    primaryDark: "#6D28D9",
    accent: "#22D3EE",
    bg: "#0A0A0F",
    surface: "#11121A",
    text: "#F4F4FA",
    muted: "#A1A1B5",
    ring: "#C4B5FD",
    card: "#171826",
  },
};

// ---- Utilities ----
const cls = (...xs) => xs.filter(Boolean).join(" ");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ---- LocalStorage keys ----
const LS_INSTALLS = "appstore.installed";

const useInstalls = () => {
  const [installed, setInstalled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_INSTALLS) || "[]"); } catch { return []; }
  });
  const save = (next) => { setInstalled(next); localStorage.setItem(LS_INSTALLS, JSON.stringify(next)); };
  const isInstalled = (id) => installed.some((a) => a.id === id);
  const install = (app) => { if (!isInstalled(app.id)) save([...installed, app]); };
  const uninstall = (id) => save(installed.filter((a) => a.id !== id));
  return { installed, isInstalled, install, uninstall };
};

// ---- Toast ----
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  };
  const View = () => (
    <div className="fixed bottom-4 right-4 z-[999] space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-xl bg-black/80 px-4 py-3 text-sm text-white shadow-lg ring-1 ring-white/10">
          ✅ {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, View };
}

// ---- Fake images (replace with real assets or external URLs) ----
const img = (i) => `/assets/app-${i}.svg`;

// ---- Data (12–20 items) ----
export const APPS = [
  { id: 1,  image: img(1),  title: "Nova Notes",        companyName: "Nebula Labs",   description: "Minimal note app with offline sync.",        size: 38,  reviews: 1204, ratingAvg: 4.4, downloads: 540000, ratings: [{name:"1 star",count:60},{name:"2 star",count:80},{name:"3 star",count:180},{name:"4 star",count:420},{name:"5 star",count:464}] },
  { id: 2,  image: img(2),  title: "Zen Tasks",        companyName: "Flowmatic",      description: "Calm task manager with focus mode.",       size: 52,  reviews: 980,  ratingAvg: 4.2, downloads: 320000, ratings: [{name:"1 star",count:70},{name:"2 star",count:90},{name:"3 star",count:210},{name:"4 star",count:350},{name:"5 star",count:260}] },
  { id: 3,  image: img(3),  title: "Pulse Fit",        companyName: "Athlos Inc.",    description: "Workout planner & heart‑rate zones.",      size: 71,  reviews: 2200, ratingAvg: 4.7, downloads: 1200000, ratings: [{name:"1 star",count:80},{name:"2 star",count:120},{name:"3 star",count:260},{name:"4 star",count:640},{name:"5 star",count:1100}] },
  { id: 4,  image: img(4),  title: "Pixel Play",       companyName: "ArcadeWorks",    description: "Retro games hub with cloud saves.",        size: 96,  reviews: 4300, ratingAvg: 4.6, downloads: 2200000, ratings: [{name:"1 star",count:220},{name:"2 star",count:300},{name:"3 star",count:540},{name:"4 star",count:1080},{name:"5 star",count:2160}] },
  { id: 5,  image: img(5),  title: "Voyage Maps",      companyName: "CartoNine",      description: "Offline maps with hiking trails.",        size: 88,  reviews: 640,  ratingAvg: 3.9, downloads: 210000, ratings: [{name:"1 star",count:120},{name:"2 star",count:160},{name:"3 star",count:180},{name:"4 star",count:120},{name:"5 star",count:60}] },
  { id: 6,  image: img(6),  title: "Aether Mail",      companyName: "Nimbus Mail",    description: "Fast mail client with smart triage.",      size: 44,  reviews: 3100, ratingAvg: 4.5, downloads: 2700000, ratings: [{name:"1 star",count:160},{name:"2 star",count:240},{name:"3 star",count:580},{name:"4 star",count:1100},{name:"5 star",count:1020}] },
  { id: 7,  image: img(7),  title: "Bloom Budget",     companyName: "Petal Finance",   description: "Zero‑based budgeting & insights.",        size: 41,  reviews: 1500, ratingAvg: 4.3, downloads: 680000, ratings: [{name:"1 star",count:100},{name:"2 star",count:160},{name:"3 star",count:320},{name:"4 star",count:520},{name:"5 star",count:400}] },
  { id: 8,  image: img(8),  title: "Echo Reader",      companyName: "Quiet Co.",      description: "Distraction‑free reading & TTS.",         size: 36,  reviews: 860,  ratingAvg: 4.1, downloads: 300000, ratings: [{name:"1 star",count:90},{name:"2 star",count:120},{name:"3 star",count:220},{name:"4 star",count:260},{name:"5 star",count:170}] },
  { id: 9,  image: img(9),  title: "Orbit Weather",    companyName: "Cirrus",          description: "Hyper‑local weather with radar.",        size: 62,  reviews: 5100, ratingAvg: 4.8, downloads: 3400000, ratings: [{name:"1 star",count:120},{name:"2 star",count:180},{name:"3 star",count:400},{name:"4 star",count:1400},{name:"5 star",count:3000}] },
  { id: 10, image: img(10), title: "Ripple Radio",     companyName: "Wavelength",      description: "Podcasts with live captions.",           size: 59,  reviews: 2900, ratingAvg: 4.6, downloads: 1950000, ratings: [{name:"1 star",count:160},{name:"2 star",count:210},{name:"3 star",count:390},{name:"4 star",count:980},{name:"5 star",count:1160}] },
  { id: 11, image: img(11), title: "Luma Camera",      companyName: "Photonix",        description: "Pro camera with RAW & LUTs.",            size: 112, reviews: 4000, ratingAvg: 4.4, downloads: 2500000, ratings: [{name:"1 star",count:180},{name:"2 star",count:260},{name:"3 star",count:520},{name:"4 star",count:1280},{name:"5 star",count:1760}] },
  { id: 12, image: img(12), title: "Drift Sleep",      companyName: "Serene Labs",     description: "Sleep sounds & smart alarms.",           size: 48,  reviews: 720,  ratingAvg: 4.0, downloads: 420000, ratings: [{name:"1 star",count:120},{name:"2 star",count:140},{name:"3 star",count:220},{name:"4 star",count:160},{name:"5 star",count:80}] },
  { id: 13, image: img(13), title: "Crisp Translate",  companyName: "Lexico AI",       description: "On‑device translator & OCR.",           size: 64,  reviews: 2100, ratingAvg: 4.5, downloads: 1600000, ratings: [{name:"1 star",count:130},{name:"2 star",count:210},{name:"3 star",count:470},{name:"4 star",count:900},{name:"5 star",count:1290}] },
  { id: 14, image: img(14), title: "Tempo Music",      companyName: "Cadence",         description: "Hi‑fi streaming with EQ.",               size: 85,  reviews: 5200, ratingAvg: 4.7, downloads: 5100000, ratings: [{name:"1 star",count:300},{name:"2 star",count:420},{name:"3 star",count:700},{name:"4 star",count:1600},{name:"5 star",count:3180}] },
  { id: 15, image: img(15), title: "Mosaic Sketch",    companyName: "Atelier",         description: "Vector + pixel hybrid drawing.",        size: 103, reviews: 1750, ratingAvg: 4.2, downloads: 880000, ratings: [{name:"1 star",count:160},{name:"2 star",count:200},{name:"3 star",count:420},{name:"4 star",count:540},{name:"5 star",count:430}] },
  { id: 16, image: img(16), title: "Courier Scan",     companyName: "PostRoute",       description: "Track parcels across carriers.",         size: 35,  reviews: 980,  ratingAvg: 4.1, downloads: 610000, ratings: [{name:"1 star",count:110},{name:"2 star",count:150},{name:"3 star",count:260},{name:"4 star",count:260},{name:"5 star",count:200}] },
];

// ---- App Shell with loading on navigation ----
function AppShell({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    let alive = true;
    (async () => { setLoading(true); await delay(400); if (alive) setLoading(false); })();
    
  const cssVars = {"--brand": theme.brand.primary, "--brandDark": theme.brand.primaryDark, "--accent": theme.brand.accent, "--bg": theme.brand.bg, "--surface": theme.brand.surface, "--text": theme.brand.text, "--muted": theme.brand.muted, "--ring": theme.brand.ring, "--card": theme.brand.card};
  console.log('[AppShell] render');
  return () => { alive = false; };
  }, [location.pathname, location.search]);
  return (
    <div style={cssVars}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Header />
        {loading && <LoadingOverlay label="Loading page…" />}
        <div className={cls(loading && "pointer-events-none opacity-60")}>{children}</div>
        <Footer />
      </div>
    </div>
  );
}

// ---- Header ----
function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--bg)/0.7] backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-lg font-semibold">Hero IO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({isActive}) => cls("px-2 py-1 rounded-md text-[var(--muted)] hover:text-[var(--text)]", isActive && "bg-white/10 text-white")}>home</NavLink>
            <NavLink to="/apps" className={({isActive}) => cls("px-2 py-1 rounded-md text-[var(--muted)] hover:text-[var(--text)]", isActive && "bg-white/10 text-white")}>apps</NavLink>
            <NavLink to="/installation" className={({isActive}) => cls("px-2 py-1 rounded-md text-[var(--muted)] hover:text-[var(--text)]", isActive && "bg-white/10 text-white")}>installation</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <a href="https://github.com/yourname" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold shadow hover:opacity-90">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="opacity-90"><path d="M8 .2l2.49 5.05L16 6.15l-4 3.9.94 5.49L8 12.93 3.06 15.54 4 10.05 0 6.15l5.51-.9L8 .2z"/></svg>
              Contribute
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---- Footer (custom) ----
function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="mb-3 h-8 w-8 rounded-xl bg-[var(--brand)]" />
          <p className="text-[var(--muted)]">Crafted with ♥ for speed & clarity.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Explore</p>
          <div className="space-y-2 text-[var(--muted)]">
            <Link to="/apps" className="hover:text-white">All apps</Link><br/>
            <a href="https://apps.apple.com/" className="hover:text-white" target="_blank" rel="noreferrer">App Store</a><br/>
            <a href="https://play.google.com/" className="hover:text-white" target="_blank" rel="noreferrer">Play Store</a>
          </div>
        </div>
        <div>
          <p className="mb-2 font-semibold">Company</p>
          <div className="space-y-2 text-[var(--muted)]">
            <a className="hover:text-white" href="#">About</a><br/>
            <a className="hover:text-white" href="#">Contact</a>
          </div>
        </div>
        <div>
          <p className="mb-2 font-semibold">Legal</p>
          <div className="space-y-2 text-[var(--muted)]">
            <a className="hover:text-white" href="#">Terms</a><br/>
            <a className="hover:text-white" href="#">Privacy</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-[var(--muted)]">© {new Date().getFullYear()} Hero IO — All rights reserved.</div>
    </footer>
  );
}

// ---- Loading overlay ----
function LoadingOverlay({ label = "Loading…" }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-black/70 px-4 py-3 text-sm ring-1 ring-white/10">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span>{label}</span>
      </div>
    </div>
  );
}

// ---- Cards & bits ----
function AppCard({ app, onClick }) {
  return (
    <button onClick={onClick} className="group text-left rounded-2xl bg-[var(--card)] p-4 ring-1 ring-white/10 transition hover:ring-[var(--ring)]/40">
      <div className="flex items-center gap-4">
        <img src={app.image} alt={app.title} className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{app.title}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Downloads: {app.downloads.toLocaleString()} • ★ {app.ratingAvg.toFixed(1)}</p>
        </div>
      </div>
    </button>
  );
}

// ---- Home ----
function Home() {
  const navigate = useNavigate();
  // pick top 8 by downloads
  const top = useMemo(() => [...APPS].sort((a,b)=>b.downloads-a.downloads).slice(0,8), []);
  return (
    <div style={cssVars}>
      {/* Banner */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[55rem] w-[55rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{background: "radial-gradient(closest-side, var(--brand) 0%, transparent 70%)"}} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Discover & install amazing apps</h1>
            <p className="mt-4 text-[var(--muted)]">Curated experiences from indie teams and beloved brands. Built to mirror your Figma layout.</p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a href="https://apps.apple.com/" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 font-semibold hover:bg-[var(--brandDark)]">App Store</a>
              <a href="https://play.google.com/" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 px-5 hover:border-white/20">Play Store</a>
            </div>
          </div>
        </div>
      </section>

      {/* States */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Trusted by millions", style: "bg-gradient-to-tr from-emerald-600/20 to-emerald-400/10" },
          { title: "Blazing‑fast UI", style: "bg-gradient-to-tr from-sky-600/20 to-sky-400/10" },
          { title: "Secure by default", style: "bg-gradient-to-tr from-fuchsia-600/20 to-fuchsia-400/10" },
        ].map((s,i)=> (
          <div key={i} className={cls("rounded-2xl p-6 ring-1 ring-white/10", s.style)}>
            <p className="text-lg font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Edit copy & style per your Figma.</p>
          </div>
        ))}
      </section>

      {/* Top Apps */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Top apps</h2>
            <p className="text-sm text-[var(--muted)]">Hand‑picked based on downloads.</p>
          </div>
          <button onClick={()=>navigate("/apps")} className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-white/20">Show all</button>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {top.map((app)=> (
            <AppCard key={app.id} app={app} onClick={()=>navigate(`/apps/${app.id}`)} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- All Apps ----
function AllApps() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("none"); // none | hl | lh (High→Low, Low→High)

  const list = useMemo(() => {
    let items = APPS.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === "hl") items = [...items].sort((a,b)=> b.downloads - a.downloads); // High→Low
    if (sort === "lh") items = [...items].sort((a,b)=> a.downloads - b.downloads); // Low→High
    return items;
  }, [query, sort]);

  // show loading during search (debounced)
  const typing = useRef();
  const onType = (v) => {
    setLoading(true);
    clearTimeout(typing.current);
    typing.current = setTimeout(() => { setQuery(v); setLoading(false); }, 300);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold">Browse all apps</h1>
        <p className="mt-1 text-[var(--muted)]">Find your next favorite tool.</p>
      </div>

      {/* Search + States */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[var(--muted)]">Total apps: {APPS.length}</div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="rounded-xl border border-white/10 bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="none">Sort by downloads</option>
            <option value="hl">High → Low</option>
            <option value="lh">Low → High</option>
          </select>
          <div className="relative">
            <input onChange={(e)=>onType(e.target.value)} placeholder="Search apps…" className="w-64 rounded-xl border border-white/10 bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          </div>
        </div>
      </div>

      {/* Results */}
      {list.length === 0 ? (
        <div className="mt-10 rounded-xl border border-white/10 p-6 text-center text-[var(--muted)]">No App Found</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((app)=> (
            <AppCard key={app.id} app={app} onClick={()=>navigate(`/apps/${app.id}`)} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---- App Details ----
function AppDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = APPS.find((a) => String(a.id) === String(id));
  const { isInstalled, install } = useInstalls(); // new instance each render – OK for lookups
  const { push, View } = useToast();

  if (!app) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-lg font-semibold">App not found</p>
          <p className="mt-2 text-[var(--muted)]">We couldn't find that app. It may have moved or been removed.</p>
          <div className="mt-6">
            <button className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-white/20" onClick={()=>navigate('/apps')}>Back to all apps</button>
          </div>
        </div>
      </section>
    );
  }

  const installed = isInstalled(app.id);

  const onInstall = () => {
    if (installed) return;
    install(app);
    push(`${app.title} installed`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: image */}
        <div>
          <img src={app.image} alt={app.title} className="w-full max-w-sm rounded-2xl object-cover ring-1 ring-white/10" />
        </div>

        {/* Middle: info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{app.title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">by {app.companyName}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-lg bg-white/5 px-3 py-1">★ {app.ratingAvg.toFixed(1)}</span>
            <span className="rounded-lg bg-white/5 px-3 py-1">{app.reviews.toLocaleString()} reviews</span>
            <span className="rounded-lg bg-white/5 px-3 py-1">{app.downloads.toLocaleString()} downloads</span>
            <span className="rounded-lg bg-white/5 px-3 py-1">{app.size} MB</span>
          </div>
          <div className="mt-6">
            <button disabled={installed} onClick={onInstall} className={cls("rounded-xl px-5 py-3 font-semibold", installed ? "bg-white/10 text-[var(--muted)] cursor-not-allowed" : "bg-[var(--brand)] hover:bg-[var(--brandDark)]")}>{installed ? "Installed" : "Install"}</button>
          </div>

          {/* Chart */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Ratings breakdown</h2>
            <div className="mt-4 h-64 w-full rounded-2xl bg-[var(--card)] p-3 ring-1 ring-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={app.ratings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#A7A7BE" />
                  <YAxis stroke="#A7A7BE" />
                  <Tooltip contentStyle={{ background: "#111119", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#EDEDF5" }} />
                  <Bar dataKey="count" fill="var(--brand)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-3 text-[var(--muted)] max-w-prose">{app.description} Edit this section to follow your exact Figma layout: multi‑paragraph copy, bullet points, or a features grid.</p>
          </div>
        </div>
      </div>
      <View />
    </section>
  );
}

// ---- My Installation ----
function MyInstallation() {
  const { installed, uninstall } = useInstalls();
  const { push, View } = useToast();
  const navigate = useNavigate();

  const onUninstall = (id, title) => { uninstall(id); push(`${title} uninstalled`); };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Installation</h1>
          <p className="mt-1 text-[var(--muted)]">Apps you have installed on this device.</p>
        </div>
      </div>

      {installed.length === 0 ? (
        <div className="mt-10 rounded-xl border border-white/10 p-6 text-center text-[var(--muted)]">
          Nothing here yet. Browse apps and click <span className="font-semibold text-white">Install</span>.
          <div className="mt-4"><button onClick={()=>navigate('/apps')} className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-white/20">Go to All Apps</button></div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {installed.map((app)=> (
            <div key={app.id} className="rounded-2xl bg-[var(--card)] p-4 ring-1 ring-white/10">
              <img src={app.image} alt={app.title} className="h-24 w-24 rounded-xl object-cover" />
              <p className="mt-3 font-semibold">{app.title}</p>
              <p className="text-xs text-[var(--muted)]">Downloads: {app.downloads.toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={()=>navigate(`/apps/${app.id}`)} className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:border-white/20">Open</button>
                <button onClick={()=>onUninstall(app.id, app.title)} className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/15">Uninstall</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <View />
    </section>
  );
}

// ---- 404 ----
function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <p className="text-6xl font-black">404</p>
        <p className="mt-2 text-[var(--muted)]">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-white/20">Back to home</Link>
      </div>
    </section>
  );
}

// ---- Router Root ----
export default function AppStore() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apps" element={<AllApps />} />
          <Route path="/apps/:id" element={<AppDetails />} />
          <Route path="/installation" element={<MyInstallation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
