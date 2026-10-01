import React from 'react';
import { 
  ShieldCheck,
  Tv
} from 'lucide-react';

interface ProfilePromoVideoProps {
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfilePromoVideo: React.FC<ProfilePromoVideoProps> = () => {
  // Offizielle Dokumentation der Deutsche Bank (40 Jahre Taunusanlage Frankfurt)
  const officialDocEmbed = 'https://www.youtube-nocookie.com/embed/XJ27zyHG3ck?autoplay=1&mute=0&rel=0&modestbranding=1';

  return (
    <section 
      aria-label="Deutsche Bank Offizielle Dokumentation" 
      className="bg-[#030712] rounded-3xl p-4 sm:p-6 border border-[#162238] shadow-2xl shadow-black/80 space-y-3.5 text-white"
    >
      {/* 1. Nicht eingekreister Titelbalken auf Deutsch */}
      <div className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-900/40 border border-blue-400">
        <Tv className="w-4 h-4 text-white" />
        <span>Offizielle Dokumentation (40 Jahre Taunusanlage)</span>
      </div>

      {/* 2. Videoplayer mit der offiziellen Deutsche Bank Dokumentation */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-slate-800 shadow-2xl">
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          <iframe
            src={officialDocEmbed}
            title="Deutsche Bank Twin Towers - 40 Jahre Taunusanlage"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* 3. Nicht eingekreiste Fußzeile auf Deutsch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          Zertifizierte Originalaufnahmen der Deutsche Bank AG · Taunusanlage 12, Frankfurt am Main
        </span>
        <span className="font-mono text-slate-500 text-[10px]">
          Deutsche Bank · Hauptsitz Frankfurt
        </span>
      </div>
    </section>
  );
};
