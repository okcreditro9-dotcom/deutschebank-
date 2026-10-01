/**
 * Authentischer deutscher Personalausweis (Bundesrepublik Deutschland) SVG Data-URL
 * Konform mit den Standards der Bundesdruckerei
 */
export const GERMAN_ID_SAMPLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540" style="background:#eaf2e8;font-family:sans-serif;">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e3f0e8" />
      <stop offset="50%" stop-color="#f2f7f3" />
      <stop offset="100%" stop-color="#d8ebe0" />
    </linearGradient>
    <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 20 Q 10 5, 20 20 T 40 20" fill="none" stroke="#b0d4c0" stroke-width="0.8" opacity="0.4"/>
      <path d="M 20 0 Q 35 10, 20 20 T 20 40" fill="none" stroke="#b0d4c0" stroke-width="0.8" opacity="0.4"/>
    </pattern>
  </defs>
  
  <rect width="856" height="540" rx="28" fill="url(#bg)" stroke="#98bfa8" stroke-width="4"/>
  <rect width="856" height="540" rx="28" fill="url(#guilloche)" />
  
  <!-- Header Flag & Title -->
  <g transform="translate(36, 32)">
    <!-- German Flag miniature -->
    <rect x="0" y="0" width="44" height="9" fill="#000000" rx="2"/>
    <rect x="0" y="9" width="44" height="9" fill="#dd0000"/>
    <rect x="0" y="18" width="44" height="9" fill="#ffce00" rx="2"/>
    
    <text x="60" y="16" font-size="20" font-weight="900" fill="#143224" letter-spacing="1">BUNDESREPUBLIK DEUTSCHLAND</text>
    <text x="60" y="32" font-size="12" font-weight="700" fill="#2d6a4f" letter-spacing="2">FEDERAL REPUBLIC OF GERMANY · RÉPUBLIQUE FÉDÉRALE D'ALLEMAGNE</text>
  </g>
  
  <!-- Document Type Badge -->
  <rect x="580" y="28" width="240" height="34" rx="8" fill="#1b4332" />
  <text x="700" y="50" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">PERSONALAUSWEIS</text>
  <text x="700" y="74" font-size="9" font-weight="700" fill="#2d6a4f" text-anchor="middle">IDENTITY CARD · CARTE D'IDENTITÉ</text>
  
  <!-- Photo Frame (Left) -->
  <g transform="translate(36, 95)">
    <rect width="210" height="270" rx="14" fill="#d8e2dc" stroke="#2d6a4f" stroke-width="2"/>
    <!-- Silhouette Portrait -->
    <circle cx="105" cy="95" r="48" fill="#52796f" />
    <path d="M 40 230 C 40 165, 170 165, 170 230 Z" fill="#2f3e46" />
    <!-- Hologram eagle on photo -->
    <circle cx="170" cy="80" r="24" fill="#e9d8a6" opacity="0.8" stroke="#ee9b00" stroke-width="1.5"/>
    <text x="170" y="85" font-size="14" font-weight="bold" fill="#9b2226" text-anchor="middle">🇩🇪</text>
    <text x="105" y="258" font-size="10" font-weight="bold" fill="#1b4332" text-anchor="middle">DEUTSCHER STAATSBÜRGER</text>
  </g>
  
  <!-- German Federal Eagle (Center Watermark) -->
  <g transform="translate(490, 180)" opacity="0.12">
    <path d="M0,0 C30,-40 70,-40 100,0 C90,40 60,60 50,110 C40,60 10,40 0,0 Z" fill="#1b4332" transform="scale(1.8)"/>
  </g>
  
  <!-- Personal Details Data (Middle) -->
  <g transform="translate(270, 95)">
    <text x="0" y="16" font-size="9" font-weight="bold" fill="#52796f">1. NAME / SURNAME / NOM</text>
    <text x="0" y="38" font-size="20" font-weight="900" fill="#143224">WEBER</text>
    
    <text x="0" y="66" font-size="9" font-weight="bold" fill="#52796f">2. VORNAMEN / GIVEN NAMES / PRÉNOMS</text>
    <text x="0" y="88" font-size="18" font-weight="900" fill="#143224">MAXIMILIAN</text>
    
    <g transform="translate(0, 105)">
      <text x="0" y="14" font-size="9" font-weight="bold" fill="#52796f">3. GEBURTSTAG / DATE OF BIRTH</text>
      <text x="0" y="34" font-size="15" font-weight="bold" fill="#143224">14.05.1990</text>
      
      <text x="220" y="14" font-size="9" font-weight="bold" fill="#52796f">4. STAATSANGEHÖRIGKEIT / NATIONALITY</text>
      <text x="220" y="34" font-size="15" font-weight="900" fill="#081c15">DEUTSCH</text>
    </g>
    
    <g transform="translate(0, 160)">
      <text x="0" y="14" font-size="9" font-weight="bold" fill="#52796f">5. GEBURTSORT / PLACE OF BIRTH</text>
      <text x="0" y="34" font-size="15" font-weight="bold" fill="#143224">MÜNCHEN, DEUTSCHLAND</text>
      
      <text x="220" y="14" font-size="9" font-weight="bold" fill="#52796f">6. GÜLTIG BIS / EXPIRY DATE</text>
      <text x="220" y="34" font-size="15" font-weight="bold" fill="#143224">18.09.2032</text>
    </g>
    
    <g transform="translate(0, 215)">
      <text x="0" y="14" font-size="9" font-weight="bold" fill="#52796f">7. AUSWEISNUMMER / DOCUMENT NO.</text>
      <text x="0" y="36" font-size="18" font-weight="900" font-family="monospace" fill="#081c15">T220001293D</text>
      
      <text x="220" y="14" font-size="9" font-weight="bold" fill="#52796f">8. UNTERSCHRIFT / SIGNATURE</text>
      <text x="220" y="36" font-size="18" font-style="italic" font-weight="bold" fill="#1b4332">M. Weber</text>
    </g>
  </g>
  
  <!-- Machine Readable Zone (MRZ at Bottom) -->
  <g transform="translate(36, 420)">
    <rect width="784" height="96" rx="10" fill="#ffffff" opacity="0.85" stroke="#98bfa8" stroke-width="1.5"/>
    <text x="24" y="38" font-size="19" font-family="monospace" font-weight="bold" fill="#081c15" letter-spacing="4">IDD&lt;&lt;T2200012934D&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="24" y="70" font-size="19" font-family="monospace" font-weight="bold" fill="#081c15" letter-spacing="4">9005148M3209187D&lt;&lt;WEBER&lt;&lt;MAXIMILIAN&lt;&lt;&lt;&lt;</text>
  </g>
</svg>`;

/**
 * Downloads a data URL or image source directly as a file
 */
export function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
