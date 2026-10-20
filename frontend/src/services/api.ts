import { LifeBridgeAnalysis, SupportedLanguage } from '../types/lifebridge';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function analyzeInput(params: {
  text?: string;
  file?: File | Blob | null;
  language?: SupportedLanguage;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<LifeBridgeAnalysis> {
  const formData = new FormData();

  if (params.text) {
    formData.append('text', params.text);
  }
  if (params.language) {
    formData.append('language', params.language);
  }
  if (params.latitude !== undefined && params.latitude !== null) {
    formData.append('user_latitude', params.latitude.toString());
  }
  if (params.longitude !== undefined && params.longitude !== null) {
    formData.append('user_longitude', params.longitude.toString());
  }
  if (params.file) {
    formData.append('file', params.file);
  }

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; gemini_configured: boolean; model: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  } catch (e) {
    return { status: 'offline', gemini_configured: false, model: 'local-fallback' };
  }
}
