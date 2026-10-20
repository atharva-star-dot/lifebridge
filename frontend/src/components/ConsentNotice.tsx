import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface ConsentNoticeProps {
  currentLang: SupportedLanguage;
}

export const ConsentNotice: React.FC<ConsentNoticeProps> = ({ currentLang }) => {
  const [dismissed, setDismissed] = useState(false);
  const t = translations[currentLang];

  if (dismissed) return null;

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 sm:p-4 text-xs text-sky-900 flex items-start justify-between gap-3 shadow-sm mb-4">
      <div className="flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold mr-1">Privacy Guarantee:</span>
          <span>{t.consentNotice}</span>
        </div>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="text-sky-600 hover:text-sky-900 p-1 rounded-md hover:bg-sky-100 transition-colors shrink-0"
        aria-label="Dismiss privacy notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
