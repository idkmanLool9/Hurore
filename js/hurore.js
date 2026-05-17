/* Hurore template renderer.
 *
 * Renders the blank Hurore (Syriac Orthodox priestly stole) as SVG.
 * The real Hurore is a single long fabric piece that loops over the
 * priest's neck. We support two views:
 *
 *  - "flat": the strip laid out straight as one tapered piece. Narrow at
 *    the top (the fold/neck end), wider at the bottom where the fringe
 *    hangs. The whole perimeter has a brocade border. This is the design
 *    canvas.
 *
 *  - "worn": the strip as it actually drapes on the wearer, in an inverted
 *    "Λ" shape. Two tapered strips meet at the top fold; the visible
 *    front strip falls to the lower-left with the fringe; the back strip
 *    drapes behind to the right.
 *
 * Canvas viewBox: 1200 x 1600.
 */

const HURORE_GEOMETRY = {
  canvasW: 1200,
  canvasH: 1600,

  // Flat view strip (single piece)
  topW: 200,     // width at the top (fold/neck end)
  bottomW: 360,  // width at the bottom (fringe end)
  height: 1380,
  topY: 80,

  borderW: 32,   // brocade border thickness
  fringeH: 90,   // fringe length
};

// ---------- DEFS / PATTERNS ----------
function buildHuroreDefs() {
  return `
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;
}

function buildFabricDefs(fabricColor) {
  return `
    <pattern id="fabric-weave" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${fabricColor}"/>
      <path d="M0 3 H6 M3 0 V6" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="fabric-shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="rgba(0,0,0,0.32)"/>
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.6" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1"   stop-color="rgba(0,0,0,0.32)"/>
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

    <!-- Refined brocade pattern: small repeating ornament motif -->
    <pattern id="brocade" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="currentColor"/>
      <path d="M10 2 L14 10 L10 18 L6 10 Z" fill="rgba(0,0,0,0.22)"/>
      <circle cx="10" cy="10" r="1.6" fill="rgba(255,255,255,0.35)"/>
      <path d="M0 10 L4 10 M16 10 L20 10" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
      <path d="M10 0 L10 2 M10 18 L10 20" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
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

/* Dense fringe: many parallel thin threads with slight variation. */
function buildDenseFringe({ x1, x2, y, length, color, count = 70, curve = "straight" }) {
  let out = `<g class="fringe" stroke="${color}" stroke-linecap="round" opacity="0.95">`;
  const step = (x2 - x1) / count;
  for (let i = 0; i < count; i++) {
    const x = x1 + step * (i + 0.5);
    // Slight length variation for organic feel
    const len = length * (0.78 + 0.22 * Math.abs(Math.sin(i * 0.7 + (i % 3) * 0.4)));
    // Slight horizontal sway for a hand-made look
    const sway = (Math.sin(i * 1.3) + Math.cos(i * 0.9)) * 1.6;
    const w = 1.1 + (i % 5 === 0 ? 0.5 : 0);
    if (curve === "drape") {
      // Curved, like the threads catch on something
      out += `<path d="M ${x.toFixed(1)} ${y} Q ${(x+sway).toFixed(1)} ${(y+len*0.5).toFixed(1)} ${(x+sway*2).toFixed(1)} ${(y+len).toFixed(1)}" fill="none" stroke-width="${w}"/>`;
    } else {
      out += `<line x1="${x.toFixed(1)}" y1="${y}" x2="${(x+sway).toFixed(1)}" y2="${(y+len).toFixed(1)}" stroke-width="${w}"/>`;
    }
  }
  // Top header band where fringe attaches
  out += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="3" opacity="0.6"/>`;
  out += `</g>`;
  return out;
}

// ---------- FLAT VIEW ----------
function renderHuroreFlat({ fabricColor, borderColor, fringeColor, borderStyle }) {
  const g = HURORE_GEOMETRY;
  const cx = g.canvasW / 2;
  const topY = g.topY;
  const botY = topY + g.height;
  const inset = g.borderW;

  // Outer trapezoid (the full strip)
  const outerPath = `M ${cx - g.topW/2} ${topY}
                     L ${cx + g.topW/2} ${topY}
                     L ${cx + g.bottomW/2} ${botY}
                     L ${cx - g.bottomW/2} ${botY} Z`;

  // Inner trapezoid (inside the border)
  const innerPath = `M ${cx - g.topW/2 + inset} ${topY + inset}
                     L ${cx + g.topW/2 - inset} ${topY + inset}
                     L ${cx + g.bottomW/2 - inset} ${botY - inset}
                     L ${cx - g.bottomW/2 + inset} ${botY - inset} Z`;

  const bFill = borderFillFor(borderStyle, borderColor);

  // Drop shadow ellipse below the strip
  const shadow = `<ellipse cx="${cx}" cy="${botY + g.fringeH + 30}"
                           rx="${g.bottomW * 0.9}" ry="22"
                           fill="rgba(0,0,0,0.45)" filter="url(#blur)"/>`;

  // Fringe at the bottom
  const fringe = buildDenseFringe({
    x1: cx - g.bottomW/2 + 6,
    x2: cx + g.bottomW/2 - 6,
    y: botY,
    length: g.fringeH,
    color: fringeColor,
    count: 80,
  });

  return `
    ${shadow}

    <!-- Fabric body -->
    <path d="${outerPath}" fill="${fabricColor}"/>
    <path d="${outerPath}" fill="url(#fabric-shade)" opacity="0.55"/>
    <path d="${outerPath}" fill="url(#fabric-highlight)"/>

    <!-- Brocade border (outer minus inner via even-odd) -->
    ${borderStyle !== "none" ? `
      <g color="${borderColor}" filter="url(#soft-shadow)">
        <path d="${outerPath} ${innerPath}" fill="${bFill}" fill-rule="evenodd"
              stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>
        <path d="${outerPath} ${innerPath}" fill="url(#border-shine)"
              fill-rule="evenodd" opacity="0.45"/>
      </g>
    ` : ``}

    ${fringe}
  `;
}

// ---------- WORN VIEW ----------
/* Draws a single draped strip following a smooth path.
 * The strip is defined by a centerline curve from (x0,y0) to (x1,y1),
 * with width tapering from topW (at top) to bottomW (at bottom). */
function drapedStripPath({ topCx, topCy, midCx, midCy, botCx, botCy, topW, bottomW }) {
  // Vector along centerline at top (for perpendicular)
  // We'll just offset perpendicular to the centerline direction at each control point.
  // Use a simple approximation: at top, perpendicular is horizontal; at bottom, perpendicular is horizontal.
  // The path is the outline of the strip.
  const topLeft  = { x: topCx - topW/2, y: topCy };
  const topRight = { x: topCx + topW/2, y: topCy };
  // Mid points control the curve along each side
  const midLeftCtrl  = { x: midCx - bottomW/2 - 20, y: midCy };
  const midRightCtrl = { x: midCx + bottomW/2 + 20, y: midCy };
  const botLeft  = { x: botCx - bottomW/2, y: botCy };
  const botRight = { x: botCx + bottomW/2, y: botCy };

  return `M ${topLeft.x} ${topLeft.y}
          L ${topRight.x} ${topRight.y}
          C ${topRight.x + 10} ${topCy + (midCy-topCy)*0.5} ${midRightCtrl.x} ${midRightCtrl.y - 50} ${botRight.x} ${botRight.y}
          L ${botLeft.x} ${botLeft.y}
          C ${midLeftCtrl.x} ${midLeftCtrl.y - 50} ${topLeft.x - 10} ${topCy + (midCy-topCy)*0.5} ${topLeft.x} ${topLeft.y}
          Z`;
}

/* Inner border path: shrink the strip inward by `inset`. */
function drapedStripInnerPath(p, inset) {
  return drapedStripPath({
    topCx: p.topCx,
    topCy: p.topCy + inset,
    midCx: p.midCx,
    midCy: p.midCy,
    botCx: p.botCx,
    botCy: p.botCy - inset,
    topW: Math.max(10, p.topW - inset*2),
    bottomW: Math.max(20, p.bottomW - inset*2),
  });
}

function renderDrapedStrip({ params, fabricColor, borderColor, borderStyle, withFringe, fringeColor, fringeLength }) {
  const inset = HURORE_GEOMETRY.borderW;
  const outer = drapedStripPath(params);
  const inner = drapedStripInnerPath(params, inset);
  const bFill = borderFillFor(borderStyle, borderColor);

  // Fringe at bottom of this strip
  const fringe = withFringe ? buildDenseFringe({
    x1: params.botCx - params.bottomW/2 + 6,
    x2: params.botCx + params.bottomW/2 - 6,
    y: params.botCy,
    length: fringeLength,
    color: fringeColor,
    count: 70,
  }) : "";

  return `
    <g>
      <path d="${outer}" fill="${fabricColor}"/>
      <path d="${outer}" fill="url(#fabric-shade)" opacity="0.55"/>
      <path d="${outer}" fill="url(#fabric-highlight)"/>
      ${borderStyle !== "none" ? `
        <g color="${borderColor}">
          <path d="${outer} ${inner}" fill="${bFill}" fill-rule="evenodd"
                stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>
          <path d="${outer} ${inner}" fill="url(#border-shine)"
                fill-rule="evenodd" opacity="0.45"/>
        </g>
      ` : ``}
      ${fringe}
    </g>
  `;
}

function renderHuroreWorn({ fabricColor, borderColor, fringeColor, borderStyle }) {
  const g = HURORE_GEOMETRY;
  const cx = g.canvasW / 2;

  // The two strips meet at a fold near top-center
  const foldX = cx;
  const foldY = 140;
  const foldW = 90;

  // RIGHT (back) strip: drapes behind, to the right
  const rightParams = {
    topCx: foldX + foldW * 0.3,
    topCy: foldY,
    midCx: foldX + 280,
    midCy: foldY + 500,
    botCx: foldX + 420,
    botCy: foldY + 1080,
    topW: foldW,
    bottomW: 300,
  };

  // LEFT (front) strip: drapes in front, to the left, with fringe
  const leftParams = {
    topCx: foldX - foldW * 0.3,
    topCy: foldY,
    midCx: foldX - 280,
    midCy: foldY + 500,
    botCx: foldX - 380,
    botCy: foldY + 1200,
    topW: foldW,
    bottomW: 340,
  };

  // Shadow under the lower fringe area
  const shadow = `<ellipse cx="${leftParams.botCx}" cy="${leftParams.botCy + g.fringeH + 30}"
                           rx="${leftParams.bottomW * 0.9}" ry="22"
                           fill="rgba(0,0,0,0.5)" filter="url(#blur)"/>`;

  return `
    ${shadow}

    <!-- Back strip first (so the front overlaps it) -->
    ${renderDrapedStrip({
      params: rightParams,
      fabricColor, borderColor, borderStyle,
      withFringe: true,
      fringeColor,
      fringeLength: g.fringeH * 0.7,
    })}

    <!-- Front strip with full fringe -->
    ${renderDrapedStrip({
      params: leftParams,
      fabricColor, borderColor, borderStyle,
      withFringe: true,
      fringeColor,
      fringeLength: g.fringeH,
    })}

    <!-- Subtle fold detail at the top where the strips meet -->
    <ellipse cx="${foldX}" cy="${foldY}" rx="${foldW * 0.9}" ry="10"
             fill="rgba(0,0,0,0.35)" filter="url(#blur)"/>
    <path d="M ${foldX - foldW*0.7} ${foldY - 4}
             Q ${foldX} ${foldY - 14} ${foldX + foldW*0.7} ${foldY - 4}"
          fill="none" stroke="${borderColor}" stroke-width="3" opacity="0.7"/>
  `;
}

// ---------- ENTRY ----------
function renderHurore(opts) {
  if (opts.viewMode === "worn") return renderHuroreWorn(opts);
  return renderHuroreFlat(opts);
}

/* Bounds of the design area in flat view, used by app.js to drop new
 * elements somewhere sensible on the strip. */
function flatDesignBounds() {
  const g = HURORE_GEOMETRY;
  const cx = g.canvasW / 2;
  return {
    cx,
    cy: g.topY + g.height / 2,
    top: g.topY,
    bottom: g.topY + g.height,
    leftAtY(y) {
      const t = (y - g.topY) / g.height;
      const w = g.topW + (g.bottomW - g.topW) * t;
      return cx - w/2;
    },
    rightAtY(y) {
      const t = (y - g.topY) / g.height;
      const w = g.topW + (g.bottomW - g.topW) * t;
      return cx + w/2;
    },
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HURORE_GEOMETRY,
    renderHurore,
    renderHuroreFlat,
    renderHuroreWorn,
    buildHuroreDefs,
    buildFabricDefs,
    flatDesignBounds,
  };
}
