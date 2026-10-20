import React from 'react';
import { ShieldAlert, Globe, Activity } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  geminiConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onLanguageChange, geminiConfigured }) => {
  const t = translations[currentLang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Non-diagnostic medical & legal advisory banner */}
      <div className="bg-slate-900 text-amber-300 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
        <span>{t.disclaimerBar}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-200 font-bold text-xl">
            LB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">{t.appTitle}</h1>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                geminiConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Activity className="w-3 h-3" />
                {geminiConfigured ? 'Gemini 2.5 Flash' : 'Demo Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={currentLang}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            aria-label="Select language"
          >
            <option value="en">English (US/IN)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
