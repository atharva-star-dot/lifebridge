import React from 'react';
import { Pill, Waves, Car, Sparkles, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';
import { DEMO_SCENARIOS } from '../services/demoData';

interface DemoScenariosProps {
  currentLang: SupportedLanguage;
  onSelectScenario: (scenarioId: string, live: boolean) => void;
  activeScenarioId: string | null;
  analyzeLive: boolean;
  onToggleAnalyzeLive: (live: boolean) => void;
}

export const DemoScenarios: React.FC<DemoScenariosProps> = ({
  currentLang,
  onSelectScenario,
  activeScenarioId,
  analyzeLive,
  onToggleAnalyzeLive,
}) => {
  const t = translations[currentLang];

  const icons = {
    medical_stack: Pill,
    flood_hazard: Waves,
    road_accident: Car,
  };

  return (
    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t.demoScenariosTitle}
          </h2>
          <p className="text-xs text-slate-500">{t.demoScenariosSubtitle}</p>
        </div>

        {/* Live vs Pre-baked toggle */}
        <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <input
            type="checkbox"
            checked={analyzeLive}
            onChange={(e) => onToggleAnalyzeLive(e.target.checked)}
            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700">{t.analyzeLiveToggle}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEMO_SCENARIOS.map((scenario) => {
          const Icon = icons[scenario.id as keyof typeof icons] || Sparkles;
          const isActive = activeScenarioId === scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id, analyzeLive)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-red-50 border-red-300 ring-2 ring-red-400 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-2.5 mb-2">
                <div className={`p-2 rounded-lg shrink-0 ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    {scenario.title}
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{scenario.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-600 mt-1 inline-block">
                Click to load →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
