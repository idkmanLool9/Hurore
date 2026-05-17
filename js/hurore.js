/* Hurore template renderer.
 *
 * Renders the blank Hurore (Syriac Orthodox priestly stole) as SVG.
 * The Hurore is a long fabric stole. We render it as TWO tapered strips
 * laid side-by-side, narrow at the top (neckline) and wider at the bottom
 * where the embroidery and fringe hangs. One end traditionally carries
 * the cross medallion, the other a dove or cross.
 *
 * The canvas viewBox is 1200 x 1600. The Hurore is centered, leaving room
 * around the edges for shadow and any overflow.
 */

const HURORE_GEOMETRY = {
  canvasW: 1200,
  canvasH: 1600,

  // Each strip
  topW: 180,      // width at the top (neck end)
  bottomW: 280,   // width at the bottom (hanging end)
  height: 1400,   // length of strip
  gap: 80,        // gap between the two strips at the neck

  borderW: 28,    // outer galon (trim) width
  fringeH: 60,    // length of the fringe

  // Position
  topY: 80,
};

function buildHurorePath(g, side) {
  // side = -1 for left strip, +1 for right strip
  const cx = g.canvasW / 2;
  const halfGap = g.gap / 2;
  const topHalf = g.topW / 2;
  const botHalf = g.bottomW / 2;

  // For the left strip: it sits to the left of center.
  // Its right edge meets the center gap; its left edge is the outer edge.
  // Top: from (cx - halfGap - topW, topY) to (cx - halfGap, topY)
  // Bottom: from (cx - halfGap - bottomW, topY+height) to (cx - halfGap, topY+height)
  // Tapered outer (left) edge, straight inner (right) edge.

  const topY = g.topY;
  const botY = g.topY + g.height;

  if (side === -1) {
    const innerX = cx - halfGap;
    const topOuterX = innerX - g.topW;
    const botOuterX = innerX - g.bottomW;
    return `M ${topOuterX} ${topY}
            L ${innerX} ${topY}
            L ${innerX} ${botY}
            L ${botOuterX} ${botY}
            Z`;
  } else {
    const innerX = cx + halfGap;
    const topOuterX = innerX + g.topW;
    const botOuterX = innerX + g.bottomW;
    return `M ${innerX} ${topY}
            L ${topOuterX} ${topY}
            L ${botOuterX} ${botY}
            L ${innerX} ${botY}
            Z`;
  }
}

function buildStripGeometry(g, side) {
  // Returns the bounding box of one strip for placing symbols.
  const cx = g.canvasW / 2;
  const halfGap = g.gap / 2;
  const topY = g.topY;
  const botY = g.topY + g.height;

  if (side === -1) {
    const innerX = cx - halfGap;
    return {
      side: -1,
      topLeft: { x: innerX - g.topW, y: topY },
      topRight: { x: innerX, y: topY },
      botLeft: { x: innerX - g.bottomW, y: botY },
      botRight: { x: innerX, y: botY },
      centerX: innerX - g.bottomW / 2,
      bottomY: botY,
    };
  } else {
    const innerX = cx + halfGap;
    return {
      side: +1,
      topLeft: { x: innerX, y: topY },
      topRight: { x: innerX + g.topW, y: topY },
      botLeft: { x: innerX, y: botY },
      botRight: { x: innerX + g.bottomW, y: botY },
      centerX: innerX + g.bottomW / 2,
      bottomY: botY,
    };
  }
}

/* Build the inner border outline (a smaller inset of the strip) for the
 * decorative trim line drawn parallel to the outer edge. */
function buildInnerBorderPath(g, side, inset) {
  const cx = g.canvasW / 2;
  const halfGap = g.gap / 2;
  const topY = g.topY + inset;
  const botY = g.topY + g.height - inset;

  if (side === -1) {
    const innerX = cx - halfGap - inset;
    // Outer edge angle of the taper
    const dx = g.bottomW - g.topW;
    const dy = g.height;
    const ang = Math.atan2(dy, dx);
    // We approximate by simply insetting both verticals; the outer tapered edge
    // is brought in by `inset` perpendicular to itself.
    const topOuterX = innerX - g.topW + inset;
    const botOuterX = innerX - g.bottomW + inset;
    return `M ${topOuterX} ${topY}
            L ${innerX} ${topY}
            L ${innerX} ${botY}
            L ${botOuterX} ${botY}
            Z`;
  } else {
    const innerX = cx + halfGap + inset;
    const topOuterX = innerX + g.topW - inset;
    const botOuterX = innerX + g.bottomW - inset;
    return `M ${innerX} ${topY}
            L ${topOuterX} ${topY}
            L ${botOuterX} ${botY}
            L ${innerX} ${botY}
            Z`;
  }
}

/* Build the fringe (tassels) at the bottom of a strip */
function buildFringe(g, side, color) {
  const geom = buildStripGeometry(g, side);
  const startX = geom.botLeft.x;
  const endX = geom.botRight.x;
  const y0 = geom.bottomY;
  const tassels = 22;
  const step = (endX - startX) / tassels;
  let out = "";
  for (let i = 0; i < tassels; i++) {
    const x = startX + step * (i + 0.5);
    // wavy tassel
    const len = g.fringeH * (0.8 + 0.2 * Math.sin(i * 1.3));
    out += `<path d="M ${x} ${y0} Q ${x - 2} ${y0 + len * 0.5} ${x + 1} ${y0 + len}"
             stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.95"/>`;
  }
  return out;
}

/* Build a fabric texture <defs> pattern for subtle weave. */
function buildFabricDefs(fabricColor) {
  return `
    <pattern id="fabric-weave" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${fabricColor}"/>
      <path d="M0 3 H6 M3 0 V6" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="fabric-shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="0.5" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.25)"/>
    </linearGradient>
    <linearGradient id="border-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="0.5" stop-color="rgba(255,255,255,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.25)"/>
    </linearGradient>
    <pattern id="brocade" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="currentColor"/>
      <path d="M0 7 L7 0 L14 7 L7 14 Z" fill="rgba(0,0,0,0.18)"/>
      <circle cx="7" cy="7" r="1.5" fill="rgba(255,255,255,0.35)"/>
    </pattern>
    <pattern id="rope" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="currentColor"/>
      <path d="M0 5 Q2.5 0 5 5 T10 5" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.2"/>
    </pattern>
  `;
}

/* Build the entire blank Hurore SVG content. Returns markup to be injected
 * into the canvas group. */
function renderHurore({ fabricColor, borderColor, fringeColor, borderStyle, viewMode }) {
  const g = HURORE_GEOMETRY;

  const borderFill = (() => {
    if (borderStyle === "brocade") return `url(#brocade)`;
    if (borderStyle === "rope") return `url(#rope)`;
    if (borderStyle === "none") return "none";
    return borderColor;
  })();

  // Both strips
  const stripL = buildHurorePath(g, -1);
  const stripR = buildHurorePath(g, +1);
  const innerL = buildInnerBorderPath(g, -1, g.borderW);
  const innerR = buildInnerBorderPath(g, +1, g.borderW);

  // The border is the outer strip minus the inner area => use even-odd fill.
  const borderPathL = `${stripL} ${innerL}`;
  const borderPathR = `${stripR} ${innerR}`;

  const fringe = buildFringe(g, -1, fringeColor) + buildFringe(g, +1, fringeColor);

  return `
    <!-- Soft drop shadow under the fabric -->
    <ellipse cx="${g.canvasW/2}" cy="${g.topY + g.height + g.fringeH + 20}"
             rx="${g.bottomW * 2}" ry="20" fill="rgba(0,0,0,0.45)" filter="url(#blur)"/>

    <!-- Left strip fabric -->
    <path d="${stripL}" fill="${fabricColor}" />
    <path d="${stripL}" fill="url(#fabric-shade)" opacity="0.6"/>

    <!-- Right strip fabric -->
    <path d="${stripR}" fill="${fabricColor}" />
    <path d="${stripR}" fill="url(#fabric-shade)" opacity="0.6"/>

    <!-- Borders (galon) -->
    ${borderStyle !== "none" ? `
      <g color="${borderColor}">
        <path d="${borderPathL}" fill="${borderFill}" fill-rule="evenodd" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>
        <path d="${borderPathR}" fill="${borderFill}" fill-rule="evenodd" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>
        <path d="${borderPathL}" fill="url(#border-shine)" fill-rule="evenodd" opacity="0.5"/>
        <path d="${borderPathR}" fill="url(#border-shine)" fill-rule="evenodd" opacity="0.5"/>
      </g>
    ` : ``}

    <!-- Fringe -->
    ${fringe}
  `;
}

/* Build all the SVG <defs> needed by the Hurore. */
function buildHuroreDefs() {
  return `
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  `;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HURORE_GEOMETRY,
    renderHurore,
    buildHuroreDefs,
    buildFabricDefs,
    buildStripGeometry,
  };
}
