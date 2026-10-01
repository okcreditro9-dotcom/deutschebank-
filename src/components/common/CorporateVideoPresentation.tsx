import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  MessageCircle,
  Landmark,
  BadgePercent,
  Coins,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { NordBankLogo } from './NordBankLogo';

interface CorporateVideoPresentationProps {
  onOpenConsultation?: () => void;
  onOpenWhatsApp?: () => void;
  forceStop?: boolean;
}

interface VideoScene {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  videoUrl: string;
}

const SCENES: VideoScene[] = [
  {
    id: 'kredit-einlagensicherung',
    name: '1. Kreditprüfung & Bankensicherheit',
    category: 'Kredit- & Darlehensprojekt Deutschland',
    description: 'Offizielle Bankenanalyse zur Kreditvergabe, Zinssicherheit und Einlagenschutz in Deutschland.',
    location: 'Frankfurt am Main · Bundesaufsicht & Bankenverband',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Bank_pleite_-_ist_mein_Geld_weg%3F_%28Tagesschau%29.webm',
  },
  {
    id: 'kreditstabilitaet-ezb',
    name: '2. Kreditstabilität & Finanzierung',
    category: 'Großkredite & Unternehmensfinanzierung',
    description: 'Europäische Zentralbank (EZB) Frankfurt · Analyse von Kreditkonditionen, Darlehenszinsen und Liquidität.',
    location: 'EZB Direktion Frankfurt am Main',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Financial_Stability_Review%2C_May_2017_-_Interview_V%C3%ADtor_Const%C3%A2ncio.webm',
  },
  {
    id: 'euro-liquiditaet',
    name: '3. Euro-Liquidität & Barkredit',
    category: 'Zentralbank-Liquidität & Euro-Finanzierung',
    description: 'Produktion von Banknoten und Bereitstellung von Kredittranchen für die deutsche Realwirtschaft.',
    location: 'Frankfurt am Main · Deutsche Bankenliquidität',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/New_20_Euro_Banknotes_Printing_Production.webm',
  },
];

export const CorporateVideoPresentation: React.FC<CorporateVideoPresentationProps> = ({
  onOpenConsultation,
  onOpenWhatsApp,
  forceStop = false,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!forceStop);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentScene = SCENES[currentSceneIdx];

  // Arrêt complet immédiat et définitif sur forceStop (inscription / connexion)
  useEffect(() => {
    if (forceStop) {
      setIsPlaying(false);
      setIsMuted(true);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
          videoRef.current.currentTime = 0;
        } catch (e) {}
      }
    }
  }, [forceStop]);

  // Nettoyage immédiat et arrêt complet lors du démontage du composant
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
          videoRef.current.currentTime = 0;
          videoRef.current.src = "";
          videoRef.current.load();
        } catch (e) {}
      }
    };
  }, []);

  // Synchronisation lecture vidéo à vitesse normale 1.0x (aucun accéléré, aucun minuteur artificiel)
  useEffect(() => {
    if (forceStop) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.muted = true;
      }
      return;
    }

    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0; // Vitesse initiale 100% naturelle
      setCurrentTime(0);

      if (isPlaying) {
        const promise = videoRef.current.play();
        if (promise !== undefined) {
          promise.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => setIsPlaying(false));
            }
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentSceneIdx, forceStop]);

  // Mise à jour continue du temps naturel de la vidéo
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
      videoRef.current.playbackRate = 1.0;
    }
  };

  // Passage automatique à la vidéo suivante UNIQUEMENT quand la vidéo se termine naturellement
  const handleVideoEnded = () => {
    setCurrentSceneIdx((prev) => (prev + 1) % SCENES.length);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Formatage mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const naturalProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section aria-label="NordBank Kredit- und Unternehmensfilm" className="w-full space-y-3">
      {/* 1. Header Au-dessus de la vidéo (aucun texte sur l'image) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <NordBankLogo size={22} />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans flex items-center gap-1.5">
              Nord<span className="text-blue-600 dark:text-blue-400">DeutscheBank</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                · Kredit- &amp; Finanzprojekte Deutschland
              </span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Vollständige Wiedergabe in Echtzeit ({currentSceneIdx + 1}/{SCENES.length}) · Automatische Reihenfolge
            </span>
          </div>
        </div>

        {/* Bouton pour activer/couper le son */}
        <button
          onClick={toggleMute}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          title={isMuted ? 'Ton einschalten' : 'Stummschalten'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{isMuted ? 'Stumm' : 'Ton an'}</span>
        </button>
      </div>

      {/* 2. LE CADRE VIDÉO 100% PROPRE ET SANS AUCUN TEXTE QUI OBSTRUE */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-slate-200 dark:border-slate-800 shadow-xl group">
        
        {/* Progression réelle et naturelle de la vidéo en cours */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/20 z-30 pointer-events-none">
          <div 
            className="h-full bg-blue-500 transition-all duration-150 ease-linear"
            style={{ width: `${naturalProgressPercent}%` }}
          />
        </div>

        {/* Lecteur vidéo plein écran sans texte masquant */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            key={currentScene.videoUrl}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted={isMuted}
            loop={false}
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
          >
            <source src={currentScene.videoUrl} type="video/webm" />
          </video>

          {/* Badge discret NordDeutscheBank en coin supérieur */}
          <div className="absolute top-2.5 right-2.5 pointer-events-none opacity-85 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-white tracking-wider uppercase font-mono border border-white/10">
            NORDDEUTSCHE BANK · FRANKFURT
          </div>

          {/* Bouton Play central uniquement si en pause */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute z-20 w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
              aria-label="Video abspielen"
            >
              <Play className="w-7 h-7 fill-white ml-0.5" />
            </button>
          )}

          {/* Barre de contrôle minimale tout en bas */}
          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
                title={isMuted ? 'Ton an' : 'Stumm'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Temps naturel et réel de la vidéo */}
              <span className="text-[11px] text-slate-300 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <span className="text-[11px] text-slate-300 font-medium hidden sm:inline ml-2">
                · {currentScene.category}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
              title="Vollbild"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTRÔLES DES 3 VIDÉOS & BOUTON DE REDIRECTION WHATSAPP EN ALLEMAND */}
      <div className="space-y-3 pt-1">
        {/* Sélecteur des 3 projets de crédit qui défilent à leur rythme naturel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SCENES.map((scene, idx) => {
            const isSelected = currentSceneIdx === idx;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIdx(idx);
                  setIsPlaying(true);
                }}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />}
                    {idx === 1 && <Landmark className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />}
                    {idx === 2 && <Coins className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />}
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {scene.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-extrabold uppercase bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                      Läuft
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {scene.location}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. BOUTON EN LANGUE ALLEMANDE : REDIRECTION SERVICE CLIENT WHATSAPP */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wide">
                  Offizieller Kundenservice Deutschland
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sofortige Kreditprüfung &amp; persönliche Beratung für Ihren Darlehensantrag
              </p>
            </div>
          </div>

          {/* Boutons d'action principaux */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {/* BOUTON OFFICIEL DE REDIRECTION SERVICE CLIENT WHATSAPP EN ALLEMAND */}
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 active:scale-95 transition-all cursor-pointer border border-emerald-300/30"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span className="whitespace-nowrap">Weiterleitung zum WhatsApp-Kundenservice</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}

            {onOpenConsultation && (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Kreditantrag online</span>
                <span className="xs:hidden">Antrag</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
