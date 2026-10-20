import React from 'react';
import { CheckSquare, Clock, PhoneCall, Navigation, AlertTriangle } from 'lucide-react';
import { ActionItem, SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface ActionCardListProps {
  actions: ActionItem[];
  currentLang: SupportedLanguage;
}

export const ActionCardList: React.FC<ActionCardListProps> = ({ actions, currentLang }) => {
  const t = translations[currentLang];

  if (!actions || actions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare className="w-5 h-5 text-red-600" />
        <h3 className="text-base font-bold text-slate-900">{t.actionsTitle}</h3>
        <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
          {actions.length} Steps
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((item, index) => (
          <div
            key={item.id || index}
            className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
              item.is_high_risk
                ? 'border-red-200 bg-linear-to-r from-red-50/40 via-white to-white'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  item.is_high_risk ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.action}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </div>

              {/* Deadline badge */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {item.deadline}
                </span>
                {item.is_high_risk && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    High-Risk
                  </span>
                )}
              </div>
            </div>

            {/* Direct action buttons (Call or Navigation) */}
            {(item.call_number || item.map_query) && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {item.call_number && (
                  <a
                    href={`tel:${item.call_number}`}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t.callBtn} ({item.call_number})</span>
                  </a>
                )}
                {item.map_query && (
                  <a
                    href={item.map_query}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t.directionsBtn}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
