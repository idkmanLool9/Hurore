/* Hurore template renderer.
 *
 * Renders a blank Syriac Orthodox Hurore (priestly stole) matching the
 * reference photo: one continuous strip folded at the apex into an
 * asymmetric Λ. The front (left) arm hangs to the lower-left with full
 * gold fringe; the back (right) arm drapes higher and to the right,
 * partly overlapped by the front arm near the apex.
 *
 * Each long edge of the strip is composed of TWO cubic-bezier segments
 * so the drape reads as organic fabric rather than a single arc.
 *
 * Canvas viewBox: 1200 x 1600.
 */

const HURORE_GEOMETRY = {
  canvasW: 1200,
  canvasH: 1600,
  borderW: 30,
  fringeH: 120,
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
    <filter id="apex-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  `;
}

function buildFabricDefs(fabricColor) {
  return `
    <!-- Fabric depth: edges darker (folds, shadow), centre lit -->
    <linearGradient id="fabric-shade-l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="rgba(0,0,0,0.55)"/>
      <stop offset="0.18" stop-color="rgba(0,0,0,0.12)"/>
      <stop offset="0.5"  stop-color="rgba(255,255,255,0.06)"/>
      <stop offset="0.82" stop-color="rgba(0,0,0,0.18)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient>
    <linearGradient id="fabric-shade-r" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="rgba(0,0,0,0.55)"/>
      <stop offset="0.18" stop-color="rgba(0,0,0,0.18)"/>
      <stop offset="0.5"  stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="0.82" stop-color="rgba(0,0,0,0.12)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient>
    <!-- Vertical shading: darker near the fold up top, lighter mid-way -->
    <linearGradient id="fabric-vshade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="rgba(0,0,0,0.30)"/>
      <stop offset="0.15" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.85" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.18)"/>
    </linearGradient>

    <!-- Border highlight: lit on top, dark on bottom -->
    <linearGradient id="border-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="rgba(255,255,255,0.65)"/>
      <stop offset="0.35" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="0.65" stop-color="rgba(0,0,0,0.12)"/>
      <stop offset="1"    stop-color="rgba(0,0,0,0.45)"/>
    </linearGradient>

    <!-- Ornate brocade: scroll/floral motif. Transparent base so the
         user-picked border colour shines through. Layered into the
         border via fill-rule:evenodd over the solid colour. -->
    <pattern id="brocade-tex" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <!-- 4-petal central blossom: dark silhouette + bright inner highlight -->
      <path d="M18 4
               C13 4 11 9 11 14
               C11 9 6 7 6 7
               C6 7 7 13 12 16
               C7 16 5 21 5 21
               C5 21 11 22 14 18
               C13 23 18 28 18 28
               C18 28 23 23 22 18
               C25 22 31 21 31 21
               C31 21 29 16 24 16
               C29 13 30 7 30 7
               C30 7 25 9 25 14
               C25 9 23 4 18 4 Z"
            fill="rgba(0,0,0,0.28)"/>
      <path d="M18 9
               C15 9 13 12 13 15
               C13 17 15 19 18 19
               C21 19 23 17 23 15
               C23 12 21 9 18 9 Z"
            fill="rgba(255,255,235,0.22)"/>
      <circle cx="18" cy="15" r="1.3" fill="rgba(0,0,0,0.45)"/>

      <!-- Connecting vine: gentle wave at top and bottom -->
      <path d="M0 32 Q9 28 18 32 T36 32"
            stroke="rgba(0,0,0,0.22)" stroke-width="0.7" fill="none"/>
      <path d="M0 32 Q9 36 18 32 T36 32"
            stroke="rgba(255,255,235,0.18)" stroke-width="0.5" fill="none"/>

      <!-- Tiny side leaves -->
      <path d="M2 14 Q5 11 8 14 Q5 17 2 14 Z" fill="rgba(0,0,0,0.18)"/>
      <path d="M34 14 Q31 11 28 14 Q31 17 34 14 Z" fill="rgba(0,0,0,0.18)"/>
    </pattern>

    <pattern id="rope-tex" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <path d="M0 7 Q3.5 0 7 7 T14 7" fill="none"
            stroke="rgba(0,0,0,0.40)" stroke-width="1.6"/>
      <path d="M0 7 Q3.5 14 7 7 T14 7" fill="none"
            stroke="rgba(255,255,255,0.32)" stroke-width="0.9"/>
    </pattern>
  `;
}

// ---------- PATH BUILDER ----------
//
// A strip is described by:
//   apexL, apexR   : the two corners at the fold (a short flat top edge)
//   bottomR, bottomL : the two corners at the bottom (a short flat bottom)
//   innerSegments  : [{c1, c2, end}, ...]  path from apexR down to bottomR
//   outerSegments  : [{c1, c2, end}, ...]  path from bottomL up to apexL
// Both segment lists end at the matching bottom or apex corner; their
// last `end` MUST equal bottomR / apexL respectively, otherwise the path
// won't close cleanly.

function stripPath(s) {
  let d = `M ${s.apexL.x} ${s.apexL.y} L ${s.apexR.x} ${s.apexR.y} `;
  for (const seg of s.innerSegments) {
    d += `C ${seg.c1.x} ${seg.c1.y} ${seg.c2.x} ${seg.c2.y} ${seg.end.x} ${seg.end.y} `;
  }
  d += `L ${s.bottomL.x} ${s.bottomL.y} `;
  for (const seg of s.outerSegments) {
    d += `C ${seg.c1.x} ${seg.c1.y} ${seg.c2.x} ${seg.c2.y} ${seg.end.x} ${seg.end.y} `;
  }
  d += "Z";
  return d;
}

/* Build an inner-offset version of a strip path. We can't analytically
 * inset a multi-segment bezier, so we approximate: corners move inward
 * by `inset`, and control points are shifted toward the centerline by a
 * similar amount. Side determines which way is "inward":
 *   side === "L" : strip drapes to the LEFT  (front arm)
 *   side === "R" : strip drapes to the RIGHT (back arm)
 */
function insetStrip(s, inset, side) {
  const sgn = side === "L" ? +1 : -1;  // direction the OUTER edge moves inward
  function shift(p, dx, dy) { return { x: p.x + dx, y: p.y + dy }; }
  return {
    apexL: shift(s.apexL, +inset * sgn, +inset),
    apexR: shift(s.apexR, -inset * sgn, +inset),
    bottomR: shift(s.bottomR, -inset * sgn, -inset),
    bottomL: shift(s.bottomL, +inset * sgn, -inset),
    innerSegments: s.innerSegments.map((seg, i, arr) => ({
      c1: shift(seg.c1, -inset * sgn, 0),
      c2: shift(seg.c2, -inset * sgn, 0),
      end: i === arr.length - 1
        ? shift(s.bottomR, -inset * sgn, -inset)
        : shift(seg.end, -inset * sgn, 0),
    })),
    outerSegments: s.outerSegments.map((seg, i, arr) => ({
      c1: shift(seg.c1, +inset * sgn, 0),
      c2: shift(seg.c2, +inset * sgn, 0),
      end: i === arr.length - 1
        ? shift(s.apexL, +inset * sgn, +inset)
        : shift(seg.end, +inset * sgn, 0),
    })),
  };
}

// ---------- FRINGE ----------
function lerp(a, b, t) { return a + (b - a) * t; }

function buildFringeAlong({ p1, p2, length, color, count = 90 }) {
  let out = `<g class="fringe" stroke-linecap="round">`;
  // attachment band (a small dark line where the fringe is sewn on)
  out += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="5" opacity="0.85"/>`;
  out += `<line x1="${p1.x}" y1="${p1.y + 1}" x2="${p2.x}" y2="${p2.y + 1}"
                stroke="rgba(0,0,0,0.35)" stroke-width="1"/>`;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = lerp(p1.x, p2.x, t);
    const y = lerp(p1.y, p2.y, t);
    // two-tone gold: every 3rd thread is a hair darker
    const tone = (i % 3 === 0) ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)";
    const len = length * (0.72 + 0.28 * Math.abs(Math.sin(i * 0.7 + (i % 5) * 0.31)));
    const sway = (Math.sin(i * 1.3) + Math.cos(i * 0.9)) * 2.2;
    const w = 1.1 + (i % 6 === 0 ? 0.6 : 0);
    out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}"
                  x2="${(x + sway).toFixed(1)}" y2="${(y + len).toFixed(1)}"
                  stroke="${color}" stroke-width="${w}" opacity="0.95"/>`;
    if (tone !== "rgba(0,0,0,0)") {
      out += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}"
                    x2="${(x + sway).toFixed(1)}" y2="${(y + len).toFixed(1)}"
                    stroke="${tone}" stroke-width="${w}" opacity="0.55"/>`;
    }
  }
  out += `</g>`;
  return out;
}

// ---------- STRIP RENDERER ----------
function renderStrip({
  strip, side, fabricColor, borderColor, borderStyle,
  fringeColor, fringeLength, shadeGradient, fringe = true,
}) {
  const inset = HURORE_GEOMETRY.borderW;
  const outer = stripPath(strip);
  const inner = stripPath(insetStrip(strip, inset, side));

  let borderLayer = "";
  if (borderStyle !== "none") {
    const texId =
      borderStyle === "brocade" ? "brocade-tex" :
      borderStyle === "rope"    ? "rope-tex"    : null;
    borderLayer = `
      <g filter="url(#soft-shadow)">
        <path d="${outer} ${inner}" fill="${borderColor}" fill-rule="evenodd"/>
        ${texId ? `
          <path d="${outer} ${inner}" fill="url(#${texId})" fill-rule="evenodd"/>
        ` : ``}
        <path d="${outer} ${inner}" fill="url(#border-sheen)"
              fill-rule="evenodd" opacity="0.55"/>
        <path d="${outer} ${inner}" fill="none" fill-rule="evenodd"
              stroke="rgba(0,0,0,0.45)" stroke-width="0.7"/>
      </g>
    `;
  }

  const fringeLayer = fringe ? buildFringeAlong({
    p1: strip.bottomL, p2: strip.bottomR,
    length: fringeLength, color: fringeColor, count: 95,
  }) : "";

  return `
    <g>
      <!-- Fabric body -->
      <path d="${outer}" fill="${fabricColor}"/>
      <path d="${outer}" fill="url(#${shadeGradient})"/>
      <path d="${outer}" fill="url(#fabric-vshade)"/>

      ${borderLayer}
      ${fringeLayer}
    </g>
  `;
}

// ---------- THE HURORE ----------
function renderHurore({ fabricColor, borderColor, fringeColor, borderStyle }) {
  const g = HURORE_GEOMETRY;

  /* FRONT arm (left, fully visible, lower-left drape).
   * Outer (left) edge bows OUT then sweeps in at the fringe — two
   * segments give it an organic S-feel. Inner (right) edge curves
   * gently toward the centre as it descends. */
  const front = {
    apexL:   { x: 588, y: 100 },
    apexR:   { x: 606, y: 96 },
    bottomR: { x: 390, y: 1395 },
    bottomL: { x: 70,  y: 1360 },
    // inner (right) edge: from apexR down to bottomR
    innerSegments: [
      { c1: { x: 660, y: 380 }, c2: { x: 600, y: 640 }, end: { x: 510, y: 820 } },
      { c1: { x: 440, y: 1010 }, c2: { x: 405, y: 1200 }, end: { x: 390, y: 1395 } },
    ],
    // outer (left) edge: from bottomL up to apexL
    outerSegments: [
      { c1: { x: 60,  y: 1180 }, c2: { x: 95,  y: 980 }, end: { x: 180, y: 800 } },
      { c1: { x: 290, y: 580 }, c2: { x: 470, y: 320 }, end: { x: 588, y: 100 } },
    ],
  };

  /* BACK arm (right, drapes higher to the right, partly behind front).
   * Outer (right) edge bows out. Inner (left) edge hugs the centerline,
   * disappearing slightly behind the front arm's inner edge. */
  const back = {
    apexL:   { x: 610, y: 96 },
    apexR:   { x: 628, y: 100 },
    bottomR: { x: 1050, y: 1200 },
    bottomL: { x: 705,  y: 1300 },
    // inner (left) edge of the back arm: from apexL down to bottomL
    // (in stripPath, "innerSegments" goes apexR→bottomR; for the back
    // arm "inner" means the LEFT edge, but stripPath always draws the
    // path apexR→bottomR via innerSegments — so here innerSegments
    // describes what is visually the RIGHT (outer) edge of the back
    // arm. Just match the coordinates and it works out.)
    innerSegments: [
      { c1: { x: 720, y: 360 }, c2: { x: 870, y: 580 }, end: { x: 970, y: 770 } },
      { c1: { x: 1040, y: 940 }, c2: { x: 1058, y: 1060 }, end: { x: 1050, y: 1200 } },
    ],
    outerSegments: [
      { c1: { x: 700, y: 1130 }, c2: { x: 670, y: 940 }, end: { x: 660, y: 760 } },
      { c1: { x: 645, y: 540 },  c2: { x: 625, y: 310 }, end: { x: 610, y: 96 } },
    ],
  };

  // Drop shadow under the lower-hanging (front) fringe
  const shadow = `
    <ellipse cx="${(front.bottomL.x + front.bottomR.x)/2}"
             cy="${Math.max(front.bottomL.y, front.bottomR.y) + g.fringeH + 50}"
             rx="260" ry="22"
             fill="rgba(0,0,0,0.55)" filter="url(#blur)"/>
  `;

  /* Apex fold cap. Three layers:
   *  - shadow notch dropping into the V between the two arms
   *  - small "tuck" of fabric showing folded thickness
   *  - gold ridge across the very top edge */
  const apexCx = (front.apexR.x + back.apexL.x) / 2;
  const apexY = Math.min(front.apexR.y, back.apexL.y);
  const tuckLeft  = front.apexL.x - 4;
  const tuckRight = back.apexR.x + 4;
  const foldAccent = `
    <!-- shadow inside the fold -->
    <path d="M ${apexCx - 32} ${apexY + 6}
             Q ${apexCx} ${apexY + 30} ${apexCx + 32} ${apexY + 6} Z"
          fill="rgba(0,0,0,0.55)" filter="url(#apex-shadow)"/>

    <!-- fabric tuck: a small folded-over flap with its own shading -->
    <path d="M ${tuckLeft} ${apexY + 4}
             Q ${apexCx} ${apexY - 18} ${tuckRight} ${apexY + 4}
             L ${tuckRight - 6} ${apexY + 12}
             Q ${apexCx} ${apexY - 6} ${tuckLeft + 6} ${apexY + 12} Z"
          fill="${fabricColor}"/>
    <path d="M ${tuckLeft} ${apexY + 4}
             Q ${apexCx} ${apexY - 18} ${tuckRight} ${apexY + 4}
             L ${tuckRight - 6} ${apexY + 12}
             Q ${apexCx} ${apexY - 6} ${tuckLeft + 6} ${apexY + 12} Z"
          fill="rgba(0,0,0,0.30)"/>

    <!-- thin gold ridge across the top of the tuck -->
    <path d="M ${tuckLeft + 1} ${apexY + 3}
             Q ${apexCx} ${apexY - 14} ${tuckRight - 1} ${apexY + 3}"
          stroke="${borderColor}" stroke-width="5"
          stroke-linecap="round" fill="none" opacity="0.95"/>
    <path d="M ${tuckLeft + 1} ${apexY + 3}
             Q ${apexCx} ${apexY - 14} ${tuckRight - 1} ${apexY + 3}"
          stroke="rgba(0,0,0,0.4)" stroke-width="1"
          fill="none" opacity="0.7"/>
  `;

  return `
    ${shadow}

    <!-- Back arm first so the front overlaps it at the apex -->
    ${renderStrip({
      strip: back, side: "R",
      fabricColor, borderColor, borderStyle,
      fringeColor,
      fringeLength: g.fringeH * 0.72,
      shadeGradient: "fabric-shade-r",
    })}

    <!-- Front arm on top -->
    ${renderStrip({
      strip: front, side: "L",
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
