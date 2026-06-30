import { useState, useCallback } from "react";

/*
 * LayoutConfigEditor.jsx
 *
 * Manual control panel for every responsive value across the hero:
 * cup/satellite geometry (position, size, rotation) AND the CSS layout
 * zones (headline / cup-box / paragraph / CTAs) that stack on mobile.
 *
 * IMPORTANT — these two halves don't share the same number of tiers,
 * because they don't work the same way in the actual code:
 *
 *   CUP GEOMETRY (left tab) has exactly 3 KEYFRAMES per cup —
 *   Desktop, Mobile (anchored at 700px), Small-Mobile (anchored at
 *   300px) — see cupConfig.js's resolveCupGeometry(). Everything
 *   between 700px and 300px is a continuous blend (t2) between the
 *   Mobile and Small-Mobile keyframes; there's no such thing as
 *   "cup position at 550px" as an independent value, it's always
 *   interpolated. So this tab edits 3 keyframes, not 5 tiers.
 *
 *   CSS LAYOUT ZONES (right tab) genuinely ARE 5 separate discrete
 *   tiers in Hero.css (Desktop, 600-700, 500-600, 400-500, 300-400),
 *   each with its own real @media block and its own pixel budgets —
 *   see the --oh4-head-h / --oh4-cup-h / --oh4-para-h chain. These
 *   don't blend into each other; each tier is its own fixed CSS rule
 *   set, so 5 independent tiers is the correct, accurate model here.
 *
 * Both halves generate copy-pasteable code in the right-hand panel —
 * no live visual preview by design (check real values in your actual
 * browser, since dummy data here would just be a guess at how real
 * text/fonts/textures actually render).
 */

// ── cup geometry: 3 keyframes ───────────────────────────────────────────────

const CUP_KEYFRAMES = ["desktop", "mobile", "small"];
const CUP_KEYFRAME_LABELS = {
  desktop: "Desktop (≥1000px)",
  mobile: "Mobile (700px anchor)",
  small: "Small-Mobile (300px anchor)",
};

// field-name prefix per keyframe, matching cupConfig.js's actual property
// names exactly — 'desktop' has no prefix (idlePos/width/height), the
// other two are mobileIdlePos/mobileWidth/mobileHeight and
// smallMobileIdlePos/smallMobileWidth/smallMobileHeight.
const CUP_FIELD_PREFIX = { desktop: "", mobile: "mobile", small: "smallMobile" };

function emptyCupKeyframe() {
  return { idlePos: [0, 0, 0], width: 1, height: 1 };
}

const INITIAL_SAT_CUPS = [
  {
    id: "cup1",
    label: "Cup 1 (Pizza)",
    rotation: [0, 0, -0.06],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [-0.25, 0.6, 0.35], width: 1.73, height: 1.85 },
    mobile: { idlePos: [-1.5, 0.55, 0.35], width: 1.5, height: 1.87 },
    small: { idlePos: [-0.92, 0.62, 0.35], width: 1.02, height: 1.27 },
  },
  {
    id: "cup2",
    label: "Cup 2 (Pasta)",
    rotation: [0, 0, -0.35],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [3.25, 0.65, -0.25], width: 1.78, height: 1.82 },
    mobile: { idlePos: [1.0, 0.6, -0.25], width: 1.03, height: 1.05 },
    small: { idlePos: [0.66, 0.66, -0.25], width: 0.74, height: 0.76 },
  },
  {
    id: "cup3",
    label: "Cup 3 (Desserts)",
    rotation: [0, 0, 0.08],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [-0.25, -1.2, 0.45], width: 1.76, height: 1.82 },
    mobile: { idlePos: [-1.5, -0.95, 0.45], width: 1.42, height: 1.35 },
    small: { idlePos: [-0.92, -0.78, 0.45], width: 0.96, height: 0.92 },
  },
  {
    id: "cup4",
    label: "Cup 4 (Drinks)",
    rotation: [0, 0, -0.5],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [3.35, -1.2, 0.1], width: 1.69, height: 1.7 },
    mobile: { idlePos: [1.0, -0.75, 0.1], width: 0.98, height: 0.98 },
    small: { idlePos: [0.66, -0.68, 0.1], width: 0.68, height: 0.68 },
  },
  {
    id: "cup5",
    label: "Cup 5 (Coffee — satellite)",
    rotation: [0, 0, -0.15],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [0.44, -1.17, 0.0], width: 3.28, height: 3.856 },
    mobile: { idlePos: [-0.5, -0.55, 0.0], width: 2.03, height: 2.39 },
    small: { idlePos: [-0.1, -0.45, 0.0], width: 1.57, height: 1.85 },
  },
  {
    id: "cup6",
    label: "Cup 6 (Bites)",
    rotation: [0, 0, 0.1],
    opacity: 1,
    renderOrder: 0,
    desktop: { idlePos: [1.5, 0.0, -0.1], width: 6.8, height: 4.9 },
    mobile: { idlePos: [0.55, -0.05, -0.1], width: 3.4, height: 2.45 },
    small: { idlePos: [0.3, 0.05, -0.1], width: 2.15, height: 1.55 },
  },
];

const INITIAL_MAIN_CUP = {
  rotationZ: -0.15,
  meshOffsetXDesktop: 0.44,
  meshOffsetXMobile: 0.273,
  meshOffsetXSmall: 0.211,
  height: 1.205,
  desktop: { idleY: -1.87, idleScale: 3.2, risenY: 0.5, risenScale: 3.55 },
  mobile: { idleY: -0.55, idleScale: 1.984, risenY: 0.35, risenScale: 2.201 },
  small: { idleY: -0.45, idleScale: 1.536, risenY: 0.25, risenScale: 1.704 },
};

// ── CSS layout zones: 5 discrete tiers ──────────────────────────────────────

const CSS_TIERS = ["t700", "t600", "t500", "t400", "t300"];
const CSS_TIER_LABELS = {
  t700: "Base <700px",
  t600: "600–700px",
  t500: "500–600px",
  t400: "400–500px",
  t300: "300–400px",
};
const CSS_TIER_MEDIA = {
  t700: "@media (max-width: 700px)",
  t600: "@media (max-width: 700px) and (min-width: 601px)",
  t500: "@media (max-width: 600px)",
  t400: "@media (max-width: 500px)",
  t300: "@media (max-width: 400px)",
};

const INITIAL_CSS_ZONES = {
  t700: {
    heroMinHeight: 560,
    headH: 200,
    cupH: 260,
    paraH: 110,
    headlineFontMin: 26, headlineFontVw: 8, headlineFontMax: 38,
    hl3FontMin: 30, hl3FontVw: 9, hl3FontMax: 44,
    paraMaxCh: 32,
    paraFontPx: 13,
    ctaPaddingBottomMin: 28, ctaPaddingBottomVh: 5.5, ctaPaddingBottomMax: 48,
  },
//   t600: { headH: 1190, cupH: 240, paraH: 105 },
  t500: {
    headH: 175, cupH: 215, paraH: 100,
    headlineFontMin: 24, headlineFontVw: 7.5, headlineFontMax: 34,
    hl3FontMin: 27, hl3FontVw: 8.5, hl3FontMax: 38,
    paraMaxCh: 30, paraFontPx: 12.5,
    ctaPaddingBottomMin: 22, ctaPaddingBottomVh: 4.6, ctaPaddingBottomMax: 38,
  },
  t400: {
    headH: 158, cupH: 195, paraH: 100,
    headlineFontMin: 21, headlineFontVw: 7, headlineFontMax: 29,
    hl3FontMin: 24, hl3FontVw: 7.8, hl3FontMax: 33,
    paraMaxCh: 27, paraFontPx: 11.5,
    ctaPaddingBottomMin: 18, ctaPaddingBottomVh: 3.8, ctaPaddingBottomMax: 30,
  },
  t300: {
    heroMinHeight: 560,
    headH: 140, cupH: 185, paraH: 96,
    headlineFontMin: 18, headlineFontVw: 6.8, headlineFontMax: 25,
    hl3FontMin: 20, hl3FontVw: 7.5, hl3FontMax: 28,
    paraMaxCh: 25, paraFontPx: 10.5,
    ctaPaddingBottomMin: 14, ctaPaddingBottomVh: 3, ctaPaddingBottomMax: 24,
  },
};

// ── helpers ─────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === undefined || n === null || Number.isNaN(n)) return 0;
  return parseFloat(Number(n).toFixed(4));
}

function Slider({ label, value, min, max, step = 0.01, onChange, unit = "" }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color: "#e8d5b0", fontVariantNumeric: "tabular-nums" }}>{fmt(value)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#c9a96e", cursor: "pointer" }}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function TabBar({ tabs, active, onSelect, labels }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 16, flexWrap: "wrap" }}>
      {tabs.map((key) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            background: active === key ? "#1e1a14" : "transparent",
            border: "1px solid " + (active === key ? "#c9a96e" : "#333"),
            borderRadius: 4,
            color: active === key ? "#e8d5b0" : "#888",
            cursor: "pointer",
            fontSize: 11,
            padding: "5px 10px",
          }}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}

// ── code generators ─────────────────────────────────────────────────────────

function generateCupConfig(satCups) {
  const entries = satCups
    .map((c) => {
      const d = c.desktop, m = c.mobile, s = c.small;
      return `  {
    id: '${c.id}',
    url: cup${c.id.replace("cup", "")}Url,
    idlePos:    [${d.idlePos.map(fmt).join(", ")}],
    scatterPos: [${d.idlePos.map(fmt).join(", ")}], // scatter unchanged — edit in original cupConfig.js if needed
    width: ${fmt(d.width)},
    height: ${fmt(d.height)},
    rotation: [${fmt(c.rotation[0])}, ${fmt(c.rotation[1])}, ${fmt(c.rotation[2])}],
    opacity: ${c.opacity},${c.id === "cup6" ? "\n    renderOrder: 0," : ""}
    mobileIdlePos: [${m.idlePos.map(fmt).join(", ")}],
    mobileWidth:  ${fmt(m.width)},
    mobileHeight: ${fmt(m.height)},
    smallMobileIdlePos: [${s.idlePos.map(fmt).join(", ")}],
    smallMobileWidth:  ${fmt(s.width)},
    smallMobileHeight: ${fmt(s.height)},
  }`;
    })
    .join(",\n");

  return `// cupConfig.js — generated by LayoutConfigEditor
// Paste this CUP_CONFIGS array over the existing one in cupConfig.js.
// Keep the file's resolveCupGeometry() / CUP_CONFIG_BY_ID / CATEGORY_TO_CUP
// exports as they are — only CUP_CONFIGS itself needs replacing.

export const CUP_CONFIGS = [
${entries}
];
`;
}

function generateMainCupPatch(main) {
  const d = main.desktop, m = main.mobile, s = main.small;
  return `// MainCupImage.jsx — REPLACE these constants near the top of the file
// (everything else — useFrame logic, freeze handling, etc — stays the same)

const ROTATION    = [0, 0, ${fmt(main.rotationZ)}];

// Idle resting position — desktop
const IDLE_Y     = ${fmt(d.idleY)};
const IDLE_SCALE = ${fmt(d.idleScale)};

// Risen (fully scrolled) position — desktop
const RISEN_Y     = ${fmt(d.risenY)};
const RISEN_SCALE = ${fmt(d.risenScale)};

const MESH_OFFSET_X = ${fmt(main.meshOffsetXDesktop)};

// --- Mobile counterparts (keep in sync with cupConfig.js's cup5.mobile*) ---
const IDLE_Y_MOBILE      = ${fmt(m.idleY)};
const IDLE_SCALE_MOBILE  = ${fmt(m.idleScale)};
const RISEN_Y_MOBILE     = ${fmt(m.risenY)};
const RISEN_SCALE_MOBILE = ${fmt(m.risenScale)};
const MESH_OFFSET_X_MOBILE = ${fmt(main.meshOffsetXMobile)};

// --- Small-mobile counterparts (keep in sync with cupConfig.js's cup5.smallMobile*) ---
const IDLE_Y_SMALL      = ${fmt(s.idleY)};
const IDLE_SCALE_SMALL  = ${fmt(s.idleScale)};
const RISEN_Y_SMALL      = ${fmt(s.risenY)};
const RISEN_SCALE_SMALL  = ${fmt(s.risenScale)};
const MESH_OFFSET_X_SMALL = ${fmt(main.meshOffsetXSmall)};

// Inside the return() — only the plane height changes:
//   const height = ${fmt(main.height)};
//   const width  = height * CUP5_ASPECT;
`;
}

function clampStr(min, vw, max, unit = "px") {
  return `clamp(${fmt(min)}${unit}, ${fmt(vw)}vw, ${fmt(max)}${unit})`;
}
function clampStrVh(min, vh, max, unit = "px") {
  return `clamp(${fmt(min)}${unit}, ${fmt(vh)}vh, ${fmt(max)}${unit})`;
}

function generateHeroCss(zones) {
  const t700 = zones.t700, t600 = zones.t600, t500 = zones.t500, t400 = zones.t400, t300 = zones.t300;

  return `/* Hero.css — generated by LayoutConfigEditor
   Paste this whole block over the existing "MOBILE (<700px)" +
   "SUB-700px TIERS" section in Hero.css (everything from the
   "MOBILE (<700px)" comment banner through the end of the
   "300–400px" tier, right before @media (prefers-reduced-motion)).
   Each tier's --oh4-head-h / --oh4-cup-h / --oh4-para-h chain stacks
   zones additively (headline -> cup -> paragraph -> CTAs), so they
   can't overlap regardless of real viewport height. */

@media (max-width: 700px) {
  .oh4-hero {
    min-height: ${fmt(t700.heroMinHeight)}px;
    --oh4-head-h: ${fmt(t700.headH)}px;
    --oh4-cup-h:  ${fmt(t700.cupH)}px;
    --oh4-para-h: ${fmt(t700.paraH)}px;
  }

  .oh4-left-col {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: var(--oh4-head-h);
    width: 100%;
    padding: clamp(40px, 9vh, 64px) clamp(22px, 7vw, 30px) 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    text-align: center;
    gap: 0;
  }

  .oh4-eyebrow { justify-content: center; margin-bottom: clamp(10px, 1.6vh, 16px); }

  .oh4-headline { align-items: center; }
  .oh4-hl-line1, .oh4-hl-line2 {
    font-size: ${clampStr(t700.headlineFontMin, t700.headlineFontVw, t700.headlineFontMax)};
    text-align: center;
  }
  .oh4-hl-line3 {
    font-size: ${clampStr(t700.hl3FontMin, t700.hl3FontVw, t700.hl3FontMax)};
    text-align: center;
  }
  .oh4-headline::after { margin-left: auto; margin-right: auto; }

  .oh4-canvas-wrap {
    inset: auto 0 auto 0;
    top: var(--oh4-head-h);
    height: var(--oh4-cup-h);
  }

  .oh4-hero-para {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(var(--oh4-head-h) + var(--oh4-cup-h));
    height: var(--oh4-para-h);
    width: 100%;
    margin: 0;
    padding: 0 clamp(24px, 7vw, 36px);
    text-align: center;
    max-width: ${fmt(t700.paraMaxCh)}ch;
    font-size: ${fmt(t700.paraFontPx)}px;
    margin-left: auto;
    margin-right: auto;
    pointer-events: none;
  }

  .oh4-hero-ctas {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(var(--oh4-head-h) + var(--oh4-cup-h) + var(--oh4-para-h));
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: calc(100% - clamp(48px, 14vw, 72px));
    max-width: 300px;
    margin: 0 auto;
    padding-bottom: ${clampStrVh(t700.ctaPaddingBottomMin, t700.ctaPaddingBottomVh, t700.ctaPaddingBottomMax)};
    pointer-events: auto;
  }
  .oh4-cta-gold, .oh4-cta-outline {
    justify-content: center;
    width: 100%;
  }
  .oh4-cta-outline { display: inline-flex; }

  .oh4-cat-bar    { display: none; }
  .oh4-stamp      { display: none; }
  .oh4-flourish   { display: none; }
  .oh4-stats-bar  { display: none; }

  .oh4-menu-panel { bottom: clamp(56px, 9vh, 76px); }
  .oh4-scroll-hint { bottom: 10px; }
}

/* ── 600–700px ── */
@media (max-width: 700px) and (min-width: 601px) {
  .oh4-hero {
    --oh4-head-h: ${fmt(t600.headH)}px;
    --oh4-cup-h:  ${fmt(t600.cupH)}px;
    --oh4-para-h: ${fmt(t600.paraH)}px;
  }
}

/* ── 500–600px ── */
@media (max-width: 600px) {
  .oh4-hero {
    --oh4-head-h: ${fmt(t500.headH)}px;
    --oh4-cup-h:  ${fmt(t500.cupH)}px;
    --oh4-para-h: ${fmt(t500.paraH)}px;
  }
  .oh4-hl-line1, .oh4-hl-line2 { font-size: ${clampStr(t500.headlineFontMin, t500.headlineFontVw, t500.headlineFontMax)}; }
  .oh4-hl-line3   { font-size: ${clampStr(t500.hl3FontMin, t500.hl3FontVw, t500.hl3FontMax)}; }
  .oh4-eyebrow    { font-size: 9px; }

  .oh4-hero-para  {
    max-width: ${fmt(t500.paraMaxCh)}ch;
    font-size: ${fmt(t500.paraFontPx)}px;
  }
  .oh4-hero-ctas  {
    gap: 9px;
    max-width: 280px;
    padding-bottom: ${clampStrVh(t500.ctaPaddingBottomMin, t500.ctaPaddingBottomVh, t500.ctaPaddingBottomMax)};
  }
}

/* ── 400–500px ── */
@media (max-width: 500px) {
  .oh4-hero {
    --oh4-head-h: ${fmt(t400.headH)}px;
    --oh4-cup-h:  ${fmt(t400.cupH)}px;
    --oh4-para-h: ${fmt(t400.paraH)}px;
  }
  .oh4-eyebrow    { font-size: 8px; }
  .oh4-hl-line1, .oh4-hl-line2 { font-size: ${clampStr(t400.headlineFontMin, t400.headlineFontVw, t400.headlineFontMax)}; }
  .oh4-hl-line3   { font-size: ${clampStr(t400.hl3FontMin, t400.hl3FontVw, t400.hl3FontMax)}; }

  .oh4-hero-para  {
    font-size: ${fmt(t400.paraFontPx)}px;
    line-height: 1.55;
    max-width: ${fmt(t400.paraMaxCh)}ch;
  }
  .oh4-hero-ctas  {
    gap: 8px;
    max-width: 240px;
    padding-bottom: ${clampStrVh(t400.ctaPaddingBottomMin, t400.ctaPaddingBottomVh, t400.ctaPaddingBottomMax)};
  }
  .oh4-cta-gold, .oh4-cta-outline { padding: 10px 18px; font-size: 11px; }
}

/* ── 300–400px ── */
@media (max-width: 400px) {
  .oh4-hero {
    min-height: ${fmt(t300.heroMinHeight)}px;
    --oh4-head-h: ${fmt(t300.headH)}px;
    --oh4-cup-h:  ${fmt(t300.cupH)}px;
    --oh4-para-h: ${fmt(t300.paraH)}px;
  }
  .oh4-eyebrow    { font-size: 7.5px; }
  .oh4-hl-line1, .oh4-hl-line2 { font-size: ${clampStr(t300.headlineFontMin, t300.headlineFontVw, t300.headlineFontMax)}; }
  .oh4-hl-line3   { font-size: ${clampStr(t300.hl3FontMin, t300.hl3FontVw, t300.hl3FontMax)}; }

  .oh4-hero-para  {
    font-size: ${fmt(t300.paraFontPx)}px;
    line-height: 1.48;
    max-width: ${fmt(t300.paraMaxCh)}ch;
    padding: 0 18px;
  }
  .oh4-hero-ctas  {
    gap: 7px;
    max-width: 210px;
    padding-bottom: ${clampStrVh(t300.ctaPaddingBottomMin, t300.ctaPaddingBottomVh, t300.ctaPaddingBottomMax)};
  }
  .oh4-cta-gold, .oh4-cta-outline { padding: 9px 14px; font-size: 10px; gap: 7px; }
  .oh4-cta-icon   { font-size: 12px; }
  .oh4-scroll-hint{ bottom: 8px; font-size: 7px; }
}
`;
}

// ── main component ──────────────────────────────────────────────────────────

export default function LayoutConfigEditor() {
  const [mode, setMode] = useState("cups"); // "cups" | "css"
  const [copied, setCopied] = useState(null);

  // cup geometry state
  const [satCups, setSatCups] = useState(INITIAL_SAT_CUPS);
  const [mainCup, setMainCup] = useState(INITIAL_MAIN_CUP);
  const [selectedCupId, setSelectedCupId] = useState("main");
  const [keyframe, setKeyframe] = useState("desktop");

  // css zone state
  const [cssZones, setCssZones] = useState(INITIAL_CSS_ZONES);
  const [cssTab, setCssTab] = useState("t700");

  const updateSatField = useCallback((id, keyframeName, field, value) => {
    setSatCups((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [keyframeName]: { ...c[keyframeName], [field]: value } } : c))
    );
  }, []);

  const updateSatVec = useCallback((id, keyframeName, axis, value) => {
    setSatCups((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const arr = [...c[keyframeName].idlePos];
        arr[axis] = value;
        return { ...c, [keyframeName]: { ...c[keyframeName], idlePos: arr } };
      })
    );
  }, []);

  const updateSatRotation = useCallback((id, axis, value) => {
    setSatCups((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const arr = [...c.rotation];
        arr[axis] = value;
        return { ...c, rotation: arr };
      })
    );
  }, []);

  const updateMainField = useCallback((field, value) => {
    setMainCup((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateMainKeyframe = useCallback((keyframeName, field, value) => {
    setMainCup((prev) => ({ ...prev, [keyframeName]: { ...prev[keyframeName], [field]: value } }));
  }, []);

  const updateCssZone = useCallback((tier, field, value) => {
    setCssZones((prev) => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
  }, []);

  const resetCups = () => {
    setSatCups(INITIAL_SAT_CUPS);
    setMainCup(INITIAL_MAIN_CUP);
  };
  const resetCss = () => setCssZones(INITIAL_CSS_ZONES);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const cupConfigCode = generateCupConfig(satCups);
  const mainPatchCode = generateMainCupPatch(mainCup);
  const heroCssCode = generateHeroCss(cssZones);

  const selectedSatCup = selectedCupId !== "main" ? satCups.find((c) => c.id === selectedCupId) : null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0d0d0d",
        color: "#e0d6c8",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        overflow: "hidden",
      }}
    >
      {/* ── far left: mode switch ── */}
      <div
        style={{
          width: 56,
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          gap: 8,
          flexShrink: 0,
        }}
      >
        {[
          { id: "cups", label: "3D" },
          { id: "css", label: "CSS" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            title={m.id === "cups" ? "Cup geometry (3 keyframes)" : "CSS layout zones (5 tiers)"}
            style={{
              width: 40,
              height: 40,
              background: mode === m.id ? "#1e1a14" : "transparent",
              border: "1px solid " + (mode === m.id ? "#c9a96e" : "#333"),
              borderRadius: 6,
              color: mode === m.id ? "#e8d5b0" : "#666",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "cups" ? (
        <>
          {/* ── cup selector ── */}
          <div
            style={{
              width: 180,
              borderRight: "1px solid #222",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: "16px 0",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <div style={{ padding: "0 16px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>
              Cups
            </div>
            {[{ id: "main", label: "Main Cup (Hero)" }, ...satCups].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCupId(c.id)}
                style={{
                  textAlign: "left",
                  padding: "8px 16px",
                  background: selectedCupId === c.id ? "#1e1a14" : "transparent",
                  border: "none",
                  borderLeft: `3px solid ${selectedCupId === c.id ? "#c9a96e" : "transparent"}`,
                  color: selectedCupId === c.id ? "#e8d5b0" : "#888",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {c.label || c.id}
              </button>
            ))}
          </div>

          {/* ── controls ── */}
          <div style={{ width: 300, borderRight: "1px solid #222", overflowY: "auto", padding: 20, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: "#e8d5b0" }}>
                {selectedCupId === "main" ? "Main Cup (Hero)" : selectedSatCup?.label}
              </div>
              <button
                onClick={resetCups}
                style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#888", fontSize: 11, padding: "4px 10px", cursor: "pointer" }}
              >
                Reset all
              </button>
            </div>

            <TabBar tabs={CUP_KEYFRAMES} active={keyframe} onSelect={setKeyframe} labels={CUP_KEYFRAME_LABELS} />

            {selectedCupId === "main" ? (
              <>
                <Section title={`Idle (resting) — ${CUP_KEYFRAME_LABELS[keyframe]}`}>
                  <Slider label="Idle Y" value={mainCup[keyframe].idleY} min={-4} max={2} step={0.01} onChange={(v) => updateMainKeyframe(keyframe, "idleY", v)} />
                  <Slider label="Idle Scale" value={mainCup[keyframe].idleScale} min={0.3} max={6} step={0.01} onChange={(v) => updateMainKeyframe(keyframe, "idleScale", v)} />
                </Section>
                <Section title={`Risen (scrolled) — ${CUP_KEYFRAME_LABELS[keyframe]}`}>
                  <Slider label="Risen Y" value={mainCup[keyframe].risenY} min={-2} max={4} step={0.01} onChange={(v) => updateMainKeyframe(keyframe, "risenY", v)} />
                  <Slider label="Risen Scale" value={mainCup[keyframe].risenScale} min={0.3} max={6} step={0.01} onChange={(v) => updateMainKeyframe(keyframe, "risenScale", v)} />
                </Section>
                <Section title="Mesh (shared / per-keyframe offset)">
                  <Slider label="Rotation Z (rad, all keyframes)" value={mainCup.rotationZ} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => updateMainField("rotationZ", v)} />
                  <Slider label="Plane Height (all keyframes)" value={mainCup.height} min={0.2} max={4} step={0.01} onChange={(v) => updateMainField("height", v)} />
                  {keyframe === "desktop" && (
                    <Slider label="Mesh Offset X — desktop" value={mainCup.meshOffsetXDesktop} min={-2} max={2} step={0.01} onChange={(v) => updateMainField("meshOffsetXDesktop", v)} />
                  )}
                  {keyframe === "mobile" && (
                    <Slider label="Mesh Offset X — mobile" value={mainCup.meshOffsetXMobile} min={-2} max={2} step={0.01} onChange={(v) => updateMainField("meshOffsetXMobile", v)} />
                  )}
                  {keyframe === "small" && (
                    <Slider label="Mesh Offset X — small-mobile" value={mainCup.meshOffsetXSmall} min={-2} max={2} step={0.01} onChange={(v) => updateMainField("meshOffsetXSmall", v)} />
                  )}
                </Section>
              </>
            ) : selectedSatCup ? (
              <>
                <Section title={`Idle Position — ${CUP_KEYFRAME_LABELS[keyframe]}`}>
                  <Slider label="X" value={selectedSatCup[keyframe].idlePos[0]} min={-5} max={5} step={0.01} onChange={(v) => updateSatVec(selectedSatCup.id, keyframe, 0, v)} />
                  <Slider label="Y" value={selectedSatCup[keyframe].idlePos[1]} min={-4} max={4} step={0.01} onChange={(v) => updateSatVec(selectedSatCup.id, keyframe, 1, v)} />
                  <Slider label="Z" value={selectedSatCup[keyframe].idlePos[2]} min={-3} max={3} step={0.01} onChange={(v) => updateSatVec(selectedSatCup.id, keyframe, 2, v)} />
                </Section>
                <Section title={`Dimensions — ${CUP_KEYFRAME_LABELS[keyframe]}`}>
                  <Slider label="Width" value={selectedSatCup[keyframe].width} min={0.2} max={8} step={0.01} onChange={(v) => updateSatField(selectedSatCup.id, keyframe, "width", v)} />
                  <Slider label="Height" value={selectedSatCup[keyframe].height} min={0.2} max={8} step={0.01} onChange={(v) => updateSatField(selectedSatCup.id, keyframe, "height", v)} />
                </Section>
                <Section title="Rotation (radians — shared across all keyframes)">
                  <Slider label="X" value={selectedSatCup.rotation[0]} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => updateSatRotation(selectedSatCup.id, 0, v)} />
                  <Slider label="Y" value={selectedSatCup.rotation[1]} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => updateSatRotation(selectedSatCup.id, 1, v)} />
                  <Slider label="Z" value={selectedSatCup.rotation[2]} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => updateSatRotation(selectedSatCup.id, 2, v)} />
                </Section>
                <Section title="Other (shared)">
                  <Slider label="Opacity" value={selectedSatCup.opacity} min={0} max={1} step={0.01} onChange={(v) => setSatCups((prev) => prev.map((c) => (c.id === selectedSatCup.id ? { ...c, opacity: v } : c)))} />
                </Section>
              </>
            ) : null}
          </div>

          {/* ── code output ── */}
          <CodePanel
            tabs={[
              ["cupConfig", "cupConfig.js", cupConfigCode],
              ["mainPatch", "MainCupImage.jsx patch", mainPatchCode],
            ]}
            copied={copied}
            onCopy={copy}
          />
        </>
      ) : (
        <>
          {/* ── css tier controls ── */}
          <div style={{ width: 340, borderRight: "1px solid #222", overflowY: "auto", padding: 20, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontWeight: 600, color: "#e8d5b0" }}>CSS Layout Zones</div>
              <button
                onClick={resetCss}
                style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#888", fontSize: 11, padding: "4px 10px", cursor: "pointer" }}
              >
                Reset all
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: "#555", marginBottom: 14, lineHeight: 1.5 }}>
              Each tier stacks Headline → Cup → Paragraph → CTAs as a running
              pixel sum, so zones can't overlap — see {CSS_TIER_MEDIA[cssTab]}.
            </div>

            <TabBar tabs={CSS_TIERS} active={cssTab} onSelect={setCssTab} labels={CSS_TIER_LABELS} />

            <Section title="Zone heights (px) — stack order">
              <Slider label="Headline zone height" value={cssZones[cssTab].headH} min={80} max={260} step={1} unit="px" onChange={(v) => updateCssZone(cssTab, "headH", v)} />
              <Slider label="Cup zone height" value={cssZones[cssTab].cupH} min={100} max={320} step={1} unit="px" onChange={(v) => updateCssZone(cssTab, "cupH", v)} />
              <Slider label="Paragraph zone height" value={cssZones[cssTab].paraH} min={60} max={160} step={1} unit="px" onChange={(v) => updateCssZone(cssTab, "paraH", v)} />
            </Section>

            {(cssTab === "t700" || cssTab === "t300") && (
              <Section title="Section min-height (px)">
                <Slider label=".oh4-hero min-height" value={cssZones[cssTab].heroMinHeight} min={400} max={800} step={1} unit="px" onChange={(v) => updateCssZone(cssTab, "heroMinHeight", v)} />
              </Section>
            )}

            {cssZones[cssTab].headlineFontMin !== undefined && (
              <>
                <Section title="Headline (line 1 & 2) font-size clamp()">
                  <Slider label="Min (px)" value={cssZones[cssTab].headlineFontMin} min={10} max={50} step={1} onChange={(v) => updateCssZone(cssTab, "headlineFontMin", v)} />
                  <Slider label="Fluid (vw)" value={cssZones[cssTab].headlineFontVw} min={3} max={12} step={0.1} onChange={(v) => updateCssZone(cssTab, "headlineFontVw", v)} />
                  <Slider label="Max (px)" value={cssZones[cssTab].headlineFontMax} min={20} max={60} step={1} onChange={(v) => updateCssZone(cssTab, "headlineFontMax", v)} />
                </Section>
                <Section title="Headline (line 3) font-size clamp()">
                  <Slider label="Min (px)" value={cssZones[cssTab].hl3FontMin} min={10} max={55} step={1} onChange={(v) => updateCssZone(cssTab, "hl3FontMin", v)} />
                  <Slider label="Fluid (vw)" value={cssZones[cssTab].hl3FontVw} min={3} max={13} step={0.1} onChange={(v) => updateCssZone(cssTab, "hl3FontVw", v)} />
                  <Slider label="Max (px)" value={cssZones[cssTab].hl3FontMax} min={22} max={65} step={1} onChange={(v) => updateCssZone(cssTab, "hl3FontMax", v)} />
                </Section>
                <Section title="Paragraph">
                  <Slider label="Max width (ch)" value={cssZones[cssTab].paraMaxCh} min={18} max={40} step={1} onChange={(v) => updateCssZone(cssTab, "paraMaxCh", v)} />
                  <Slider label="Font size (px)" value={cssZones[cssTab].paraFontPx} min={9} max={16} step={0.1} onChange={(v) => updateCssZone(cssTab, "paraFontPx", v)} />
                </Section>
                <Section title="CTA bottom padding clamp()">
                  <Slider label="Min (px)" value={cssZones[cssTab].ctaPaddingBottomMin} min={8} max={40} step={1} onChange={(v) => updateCssZone(cssTab, "ctaPaddingBottomMin", v)} />
                  <Slider label="Fluid (vh)" value={cssZones[cssTab].ctaPaddingBottomVh} min={1} max={8} step={0.1} onChange={(v) => updateCssZone(cssTab, "ctaPaddingBottomVh", v)} />
                  <Slider label="Max (px)" value={cssZones[cssTab].ctaPaddingBottomMax} min={16} max={60} step={1} onChange={(v) => updateCssZone(cssTab, "ctaPaddingBottomMax", v)} />
                </Section>
              </>
            )}

            {cssZones[cssTab].headlineFontMin === undefined && (
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6, marginTop: 8 }}>
                This tier (600–700px) only overrides zone heights in the real
                CSS — font-size/paragraph/CTA values fall through from the
                base &lt;700px tier. Switch to that tab to edit them.
              </div>
            )}
          </div>

          {/* ── code output ── */}
          <CodePanel tabs={[["heroCss", "Hero.css patch", heroCssCode]]} copied={copied} onCopy={copy} />
        </>
      )}
    </div>
  );
}

function CodePanel({ tabs, copied, onCopy }) {
  const [active, setActive] = useState(tabs[0][0]);
  const activeEntry = tabs.find((t) => t[0] === active);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #222", padding: "0 20px", gap: 4, paddingTop: 12 }}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              background: active === key ? "#1a1710" : "transparent",
              border: "1px solid " + (active === key ? "#c9a96e" : "#333"),
              borderBottom: active === key ? "1px solid #1a1710" : "1px solid #222",
              borderRadius: "4px 4px 0 0",
              color: active === key ? "#e8d5b0" : "#666",
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onCopy(activeEntry[2], active)}
          style={{
            background: copied === active ? "#2a4a2a" : "#1a1a1a",
            border: "1px solid " + (copied === active ? "#4a9a4a" : "#444"),
            borderRadius: 4,
            color: copied === active ? "#6fce6f" : "#aaa",
            padding: "6px 14px",
            fontSize: 12,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          {copied === active ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <pre
          style={{
            margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 11.5,
            lineHeight: 1.6,
            color: "#c9d8b0",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {activeEntry[2]}
        </pre>
      </div>

      <div style={{ borderTop: "1px solid #1a1a1a", padding: "10px 20px", fontSize: 11, color: "#444" }}>
        Adjust sliders → code updates live → Copy and paste into your project
      </div>
    </div>
  );
}