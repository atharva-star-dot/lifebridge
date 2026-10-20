import React, { useState, useRef } from 'react';
import { Send, Upload, FileText, Image as ImageIcon, X, Loader2, MapPin } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';
import { VoiceRecorder } from './VoiceRecorder';

interface InputPanelProps {
  currentLang: SupportedLanguage;
  onSubmit: (params: { text: string; file: File | Blob | null; lat: number | null; lon: number | null }) => void;
  isLoading: boolean;
  inputText: string;
  onInputChange: (text: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  currentLang,
  onSubmit,
  isLoading,
  inputText,
  onInputChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[currentLang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geo not supported');
      return;
    }
    setLocationStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus('GPS Attached');
      },
      (err) => {
        console.warn('Geolocation denied/error:', err.message);
        setLocationStatus('GPS Denied');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;
    onSubmit({
      text: inputText,
      file: selectedFile,
      lat: userLocation ? userLocation.lat : null,
      lon: userLocation ? userLocation.lon : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="relative mb-3">
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t.inputPlaceholder}
          className="w-full text-sm sm:text-base p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 resize-y"
          disabled={isLoading}
        />

        {/* Selected file preview chip */}
        {selectedFile && (
          <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            {fileName.endsWith('.pdf') ? (
              <FileText className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="font-medium max-w-[200px] truncate">{fileName || 'Attached Audio/Media'}</span>
            <button
              type="button"
              onClick={handleClearFile}
              className="text-slate-400 hover:text-red-600 p-0.5 rounded"
              aria-label="Remove attached file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Speech-to-Text */}
          <VoiceRecorder
            currentLang={currentLang}
            onTranscript={(transcribed) => onInputChange(transcribed)}
            onAudioFile={(blob) => {
              setSelectedFile(blob);
              setFileName('recorded-voice.webm');
            }}
          />

          {/* Multimodal File Upload (Photo, PDF, Audio) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,audio/*"
            className="hidden"
            id="multimodal-file-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Attach a prescription photo, medical PDF report, or road scene photo"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t.uploadFile}</span>
            <span className="sm:hidden">Attach</span>
          </button>

          {/* GPS Location Attachment */}
          <button
            type="button"
            onClick={detectLocation}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              userLocation
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Attach GPS coordinates to find closest hospital/shelter"
          >
            <MapPin className={`w-3.5 h-3.5 ${userLocation ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{locationStatus || 'Attach GPS'}</span>
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || (!inputText.trim() && !selectedFile)}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95 ${
            isLoading || (!inputText.trim() && !selectedFile)
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-red-600 hover:bg-red-700 shadow-red-200 cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.analyzing}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.analyzeBtn}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
