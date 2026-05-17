/* Symbol library for the Hurore Designer.
 * Each symbol is defined as inline SVG markup that is rendered with `currentColor`.
 * Symbols are designed in a 100x100 viewBox so they scale cleanly.
 *
 * Categories make the library easier to browse for liturgical use.
 */

const SYMBOL_LIBRARY = [
  /* ---------- KRUISEN (Crosses) ---------- */
  {
    id: "cross-latin",
    name: "Latijns Kruis",
    category: "Kruisen",
    svg: `<g stroke="currentColor" fill="currentColor" stroke-linejoin="round">
      <rect x="44" y="10" width="12" height="80" rx="1.5"/>
      <rect x="22" y="32" width="56" height="12" rx="1.5"/>
    </g>`,
  },
  {
    id: "cross-syriac",
    name: "Syrisch Kruis",
    category: "Kruisen",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1.2">
      <path d="M50 10 L56 32 L78 32 L62 46 L70 70 L50 56 L30 70 L38 46 L22 32 L44 32 Z"/>
      <circle cx="50" cy="78" r="6"/>
      <path d="M40 90 L60 90 L55 96 L45 96 Z"/>
    </g>`,
  },
  {
    id: "cross-circle",
    name: "Kruis in cirkel",
    category: "Kruisen",
    svg: `<g fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">
      <circle cx="50" cy="50" r="34"/>
      <path d="M50 22 V78 M22 50 H78" stroke-width="8"/>
    </g>`,
  },
  {
    id: "cross-fleur",
    name: "Bloemkruis",
    category: "Kruisen",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1">
      <path d="M46 8 Q50 4 54 8 L54 28 Q60 22 70 24 Q72 30 66 36 L72 40 Q76 44 72 48 L60 48 L60 52 L72 52 Q76 56 72 60 L66 64 Q72 70 70 76 Q60 78 54 72 L54 92 Q50 96 46 92 L46 72 Q40 78 30 76 Q28 70 34 64 L28 60 Q24 56 28 52 L40 52 L40 48 L28 48 Q24 44 28 40 L34 36 Q28 30 30 24 Q40 22 46 28 Z"/>
    </g>`,
  },
  {
    id: "cross-malankara",
    name: "Mar-Thoma Kruis",
    category: "Kruisen",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-linejoin="round">
      <path d="M44 6 L56 6 L56 30 L80 30 L80 42 L56 42 L56 94 L44 94 L44 42 L20 42 L20 30 L44 30 Z"/>
      <circle cx="20" cy="36" r="5"/>
      <circle cx="80" cy="36" r="5"/>
      <circle cx="44" cy="6" r="4"/>
      <circle cx="56" cy="6" r="4"/>
    </g>`,
  },

  /* ---------- EUCHARISTISCHE SYMBOLEN ---------- */
  {
    id: "grapes",
    name: "Druiventros",
    category: "Eucharistie",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="0.8">
      <path d="M50 8 Q40 14 38 26" fill="none" stroke-width="2"/>
      <path d="M44 22 L42 14 L38 12 L36 18" fill="currentColor"/>
      <circle cx="40" cy="32" r="7"/>
      <circle cx="54" cy="32" r="7"/>
      <circle cx="68" cy="32" r="7"/>
      <circle cx="34" cy="46" r="7"/>
      <circle cx="48" cy="46" r="7"/>
      <circle cx="62" cy="46" r="7"/>
      <circle cx="76" cy="46" r="7"/>
      <circle cx="40" cy="60" r="7"/>
      <circle cx="54" cy="60" r="7"/>
      <circle cx="68" cy="60" r="7"/>
      <circle cx="46" cy="74" r="7"/>
      <circle cx="60" cy="74" r="7"/>
      <circle cx="54" cy="88" r="7"/>
    </g>`,
  },
  {
    id: "wheat",
    name: "Korenaar",
    category: "Eucharistie",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
      <line x1="50" y1="50" x2="50" y2="96" stroke-width="2.5"/>
      <ellipse cx="50" cy="14" rx="4" ry="9"/>
      <ellipse cx="40" cy="22" rx="4" ry="8" transform="rotate(-25 40 22)"/>
      <ellipse cx="60" cy="22" rx="4" ry="8" transform="rotate(25 60 22)"/>
      <ellipse cx="34" cy="34" rx="4" ry="8" transform="rotate(-30 34 34)"/>
      <ellipse cx="66" cy="34" rx="4" ry="8" transform="rotate(30 66 34)"/>
      <ellipse cx="30" cy="46" rx="4" ry="8" transform="rotate(-35 30 46)"/>
      <ellipse cx="70" cy="46" rx="4" ry="8" transform="rotate(35 70 46)"/>
      <line x1="50" y1="50" x2="34" y2="64" stroke-width="2"/>
      <line x1="50" y1="50" x2="66" y2="64" stroke-width="2"/>
      <line x1="50" y1="60" x2="32" y2="76" stroke-width="2"/>
      <line x1="50" y1="60" x2="68" y2="76" stroke-width="2"/>
    </g>`,
  },
  {
    id: "chalice",
    name: "Kelk",
    category: "Eucharistie",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
      <path d="M22 18 Q22 50 50 56 Q78 50 78 18 Z"/>
      <rect x="46" y="56" width="8" height="22"/>
      <ellipse cx="50" cy="80" rx="20" ry="4"/>
      <ellipse cx="50" cy="84" rx="22" ry="5"/>
      <ellipse cx="50" cy="14" rx="4" ry="2.5" fill="none" stroke-width="2"/>
    </g>`,
  },
  {
    id: "host",
    name: "Hostie / IHS",
    category: "Eucharistie",
    svg: `<g fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="50" cy="50" r="38"/>
      <circle cx="50" cy="50" r="32" stroke-width="1"/>
    </g>
    <text x="50" y="60" text-anchor="middle"
          font-family="Cinzel, Georgia, serif" font-weight="700"
          font-size="22" fill="currentColor">IHS</text>`,
  },

  /* ---------- HEILIGE GEEST / NATUUR ---------- */
  {
    id: "dove",
    name: "Duif (H. Geest)",
    category: "Heilige Geest",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="0.8">
      <!-- rays -->
      <g stroke-width="2">
        <line x1="50" y1="8" x2="50" y2="2"/>
        <line x1="40" y1="10" x2="36" y2="4"/>
        <line x1="60" y1="10" x2="64" y2="4"/>
        <line x1="32" y1="16" x2="26" y2="12"/>
        <line x1="68" y1="16" x2="74" y2="12"/>
      </g>
      <!-- body -->
      <path d="M50 18 Q60 18 64 26 Q66 32 60 36 L72 46 Q82 50 70 52 L60 50 L58 60 Q56 70 50 72 Q44 70 42 60 L40 50 L30 52 Q18 50 28 46 L40 36 Q34 32 36 26 Q40 18 50 18 Z"/>
      <!-- wings spread -->
      <path d="M10 38 Q24 28 40 36 Q30 42 18 44 Q10 44 10 38 Z"/>
      <path d="M90 38 Q76 28 60 36 Q70 42 82 44 Q90 44 90 38 Z"/>
      <!-- fan tail -->
      <path d="M44 70 L40 92 L46 86 L50 94 L54 86 L60 92 L56 70 Z"/>
      <circle cx="52" cy="24" r="1.4" fill="#0a0a0a"/>
    </g>`,
  },
  {
    id: "flame",
    name: "Vuurvlam (Pinksteren)",
    category: "Heilige Geest",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-linejoin="round">
      <path d="M50 6 Q40 22 42 36 Q34 30 32 42 Q22 50 30 64 Q24 70 32 80 Q40 92 50 92 Q60 92 68 80 Q76 70 70 64 Q78 50 68 42 Q66 30 58 36 Q60 22 50 6 Z"/>
    </g>`,
  },
  {
    id: "olive-branch",
    name: "Olijftak",
    category: "Heilige Geest",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
      <path d="M10 80 Q30 60 50 50 Q70 40 90 24" fill="none" stroke-width="2.5"/>
      <ellipse cx="20" cy="76" rx="6" ry="3" transform="rotate(-30 20 76)"/>
      <ellipse cx="30" cy="68" rx="6" ry="3" transform="rotate(-30 30 68)"/>
      <ellipse cx="42" cy="58" rx="6" ry="3" transform="rotate(-30 42 58)"/>
      <ellipse cx="54" cy="48" rx="6" ry="3" transform="rotate(-30 54 48)"/>
      <ellipse cx="66" cy="40" rx="6" ry="3" transform="rotate(-30 66 40)"/>
      <ellipse cx="78" cy="32" rx="6" ry="3" transform="rotate(-30 78 32)"/>
      <ellipse cx="28" cy="60" rx="4" ry="2" transform="rotate(30 28 60)"/>
      <ellipse cx="48" cy="42" rx="4" ry="2" transform="rotate(30 48 42)"/>
      <ellipse cx="70" cy="26" rx="4" ry="2" transform="rotate(30 70 26)"/>
    </g>`,
  },

  /* ---------- MONOGRAMMEN ---------- */
  {
    id: "chi-rho",
    name: "Chi-Rho (☧)",
    category: "Monogrammen",
    svg: `<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="22" x2="78" y2="78"/>
      <line x1="78" y1="22" x2="22" y2="78"/>
      <path d="M50 18 L50 86" stroke-width="7"/>
      <path d="M50 18 Q72 18 72 32 Q72 46 50 46" stroke-width="6"/>
    </g>`,
  },
  {
    id: "alpha-omega",
    name: "Alpha & Omega",
    category: "Monogrammen",
    svg: `<g fill="currentColor" font-family="Cinzel, Georgia, serif" font-weight="700">
      <text x="22" y="62" font-size="50">Α</text>
      <text x="58" y="62" font-size="50">Ω</text>
    </g>`,
  },
  {
    id: "ihs",
    name: "IHS Monogram",
    category: "Monogrammen",
    svg: `<g fill="currentColor" font-family="Cinzel, Georgia, serif" font-weight="700">
      <text x="50" y="64" text-anchor="middle" font-size="36">IHS</text>
      <rect x="46" y="20" width="8" height="18" rx="1"/>
      <rect x="40" y="26" width="20" height="6" rx="1"/>
    </g>`,
  },
  {
    id: "syriac-cross-mono",
    name: "Maran Etha",
    category: "Monogrammen",
    svg: `<g fill="currentColor" font-family="Estrangelo Edessa, Serto Jerusalem, serif" font-size="34">
      <text x="50" y="40" text-anchor="middle">ܡܪܢ</text>
      <text x="50" y="78" text-anchor="middle">ܐܬܐ</text>
    </g>`,
  },

  /* ---------- DECORATIE ---------- */
  {
    id: "star-8",
    name: "Achthoekige ster",
    category: "Decoratie",
    svg: `<g fill="currentColor">
      <polygon points="50,8 58,32 82,24 70,46 92,50 70,54 82,76 58,68 50,92 42,68 18,76 30,54 8,50 30,46 18,24 42,32"/>
      <circle cx="50" cy="50" r="6" fill="#0a0a0a"/>
    </g>`,
  },
  {
    id: "star-6",
    name: "Davidsster",
    category: "Decoratie",
    svg: `<g fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round">
      <polygon points="50,10 80,68 20,68"/>
      <polygon points="50,90 20,32 80,32"/>
    </g>`,
  },
  {
    id: "rosette",
    name: "Rozet",
    category: "Decoratie",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="0.5">
      <circle cx="50" cy="50" r="8"/>
      ${Array.from({length:8}).map((_,i)=>{
        const a = (i*45)*Math.PI/180;
        const cx = 50 + Math.cos(a)*22;
        const cy = 50 + Math.sin(a)*22;
        return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="10" ry="6" transform="rotate(${i*45} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
      }).join("")}
    </g>`,
  },
  {
    id: "vine-scroll",
    name: "Wijnrank",
    category: "Decoratie",
    svg: `<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M10 90 Q20 60 40 70 Q60 80 50 50 Q40 20 60 30 Q80 40 70 70 Q66 84 88 90"/>
      <path d="M22 70 Q14 64 18 56"/>
      <path d="M48 56 Q58 50 56 42"/>
      <path d="M70 50 Q76 44 74 36"/>
      <circle cx="36" cy="58" r="3" fill="currentColor"/>
      <circle cx="64" cy="34" r="3" fill="currentColor"/>
    </g>`,
  },
  {
    id: "leaf",
    name: "Blad",
    category: "Decoratie",
    svg: `<g fill="currentColor" stroke="currentColor" stroke-width="0.8">
      <path d="M50 10 Q86 30 70 70 Q60 92 50 90 Q40 92 30 70 Q14 30 50 10 Z"/>
      <path d="M50 14 L50 88" fill="none" stroke="#0a0a0a" stroke-width="1.2"/>
      <path d="M50 28 L66 24 M50 28 L34 24 M50 44 L72 40 M50 44 L28 40 M50 60 L68 58 M50 60 L32 58 M50 74 L60 74 M50 74 L40 74" fill="none" stroke="#0a0a0a" stroke-width="0.8"/>
    </g>`,
  },
  {
    id: "medallion",
    name: "Medaillon",
    category: "Decoratie",
    svg: `<g fill="none" stroke="currentColor" stroke-width="3">
      <circle cx="50" cy="50" r="40"/>
      <circle cx="50" cy="50" r="34" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="28" stroke-dasharray="2 3" stroke-width="1"/>
    </g>`,
  },
  {
    id: "border-flourish",
    name: "Sierornament",
    category: "Decoratie",
    svg: `<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 50 Q30 30 50 50 Q70 70 90 50"/>
      <path d="M10 50 Q30 70 50 50 Q70 30 90 50"/>
      <circle cx="10" cy="50" r="3" fill="currentColor"/>
      <circle cx="90" cy="50" r="3" fill="currentColor"/>
      <circle cx="50" cy="50" r="4" fill="currentColor"/>
    </g>`,
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYMBOL_LIBRARY };
}
