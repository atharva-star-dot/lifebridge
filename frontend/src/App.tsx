import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConsentNotice } from './components/ConsentNotice';
import { OfflineEmergencyCard } from './components/OfflineEmergencyCard';
import { DemoScenarios } from './components/DemoScenarios';
import { InputPanel } from './components/InputPanel';
import { SeverityBanner } from './components/SeverityBanner';
import { ActionCardList } from './components/ActionCardList';
import { EntitiesCard } from './components/EntitiesCard';
import { VerificationPanel } from './components/VerificationPanel';
import { ClarifyingQuestions } from './components/ClarifyingQuestions';
import { LifeBridgeAnalysis, SupportedLanguage } from './types/lifebridge';
import { DEMO_SCENARIOS } from './services/demoData';
import { analyzeInput, checkHealth } from './services/api';
import { AlertCircle, Printer, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [inputText, setInputText] = useState<string>('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('medical_stack');
  const [analyzeLive, setAnalyzeLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<LifeBridgeAnalysis | null>(DEMO_SCENARIOS[0].data);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth().then((health) => {
      setGeminiConfigured(health.gemini_configured);
    });
  }, []);

  const handleSelectScenario = async (scenarioId: string, live: boolean) => {
    setActiveScenarioId(scenarioId);
    setError(null);
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setInputText(scenario.sample_text);

    if (live) {
      setIsLoading(true);
      try {
        const result = await analyzeInput({
          text: scenario.sample_text,
          language: currentLang,
        });
        setAnalysis(result);
      } catch (err: any) {
        console.warn('Live analysis failed, falling back to preloaded scenario data:', err);
        setAnalysis(scenario.data);
        setError(`Live call fallback: ${err.message}. Displaying pre-verified baseline.`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Instant offline precomputed response
      setAnalysis(scenario.data);
    }
  };

  const handleAnalyze = async (params: {
    text: string;
    file: File | Blob | null;
    lat: number | null;
    lon: number | null;
  }) => {
    setIsLoading(true);
    setError(null);
    setActiveScenarioId(null);

    try {
      const result = await analyzeInput({
        text: params.text,
        file: params.file,
        language: currentLang,
        latitude: params.lat,
        longitude: params.lon,
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze input. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    const actionsText = analysis.actions
      .map((a, i) => `${i + 1}. ${a.action} (${a.deadline}) - Reason: ${a.reason}`)
      .join('\n');

    const summary = `[LifeBridge Emergency Action Summary]\nIntent: ${analysis.intent}\nSeverity: ${analysis.severity} (${analysis.urgency})\n\nActions:\n${actionsText}\n\nDisclaimer: ${analysis.disclaimer}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header with language selector and non-diagnostic warning banner */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        geminiConfigured={geminiConfigured}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Zero-storage privacy notice */}
        <ConsentNotice currentLang={currentLang} />

        {/* Offline emergency directory with 1-tap call buttons */}
        <OfflineEmergencyCard currentLang={currentLang} />

        {/* Preloaded demo scenarios */}
        <DemoScenarios
          currentLang={currentLang}
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
          analyzeLive={analyzeLive}
          onToggleAnalyzeLive={setAnalyzeLive}
        />

        {/* Unified multimodal input panel */}
        <InputPanel
          currentLang={currentLang}
          onSubmit={handleAnalyze}
          isLoading={isLoading}
          inputText={inputText}
          onInputChange={setInputText}
        />

        {/* Error notification banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated Plan
              </span>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>
            </div>

            {/* Severity and Intent Banner */}
            <SeverityBanner
              severity={analysis.severity}
              urgency={analysis.urgency}
              intent={analysis.intent}
              confidenceScore={analysis.confidence_score}
              needsHumanConfirmation={analysis.needs_human_confirmation}
              onCopySummary={handleCopySummary}
              copied={copied}
            />

            {/* Prioritized action cards */}
            <ActionCardList actions={analysis.actions} currentLang={currentLang} />

            {/* Extracted clinical and incident entities */}
            <EntitiesCard entities={analysis.extracted_entities} currentLang={currentLang} />

            {/* Grounded verification and sources citations */}
            <VerificationPanel verifications={analysis.verification} currentLang={currentLang} />

            {/* Missing variables clarifying questions */}
            <ClarifyingQuestions
              questions={analysis.clarifying_questions}
              currentLang={currentLang}
              onSelectQuestion={(q) => setInputText((prev) => (prev ? `${prev}\n\n[Clarification]: ${q}` : q))}
            />
          </div>
        )}
      </main>

      {/* Footer with compliance and Spec-Kit attribution */}
      <footer className="max-w-4xl mx-auto px-4 pt-8 text-center border-t border-slate-200 text-xs text-slate-400">
        <p className="mb-1 font-semibold text-slate-500">
          LifeBridge: Spec-Driven AI Architecture for Life-Saving Response
        </p>
        <p>
          Powered by Google GenAI SDK & Gemini 2.5 Flash | Zero Personal Data Retention Policy
        </p>
      </footer>
    </div>
  );
};
