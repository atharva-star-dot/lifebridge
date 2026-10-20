import React from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface OfflineEmergencyCardProps {
  currentLang: SupportedLanguage;
}

export const OfflineEmergencyCard: React.FC<OfflineEmergencyCardProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const helplines = [
    { number: '112', title: t.emergencyPolice, color: 'bg-red-600 hover:bg-red-700 text-white', icon: AlertTriangle },
    { number: '108', title: t.emergencyAmbulance, color: 'bg-rose-600 hover:bg-rose-700 text-white', icon: PhoneCall },
    { number: '102', title: t.emergencyMaternity, color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: ShieldCheck },
    { number: '1916', title: t.emergencyDisaster, color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: PhoneCall },
  ];

  return (
    <div className="bg-white border-2 border-red-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-700">{t.offlineCardTitle}</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Always Ready</span>
      </div>
      <p className="text-xs text-slate-600 mb-3">{t.offlineCardDesc}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {helplines.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold shadow-sm transition-transform active:scale-95 ${item.color}`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-lg tracking-tight font-black">{item.number}</span>
            <span className="text-[10px] text-center opacity-90 line-clamp-1">{item.title.split('-')[1]?.trim() || item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
