import React from 'react';
import { AlertOctagon, AlertTriangle, Info, Clock, CheckCircle, PhoneCall, Copy, Check } from 'lucide-react';
import { SeverityLevel } from '../types/lifebridge';

interface SeverityBannerProps {
  severity: SeverityLevel;
  urgency: string;
  intent: string;
  confidenceScore: number;
  needsHumanConfirmation: boolean;
  onCopySummary: () => void;
  copied: boolean;
}

export const SeverityBanner: React.FC<SeverityBannerProps> = ({
  severity,
  urgency,
  intent,
  confidenceScore,
  needsHumanConfirmation,
  onCopySummary,
  copied,
}) => {
  const isCritical = severity === 'Critical';
  const isUrgent = severity === 'Urgent';

  const styles = {
    Critical: {
      bg: 'bg-red-600',
      border: 'border-red-700',
      badge: 'bg-red-800 text-white',
      icon: AlertOctagon,
      textColor: 'text-white',
      accentColor: 'text-red-100',
    },
    Urgent: {
      bg: 'bg-amber-600',
      border: 'border-amber-700',
      badge: 'bg-amber-800 text-white',
      icon: AlertTriangle,
      textColor: 'text-white',
      accentColor: 'text-amber-100',
    },
    Routine: {
      bg: 'bg-sky-600',
      border: 'border-sky-700',
      badge: 'bg-sky-800 text-white',
      icon: Info,
      textColor: 'text-white',
      accentColor: 'text-sky-100',
    },
  }[severity];

  const Icon = styles.icon;

  return (
    <div className={`rounded-2xl p-5 shadow-lg mb-6 border ${styles.bg} ${styles.border} ${styles.textColor}`}>
      {/* Header row: Severity badge, urgency indicator, and copy button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${styles.badge} ${isCritical ? 'animate-pulse' : ''}`}>
            <Icon className="w-4 h-4" />
            {severity} Severity
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {urgency}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
            Confidence: {(confidenceScore * 100).toFixed(0)}%
          </span>
          <button
            onClick={onCopySummary}
            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
            title="Copy structured action summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Intent statement */}
      <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug mb-3">
        {intent}
      </h2>

      {/* Critical escalation callout with immediate dialer if Critical */}
      {isCritical && (
        <div className="mt-4 bg-red-950/40 border border-red-300/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-200 animate-bounce" />
            <span className="text-xs sm:text-sm font-bold text-red-100">
              Immediate life-threat detected. Emergency services alerted.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="bg-white text-red-700 hover:bg-red-50 font-black text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial 108 (Ambulance)
            </a>
            <a
              href="tel:112"
              className="bg-red-800 text-white hover:bg-red-900 border border-red-500 font-black text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dial 112 (Universal)
            </a>
          </div>
        </div>
      )}

      {needsHumanConfirmation && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-white/80">
          <CheckCircle className="w-3.5 h-3.5 shrink-0 text-white/90" />
          <span>Professional Verification Required: Actions must be confirmed with emergency personnel or attending physicians.</span>
        </div>
      )}
    </div>
  );
};
