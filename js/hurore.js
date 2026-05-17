/* Hurore template renderer.
 *
 * Renders a blank Syriac Orthodox Hurore (priestly stole) matching the
 * reference photo: one continuous strip folded into an asymmetric Λ shape.
 * The front (left) arm hangs to the lower-left with a full gold fringe.
 * The back (right) arm drapes to the lower-right; its end is partly
 * cropped/draped behind the front, with a shorter visible fringe.
 *
 * Gold brocade border wraps both long edges of each arm.
 *
 * Canvas viewBox: 1200 x 1600.
 */

const HURORE_GEOMETRY = {
  canvasW: 1200,
  canvasH: 1600,
  borderW: 28,
  fringeH: 110,
};

function buildHuroreDefs() {
  return `
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="4"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
}

function buildFabricDefs(fabricColor) {
  return `
    <linearGradient id="fabric-shade-l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="rgba(0,0,0,0.45)"/>
      <stop offset="0.25" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.7"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.40)"/>
    </linearGradient>
    <linearGradient id="fabric-shade-r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="rgba(0,0,0,0.35)"/>
      <stop offset="0.3"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.7"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.50)"/>
    </linearGradient>
    <linearGradient id="fabric-highlight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="rgba(255,255,255,0)"/>
      <stop offset="0.5" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="1"   stop-color="rgba(255,255,255,0)"/>
    </linearGradient>

    <!-- Brocade texture: transparent base + ornamental dark/light marks.
         Designed to overlay a solid gold fill, so colour works for any
         user-chosen border colour. -->
    <pattern id="brocade-tex" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
      <!-- floral/quatrefoil silhouette -->
      <path d="M11 3 C7 3 5 6 5 11 C5 16 7 19 11 19 C15 19 17 16 17 11 C17 6 15 3 11 3 Z"
            fill="rgba(0,0,0,0.18)"/>
      <path d="M11 6 C9 6 8 8 8 11 C8 14 9 16 11 16 C13 16 14 14 14 11 C14 8 13 6 11 6 Z"
            fill="rgba(255,255,255,0.18)"/>
      <circle cx="11" cy="11" r="1.2" fill="rgba(0,0,0,0.35)"/>
      <path d="M0 11 L4 11 M18 11 L22 11" stroke="rgba(0,0,0,0.20)" stroke-width="0.6"/>
      <path d="M11 0 L11 3 M11 19 L11 22" stroke="rgba(0,0,0,0.20)" stroke-width="0.6"/>
    </pattern>

    <pattern id="rope-tex" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <path d="M0 7 Q3.5 0 7 7 T14 7" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.6"/>
      <path d="M0 7 Q3.5 14 7 7 T14 7" fill="none" stroke="rgba(255,255,255,0.30)" stroke-width="0.9"/>
    </pattern>

    <linearGradient id="border-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="0.5"  stop-color="rgba(255,255,255,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.30)"/>
    </linearGradient>
  `;
}

// ---------- HELPERS ----------
function lerp(a, b, t) { return a + (b - a) * t; }

function stripPath(s) {
  const { TL, TR, BR, BL, outerC1, outerC2, innerC1, innerC2 } = s;
  return `M ${TL.x} ${TL.y}
          L ${TR.x} ${TR.y}
          C ${innerC1.x} ${innerC1.y} ${innerC2.x} ${innerC2.y} ${BR.x} ${BR.y}
          L ${BL.x} ${BL.y}
          C ${outerC2.x} ${outerC2.y} ${outerC1.x} ${outerC1.y} ${TL.x} ${TL.y}
          Z`;
}

function insetStrip(s, inset) {
  return {
    TL: { x: s.TL.x + inset, y: s.TL.y + inset },
    TR: { x: s.TR.x - inset, y: s.TR.y + inset },
    BR: { x: s.BR.x - inset, y: s.BR.y - inset },
    BL: { x: s.BL.x + inset, y: s.BL.y - inset },
    outerC1: { x: s.outerC1.x + inset, y: s.outerC1.y },
    outerC2: { x: s.outerC2.x + inset, y: s.outerC2.y },
    innerC1: { x: s.innerC1.x - inset, y: s.innerC1.y },
    innerC2: { x: s.innerC2.x - inset, y: s.innerC2.y },
  };
}

/* Fringe along an edge from p1→p2. Threads hang straight down with small
 * length and sway variations to look hand-tied. */
function buildFringeAlong({ p1, p2, length, color, count = 75 }) {
  let out = `<g class="fringe" stroke="${color}" stroke-linecap="round" opacity="0.97">`;
  // attachment band
  out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="4" opacity="0.7"/>`;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = lerp(p1.x, p2.x, t);
    const y = lerp(p1.y, p2.y, t);
    const len = length * (0.78 + 0.22 * Math.abs(Math.sin(i * 0.7 + (i % 3) * 0.4)));
    const sway = (Math.sin(i * 1.3) + Math.cos(i * 0.9)) * 1.6;
    const w = 1.2 + (i % 6 === 0 ? 0.6 : 0);
    out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}"
                  x2="${(x + sway).toFixed(1)}" y2="${(y + len).toFixed(1)}"
                  stroke-width="${w}"/>`;
  }
  out += `</g>`;
  return out;
}

/* Render one strip with fabric, brocade border, and fringe.
 *
 * Border is composed as: solid border colour (visible base) + transparent
 * brocade/rope texture overlay + a subtle sheen. This keeps the gold/coloured
 * brocade visible for any user-chosen border colour. */
function renderStrip({
  strip, fabricColor, borderColor, borderStyle,
  fringeColor, fringeLength, shadeGradient,
  fringe = true,
}) {
  const inset = HURORE_GEOMETRY.borderW;
  const outer = stripPath(strip);
  const inner = stripPath(insetStrip(strip, inset));

  let borderLayer = "";
  if (borderStyle !== "none") {
    const texId =
      borderStyle === "brocade" ? "brocade-tex" :
      borderStyle === "rope"    ? "rope-tex"    : null;
    borderLayer = `
      <g filter="url(#soft-shadow)">
        <!-- base colour of the border -->
        <path d="${outer} ${inner}" fill="${borderColor}" fill-rule="evenodd"/>
        ${texId ? `
          <path d="${outer} ${inner}" fill="url(#${texId})" fill-rule="evenodd"/>
        ` : ``}
        <!-- subtle sheen + outline -->
        <path d="${outer} ${inner}" fill="url(#border-sheen)"
              fill-rule="evenodd" opacity="0.45"/>
        <path d="${outer} ${inner}" fill="none" fill-rule="evenodd"
              stroke="rgba(0,0,0,0.35)" stroke-width="0.6"/>
      </g>
    `;
  }

  const fringeLayer = fringe ? buildFringeAlong({
    p1: strip.BL, p2: strip.BR,
    length: fringeLength, color: fringeColor, count: 80,
  }) : "";

  return `
    <g>
      <!-- Fabric body -->
      <path d="${outer}" fill="${fabricColor}"/>
      <path d="${outer}" fill="url(#${shadeGradient})" opacity="0.75"/>
      <path d="${outer}" fill="url(#fabric-highlight)"/>

      ${borderLayer}
      ${fringeLayer}
    </g>
  `;
}

// ---------- THE HURORE ----------
function renderHurore({ fabricColor, borderColor, fringeColor, borderStyle }) {
  const g = HURORE_GEOMETRY;

  /* Coordinates from the reference photo. The strip is ONE continuous piece
   * folded at the apex (~600, 90). Both arms share the apex edge so the fold
   * reads as a single peak rather than two separate strips meeting. */

  // LEFT arm (front, fully visible, with full fringe)
  const front = {
    TL: { x: 594, y: 92 },
    TR: { x: 608, y: 92 },
    BR: { x: 380, y: 1380 },
    BL: { x: 70,  y: 1320 },
    outerC1: { x: 560, y: 360 },
    outerC2: { x: 140, y: 1000 },
    innerC1: { x: 640, y: 420 },
    innerC2: { x: 430, y: 980 },
  };

  // RIGHT arm (back, drapes to lower-right, partly cropped/behind front).
  //
  // Note: stripPath draws TR→BR via innerC1/C2 (right edge for the front
  // arm, but the OUTER edge here since the back arm is mirrored), and
  // BL→TL via outerC1/C2 (left edge, which is the INNER edge of the back
  // arm). So for the back arm the "inner" controls bow OUT to the right
  // and the "outer" controls hug the centerline.
  const back = {
    TL: { x: 608, y: 92 },
    TR: { x: 622, y: 92 },
    BR: { x: 1000, y: 1210 },
    BL: { x: 700,  y: 1280 },
    innerC1: { x: 720, y: 380 },
    innerC2: { x: 1020, y: 880 },
    outerC1: { x: 640, y: 460 },
    outerC2: { x: 660, y: 1040 },
  };

  // Soft drop shadow below the lower-hanging (left) fringe
  const shadow = `
    <ellipse cx="${(front.BL.x + front.BR.x)/2}"
             cy="${Math.max(front.BL.y, front.BR.y) + g.fringeH + 40}"
             rx="230" ry="20"
             fill="rgba(0,0,0,0.55)" filter="url(#blur)"/>
  `;

  // Triangular fold cap at the apex: a small dark notch + a thin gold
  // ridge across the very top edge, simulating the folded crease.
  const apexCx = (front.TR.x + back.TL.x) / 2;
  const apexY = Math.min(front.TL.y, back.TL.y);
  const foldAccent = `
    <!-- soft shadow inside the fold -->
    <path d="M ${apexCx - 26} ${apexY + 4}
             L ${apexCx} ${apexY + 22}
             L ${apexCx + 26} ${apexY + 4} Z"
          fill="rgba(0,0,0,0.55)" filter="url(#blur)"/>
    <!-- gold ridge across the top -->
    <path d="M ${front.TL.x - 2} ${apexY + 1}
             L ${back.TR.x + 2} ${apexY + 1}"
          stroke="${borderColor}" stroke-width="6"
          stroke-linecap="round" opacity="0.95"/>
    <path d="M ${front.TL.x - 2} ${apexY + 1}
             L ${back.TR.x + 2} ${apexY + 1}"
          stroke="rgba(0,0,0,0.4)" stroke-width="1" opacity="0.6"/>
  `;

  return `
    ${shadow}

    <!-- Back arm first so the front overlaps it at the apex -->
    ${renderStrip({
      strip: back,
      fabricColor, borderColor, borderStyle,
      fringeColor,
      fringeLength: g.fringeH * 0.7,
      shadeGradient: "fabric-shade-r",
    })}

    <!-- Front arm on top -->
    ${renderStrip({
      strip: front,
      fabricColor, borderColor, borderStyle,
      fringeColor,
      fringeLength: g.fringeH,
      shadeGradient: "fabric-shade-l",
    })}

    ${foldAccent}
  `;
}

/* Sensible default placement for new symbols: on the visible front arm,
 * in its wider lower portion. */
function defaultElementPosition() {
  return { x: 240, y: 1050 };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HURORE_GEOMETRY,
    renderHurore,
    buildHuroreDefs,
    buildFabricDefs,
    defaultElementPosition,
  };
}
