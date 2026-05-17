/* Hurore template renderer.
 *
 * Renders a blank Syriac Orthodox Hurore (priestly stole) matching the
 * traditional draped Λ shape: two tapered strips emerging from a small
 * fold at the top, draping down and outward — the front strip falling to
 * the lower-left with full fringe, the back strip draping to the
 * lower-right and partly hidden behind the front strip.
 *
 * The whole perimeter of each strip has a brocade border. The bottom
 * edges carry dense fringe.
 *
 * Canvas viewBox: 1200 x 1600.
 */

const HURORE_GEOMETRY = {
  canvasW: 1200,
  canvasH: 1600,
  borderW: 26,    // gold border thickness
  fringeH: 95,    // fringe length
};

// ---------- DEFS / PATTERNS ----------
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
      <stop offset="0"    stop-color="rgba(0,0,0,0.40)"/>
      <stop offset="0.25" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.7"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.35)"/>
    </linearGradient>
    <linearGradient id="fabric-shade-r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="rgba(0,0,0,0.30)"/>
      <stop offset="0.3"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.7"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.45)"/>
    </linearGradient>
    <linearGradient id="fabric-highlight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="rgba(255,255,255,0)"/>
      <stop offset="0.5" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="1"   stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="border-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="0.5" stop-color="rgba(255,255,255,0)"/>
      <stop offset="1"   stop-color="rgba(0,0,0,0.25)"/>
    </linearGradient>

    <!-- Brocade: small repeating ornamental motif -->
    <pattern id="brocade" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="currentColor"/>
      <path d="M9 2 L13 9 L9 16 L5 9 Z" fill="rgba(0,0,0,0.25)"/>
      <circle cx="9" cy="9" r="1.4" fill="rgba(255,255,255,0.4)"/>
      <path d="M0 9 L3 9 M15 9 L18 9" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
      <path d="M9 0 L9 2 M9 16 L9 18" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
    </pattern>

    <pattern id="rope" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="currentColor"/>
      <path d="M0 6 Q3 0 6 6 T12 6" fill="none" stroke="rgba(0,0,0,0.32)" stroke-width="1.4"/>
      <path d="M0 6 Q3 12 6 6 T12 6" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
    </pattern>
  `;
}

// ---------- HELPERS ----------
function borderFillFor(borderStyle, borderColor) {
  if (borderStyle === "brocade") return `url(#brocade)`;
  if (borderStyle === "rope") return `url(#rope)`;
  if (borderStyle === "none") return "none";
  return borderColor;
}

/* Linearly interpolate between two points. */
function lerp(a, b, t) { return a + (b - a) * t; }

/* Build a tapered, draped strip from a list of corner points and curves.
 *
 * The strip is defined by 4 corners (TL, TR, BR, BL) and two cubic-bezier
 * sides (outer and inner). Bottom and top are straight lines. */
function stripPath(s) {
  const { TL, TR, BR, BL, outerC1, outerC2, innerC1, innerC2 } = s;
  return `M ${TL.x} ${TL.y}
          L ${TR.x} ${TR.y}
          C ${innerC1.x} ${innerC1.y} ${innerC2.x} ${innerC2.y} ${BR.x} ${BR.y}
          L ${BL.x} ${BL.y}
          C ${outerC2.x} ${outerC2.y} ${outerC1.x} ${outerC1.y} ${TL.x} ${TL.y}
          Z`;
}

/* Inset a strip definition inward by `inset` pixels to produce the inner
 * border path. We approximate by moving each corner inward toward the
 * strip's interior. */
function insetStrip(s, inset) {
  // Direction from TL→TR (across top) and BL→BR (across bottom): the strip's
  // width direction. We push TL and BL inward (right), TR and BR inward (left).
  // Vertically we push TL/TR down and BR/BL up.
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

/* Dense fringe along a (slightly tilted) bottom edge from p1 to p2.
 * Each thread hangs straight down with small length/sway variations. */
function buildFringeAlong({ p1, p2, length, color, count = 70 }) {
  let out = `<g class="fringe" stroke="${color}" stroke-linecap="round" opacity="0.95">`;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = lerp(p1.x, p2.x, t);
    const y = lerp(p1.y, p2.y, t);
    const len = length * (0.78 + 0.22 * Math.abs(Math.sin(i * 0.7 + (i % 3) * 0.4)));
    const sway = (Math.sin(i * 1.3) + Math.cos(i * 0.9)) * 1.4;
    const w = 1.1 + (i % 6 === 0 ? 0.5 : 0);
    out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}"
                  x2="${(x + sway).toFixed(1)}" y2="${(y + len).toFixed(1)}"
                  stroke-width="${w}"/>`;
  }
  // Header band where fringe attaches
  out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="3" opacity="0.55"/>`;
  out += `</g>`;
  return out;
}

/* Render one strip with fabric, brocade border and fringe. */
function renderStrip({ strip, fabricColor, borderColor, borderStyle, fringeColor, fringeLength, shadeGradient }) {
  const inset = HURORE_GEOMETRY.borderW;
  const outer = stripPath(strip);
  const inner = stripPath(insetStrip(strip, inset));
  const bFill = borderFillFor(borderStyle, borderColor);
  const fringe = buildFringeAlong({
    p1: strip.BL, p2: strip.BR,
    length: fringeLength, color: fringeColor, count: 75,
  });

  return `
    <g>
      <!-- Fabric body -->
      <path d="${outer}" fill="${fabricColor}"/>
      <path d="${outer}" fill="url(#${shadeGradient})" opacity="0.7"/>
      <path d="${outer}" fill="url(#fabric-highlight)"/>

      <!-- Brocade border via even-odd fill of outer minus inner -->
      ${borderStyle !== "none" ? `
        <g color="${borderColor}" filter="url(#soft-shadow)">
          <path d="${outer} ${inner}" fill="${bFill}" fill-rule="evenodd"
                stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>
          <path d="${outer} ${inner}" fill="url(#border-shine)"
                fill-rule="evenodd" opacity="0.5"/>
        </g>
      ` : ``}

      ${fringe}
    </g>
  `;
}

// ---------- THE HURORE ----------
function renderHurore({ fabricColor, borderColor, fringeColor, borderStyle }) {
  const g = HURORE_GEOMETRY;

  // ---------- STRIP DEFINITIONS ----------
  // Coordinates derived from the reference photo. The fold is at the
  // top-center where the two strips meet. The front (left) strip drapes
  // down and outward to the lower-left; the back (right) strip drapes
  // to the lower-right.
  const front = {
    // Top corners (narrow at the fold)
    TL: { x: 520, y: 110 },
    TR: { x: 580, y: 110 },
    // Bottom corners (wide, slight tilt: BL slightly higher than BR
    // because the fabric drapes diagonally)
    BR: { x: 470, y: 1330 },
    BL: { x: 80,  y: 1280 },
    // Outer (left) edge bulges outward to the left
    outerC1: { x: 470, y: 450 },
    outerC2: { x: 140, y: 1000 },
    // Inner (right) edge curves more subtly
    innerC1: { x: 600, y: 450 },
    innerC2: { x: 510, y: 950 },
  };

  const back = {
    // Top corners just to the right of the front strip's top
    TL: { x: 600, y: 110 },
    TR: { x: 660, y: 110 },
    // Bottom corners draping to the right
    BR: { x: 1130, y: 1240 },
    BL: { x: 560,  y: 1290 },
    // Outer (right) edge bulges outward to the right
    outerC1: { x: 720, y: 450 },
    outerC2: { x: 1060, y: 900 },
    // Inner (left) edge curves down (partly hidden behind front strip)
    innerC1: { x: 590, y: 500 },
    innerC2: { x: 520, y: 1050 },
  };

  // Shadow under the lowest hanging point (the front strip's fringe)
  const shadow = `<ellipse cx="${(front.BL.x + front.BR.x)/2}"
                           cy="${Math.max(front.BL.y, front.BR.y) + g.fringeH + 30}"
                           rx="220" ry="22"
                           fill="rgba(0,0,0,0.5)" filter="url(#blur)"/>`;

  // Small fold accent at the top where the two strips meet
  const foldCx = (front.TR.x + back.TL.x) / 2;
  const foldY = front.TL.y;
  const foldAccent = `
    <ellipse cx="${foldCx}" cy="${foldY - 4}" rx="50" ry="10"
             fill="rgba(0,0,0,0.4)" filter="url(#blur)"/>
    <path d="M ${foldCx - 45} ${foldY - 2}
             Q ${foldCx} ${foldY - 18} ${foldCx + 45} ${foldY - 2}"
          fill="${borderColor}" opacity="0.85"/>
    <path d="M ${foldCx - 45} ${foldY - 2}
             Q ${foldCx} ${foldY - 18} ${foldCx + 45} ${foldY - 2}"
          fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
  `;

  return `
    ${shadow}

    <!-- Back strip first so the front overlaps it -->
    ${renderStrip({
      strip: back,
      fabricColor, borderColor, borderStyle,
      fringeColor,
      fringeLength: g.fringeH * 0.75,
      shadeGradient: "fabric-shade-r",
    })}

    <!-- Front strip on top -->
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

/* Sensible default placement for new symbols: on the visible front strip,
 * in its wider lower portion. */
function defaultElementPosition() {
  return { x: 290, y: 1050 };
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
