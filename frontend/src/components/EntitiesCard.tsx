import React from 'react';
import { Layers, Users, Pill, Activity, MapPin, Clock } from 'lucide-react';
import { ExtractedEntities, SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface EntitiesCardProps {
  entities: ExtractedEntities;
  currentLang: SupportedLanguage;
}

export const EntitiesCard: React.FC<EntitiesCardProps> = ({ entities, currentLang }) => {
  const t = translations[currentLang];

  const categories = [
    { label: t.symptoms, items: entities.symptoms, icon: Activity, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: t.medications, items: entities.medications, icon: Pill, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: t.people, items: entities.people, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: t.locations, items: entities.locations, icon: MapPin, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: t.times, items: entities.times, icon: Clock, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ].filter((cat) => cat.items && cat.items.length > 0);

  if (categories.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-slate-700" />
        <h3 className="text-base font-bold text-slate-900">{t.entitiesTitle}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <cat.icon className="w-4 h-4 text-slate-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{cat.label}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${cat.color}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
