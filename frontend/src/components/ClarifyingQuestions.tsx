import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface ClarifyingQuestionsProps {
  questions: string[];
  currentLang: SupportedLanguage;
  onSelectQuestion?: (question: string) => void;
}

export const ClarifyingQuestions: React.FC<ClarifyingQuestionsProps> = ({
  questions,
  currentLang,
  onSelectQuestion,
}) => {
  const t = translations[currentLang];

  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-amber-700" />
        <h3 className="text-sm font-bold text-amber-900">{t.clarifyingTitle}</h3>
      </div>
      <p className="text-xs text-amber-800 mb-3">
        The system detected missing information. Answering these will refine the action plan:
      </p>

      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li
            key={i}
            onClick={() => onSelectQuestion && onSelectQuestion(q)}
            className={`text-xs font-medium text-slate-800 bg-white border border-amber-200/80 rounded-xl p-3 flex items-start justify-between gap-2 shadow-2xs ${
              onSelectQuestion ? 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {i + 1}
              </span>
              <span>{q}</span>
            </div>
            {onSelectQuestion && (
              <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
