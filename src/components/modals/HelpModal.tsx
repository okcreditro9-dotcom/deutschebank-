import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Wie werden meine persönlichen Daten und mein Bankkonto geschützt?',
      a: 'Alle Kundendaten, Ausweisdokumente und Kontobewegungen unterliegen dem strengen deutschen Bankgeheimnis sowie den europäischen Datenschutzrichtlinien (DSGVO). Ihre Daten werden auf zertifizierten Hochsicherheitsservern mit modernster AES-256-Bit-Verschlüsselung verwahrt. Ausschließlich unsere Bank hat Zugriff auf Ihre Daten – kein Dritter, keine externen Dienstleister und keine unbefugten Personen haben Einsicht oder Zugang zu Ihren Kontoinformationen.',
    },
    {
      q: 'Wie kann ich meine Zugangs-PIN bzw. mein Passwort selbst ändern?',
      a: 'Sie können Ihre persönliche Zugangs-PIN jederzeit eigenständig in Ihrem Profil unter „Sicherheit & Zugangs-PIN“ ändern. Nach Eingabe Ihrer aktuellen und neuen PIN wird die Änderung sofort in Echtzeit verschlüsselt in unserer Bankdatenbank gespeichert. Die neue PIN ist unverzüglich für künftige Anmeldungen und Autorisierungen aktiv.',
    },
    {
      q: 'Welche Regeln und Gemeinschaftsstandards gelten für Kontoinhaber?',
      a: 'Unsere Bankengemeinschaft basiert auf gegenseitigem Vertrauen, Fairness und Diskretion. Wir garantieren 100 % transparente Konditionen ohne versteckte Kosten. Im Rahmen der Sorgfaltspflicht verpflichten sich Kunden zu wahrheitsgemäßen Angaben sowie zur streng vertraulichen Aufbewahrung ihrer Zugangs-PIN.',
    },
    {
      q: 'Wie läuft die digitale Prüfung und Auszahlung bei Krediten ab?',
      a: 'Ihr Kreditantrag wird nach digitaler Übermittlung diskret und zeitnah von unseren Kreditspezialisten geprüft. Sobald alle Voraussetzungen erfüllt und bestätigt sind, wird der Darlehensbetrag direkt auf Ihr Girokonto verbucht. Sie erhalten dazu eine offizielle Bestätigung in Ihrem Kundenbereich.',
    },
    {
      q: 'Wie erreiche ich den offiziellen Kundenservice bei Fragen?',
      a: 'Für sofortige und persönliche Hilfe steht Ihnen unser offizieller 24/7 WhatsApp-Kundenservice zur Verfügung. Sie werden direkt mit einem qualifizierten Bankberater verbunden, der Ihre Fragen zu Konto, Freigaben oder Finanzierungen vertraulich beantwortet.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Support &amp; Vertrauen
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Hilfe &amp; Datenschutz-FAQ
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. OFFIZIELLER WHATSAPP KUNDENSERVICE (Beibehalten) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      Sofort-Hilfe via Chat
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-[9px] font-bold">24/7</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">
                    Offizieller WhatsApp Kundenservice
                  </h4>
                </div>
              </div>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed">
              Starten Sie direkt ein vertrauliches Gespräch mit unserem Berater-Team auf WhatsApp für schnelle Antworten zu Konto, PIN-Änderungen oder Krediten.
            </p>

            <a
              href="https://wa.me/qr/LGKAAD5GCWA4O1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-[0.99] text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-center"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Direkt im WhatsApp-Chat öffnen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. Vertrauens- & Datenschutz-Garantie der Bank */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
            <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200 font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>100 % Bankgeheimnis &amp; Exklusiver Datenschutz</span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              Alle Informationen sind durch modernste Verschlüsselung geschützt. 
              <strong> Ausschließlich die Bank hat Zugriff auf Ihre Daten</strong> – keine externen Parteien oder Dritte erhalten Zugang zu Ihrem Konto.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-blue-700 dark:text-blue-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                DSGVO-konform
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                AES-256 Verschlüsselung
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Bankgeheimnis garantiert
              </span>
            </div>
          </div>

          {/* 3. Vertrauensbildende FAQ Accordion */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-400 px-1">
              Häufige Fragen &amp; Sicherheitsrichtlinien
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-3.5 text-left flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer gap-2"
                  >
                    <span className="text-xs">{faq.q}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-sky-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {openFaq === index && (
                    <div className="px-3.5 pb-3.5 pt-1 text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100/80 dark:border-slate-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
