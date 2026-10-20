import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '../types/lifebridge';
import { translations } from '../i18n/translations';

interface VoiceRecorderProps {
  currentLang: SupportedLanguage;
  onTranscript: (text: string) => void;
  onAudioFile?: (blob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  currentLang,
  onTranscript,
  onAudioFile,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const t = translations[currentLang];

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startRecording = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'mr' ? 'mr-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript || interimTranscript) {
            onTranscript((finalTranscript + interimTranscript).trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore restart error
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition failed to start:', err);
      }
    }

    // Also capture audio stream via MediaRecorder if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (onAudioFile) {
            onAudioFile(audioBlob);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
        console.warn('Microphone stream access error:', err);
      }
    }

    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
          isRecording
            ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
        }`}
        aria-label={isRecording ? 'Stop Voice Recording' : 'Start Voice Recording'}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4 text-white" />
            <span>{t.listening}</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-red-600" />
            <span>{t.tapToSpeak}</span>
          </>
        )}
      </button>

      {!speechSupported && (
        <span className="text-[11px] text-amber-600 flex items-center gap-1" title="Browser speech recognition not detected; voice upload fallback is active">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Voice file fallback active</span>
        </span>
      )}
    </div>
  );
};
