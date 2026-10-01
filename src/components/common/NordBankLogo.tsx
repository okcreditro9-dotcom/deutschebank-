import React from 'react';

interface NordBankLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  markColor?: string;
}

/**
 * NordDeutscheBank Offizielles Logo
 * Reines Vektor-SVG entsprechend der offiziellen deutschen Bank-Markenidentität:
 * - Quadratischer königsblauer Rahmen
 * - Drei diagonale Streifen und Formelemente
 * - Typografie: NordDeutscheBank
 */
export const NordBankLogo: React.FC<NordBankLogoProps> = ({
  className = '',
  size = 32,
  showText = false,
  textColor,
  markColor,
}) => {
  // Primäre königsblaue Markenfarbe der NordDeutscheBank
  const brandBlue = markColor || '#002B9E';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {/* 1. Offizielles quadratisches Logo-Emblem (Vektor SVG) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        aria-label="NordDeutscheBank Logo"
      >
        {/* Quadratischer Außenrahmen */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 0 0 H 100 V 100 H 0 Z M 11 11 V 89 H 89 V 11 Z"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />

        {/* Streifen 1 (links) */}
        <polygon
          points="18,78 27.5,78 49.5,22 40,22"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />

        {/* Streifen 2 (Mitte) */}
        <polygon
          points="31,78 40.5,78 62.5,22 53,22"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />

        {/* Streifen 3 (rechts) */}
        <polygon
          points="44,78 53.5,78 75.5,22 66,22"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />

        {/* Oberes rechtes Kopf-Element */}
        <path
          d="M 72 22 H 82 V 32 L 77.5 32 L 73.5 22 Z"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />

        {/* Unteres rechtes Formelement (getrennt durch feinen horizontalen Schlitz) */}
        <polygon
          points="57,78 82,78 82,51 68,51"
          className="fill-[#002B9E] dark:fill-blue-500"
          style={{ fill: markColor }}
        />
      </svg>

      {/* 2. Offizieller Schriftzug: NordDeutscheBank */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span
            className="text-base sm:text-lg font-black tracking-tight font-sans text-[#002B9E] dark:text-blue-400"
            style={textColor ? { color: textColor } : undefined}
          >
            NordDeutscheBank
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-0.5">
            Finanzgruppe Deutschland
          </span>
        </div>
      )}
    </div>
  );
};
