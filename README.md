# LifeBridge: Universal Intent to Action Engine

> **A Gemini-powered situational triage engine that converts chaotic, unstructured real-world inputs (voice, photos, PDFs, text) into verified, prioritized, life-saving actions.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4.svg)](https://aistudio.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## Overview

LifeBridge bridges human intent and complex systems during emergencies and clinical confusion. A caregiver or resident facing an active emergency, drug interaction ambiguity, or environmental disaster can provide any combination of:
- **Speech**: Voice recording or real-time Web Speech live mic transcription.
- **Photos**: Medicine packaging, handwritten prescriptions, flood scenes, road accidents.
- **Documents**: Cluttered clinical discharge summaries or lab reports (PDF/text).
- **Hazard Alerts**: Real-time traffic, meteorology, or news text.

LifeBridge immediately returns structured, grounded action cards with objective severity ratings, direct 1-tap emergency dialers (112, 108, 102 for India), and Google Maps facility navigation links.

---

## Core Safety Principles (Constitutional Mandate)

1. **Safety First**: AI output is explicitly disclaimed as non-diagnostic guidance. High-risk actions include confidence levels, sources, and professional verification advisories.
2. **Structured Output Only**: Gemini responses are enforced via JSON schema (`response_schema`) and validated via Pydantic v2 before reaching the UI.
3. **Verification Over Generation**: Factual assertions are grounded via Google Search and official emergency sources with clickable citations.
4. **Multimodal Pipeline**: Voice, images, documents, and text converge into a unified ingestion pipeline.
5. **Zero-Storage Privacy**: No storage of personal health data; PII sanitized; ephemeral memory processing only.
6. **Accessibility & Inclusivity**: Mobile-first design, WCAG AA contrast, voice input/output, and multilingual support for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
7. **Deterministic Heuristic Escalation**: Hard-coded keyword checks (cardiac arrest, severe bleeding, stroke, flood trap) unconditionally force `Critical` severity override regardless of model assessment.
8. **Simplicity & Hygiene**: Dockerized monorepo with `.env.example` and zero committed credentials.

---

## 3 Canonical Preloaded Demo Scenarios

LifeBridge includes 3 canonical preloaded scenarios available out-of-the-box (with both instant offline evaluations and a toggle for live Gemini execution):

| Scenario | Input Modality | Description |
| :--- | :--- | :--- |
| **1. Caregiver Medical Stack** | PDF summary + Prescription photo | 68yo post-cardiac stent patient prescribed Aspirin + Clopidogrel and given Ibuprofen for back pain; flags severe GI bleeding risk. |
| **2. Urban Flood Hazard** | Street photo + Disaster alert | Mithi River (Mumbai) flood surge reaching 4ft with sparking transformer; guides immediate evacuation and warns against electrical arcs. |
| **3. Highway Road Accident** | Panicked voice note audio | Motorcyclist unconscious with head injury on Western Express Highway; provides C-spine safety advice and speed-dials 108/112. |

---

## Architecture

```
[User Input: Voice / Photo / PDF / Text / GPS]
                      │
                      ▼
            [React + Vite Frontend]
  (Web Speech API, Offline Emergency Directory, i18n)
                      │
                      ▼ POST /api/analyze
            [FastAPI Backend]
         ┌────────────┴────────────┐
         ▼                         ▼
 [Multimodal Extractor]   [Deterministic Rules Engine]
(pypdf, Pillow, Mime)    (Cardiac/Trauma Heuristic Override)
         └────────────┬────────────┘
                      ▼
          [Google GenAI SDK]
       Gemini 2.5 Flash Model
     (Structured response_schema)
                      │
                      ▼
         [Grounding & Maps Engine]
  (Google Search Citations + Maps Queries)
                      │
                      ▼
     [Strict Pydantic Validation]
                      │
                      ▼
     [Action Cards & Verification UI]
```

---

## Quickstart Setup

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- (Optional) Docker & Docker Compose
- (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key in `.env`:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
DEFAULT_MODEL=gemini-2.5-flash
```

*(Note: LifeBridge runs in intelligent demo mode even without an API key!)*

---

### 2. Local Development

#### Start Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000` (Interactive Swagger docs at `http://localhost:8000/docs`)

#### Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend UI will be live at: `http://localhost:3000`

---

### 3. Docker Deployment (Single Command)

To run the entire stack with Docker Compose:
```bash
docker-compose up --build
```
Access the application at `http://localhost:3000`.

---

## Running Automated Tests

Run backend tests:
```bash
cd backend
pytest -v
```
Run frontend production build verification:
```bash
cd frontend
npm run build
```

---

## API Contract Summary

### `POST /api/analyze`
**Request Payload** (`multipart/form-data`):
- `text`: (Optional) Freeform incident text or transcribed speech.
- `language`: Target output language code (`en`, `hi`, `mr`).
- `file`: (Optional) Uploaded photo (JPG/PNG), document (PDF), or voice audio (WEBM/MP3).
- `user_latitude`: (Optional) Decimal latitude for local facility navigation.
- `user_longitude`: (Optional) Decimal longitude for local facility navigation.

**Response Schema** (`application/json`):
```json
{
  "intent": "Manage post-stent medication safety and acute GI symptoms",
  "severity": "Urgent",
  "urgency": "Within 1 to 2 hours",
  "extracted_entities": {
    "people": ["68yo male patient"],
    "medications": ["Aspirin 75mg", "Clopidogrel 75mg", "Ibuprofen 400mg"],
    "symptoms": ["Burning stomach pain", "Dizziness"],
    "locations": ["Home"],
    "times": ["Morning"]
  },
  "actions": [
    {
      "id": "act-1",
      "action": "Discontinue Ibuprofen 400mg immediately",
      "reason": "Severe GI ulceration and bleeding contraindication with dual antiplatelets.",
      "deadline": "Immediate (< 15 mins)",
      "call_number": null,
      "map_query": null,
      "is_high_risk": true
    }
  ],
  "verification": [
    {
      "claim": "NSAIDs contraindicated with DAPT post stenting",
      "status": "verified",
      "source_title": "ACC / AHA Guidelines",
      "source_url": "https://www.acc.org/guidelines"
    }
  ],
  "confidence_score": 0.96,
  "needs_human_confirmation": true,
  "clarifying_questions": ["Any vomiting or black stools noticed?"]
}
```

---

## License & Compliance
LifeBridge is engineered as a reference architecture for Spec-Driven Development (Spec Kit). Built for emergency safety, accessibility, and high-impact AI alignment.
