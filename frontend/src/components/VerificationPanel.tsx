import React from 'react';
import { ShieldCheck, ExternalLink, AlertCircle, HelpCircle } from 'lucide-react';
import { VerificationItem, SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface VerificationPanelProps {
  verifications: VerificationItem[];
  currentLang: SupportedLanguage;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ verifications, currentLang }) => {
  const t = translations[currentLang];

  if (!verifications || verifications.length === 0) return null;

  const statusBadges = {
    verified: {
      label: t.statusVerified,
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    unverified: {
      label: t.statusUnverified,
      icon: HelpCircle,
      classes: 'bg-amber-50 text-amber-800 border-amber-300',
    },
    conflicting: {
      label: t.statusConflicting,
      icon: AlertCircle,
      classes: 'bg-rose-50 text-rose-800 border-rose-300',
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <h3 className="text-base font-bold text-slate-900">{t.verificationTitle}</h3>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
          Grounded Sources
        </span>
      </div>

      <div className="space-y-3">
        {verifications.map((item, index) => {
          const badge = statusBadges[item.status] || statusBadges.unverified;
          const BadgeIcon = badge.icon;

          return (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.classes}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                  {item.source_title && (
                    <span className="text-xs font-semibold text-slate-500">
                      via {item.source_title}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-800 pt-0.5">
                  "{item.claim}"
                </p>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic">
                    {item.notes}
                  </p>
                )}
              </div>

              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs self-start"
                >
                  <span>View Citation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
