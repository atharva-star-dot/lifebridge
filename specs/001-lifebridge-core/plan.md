# Implementation Plan: LifeBridge Core - Universal Intent to Action Engine

**Branch**: `001-lifebridge-core` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-lifebridge-core/spec.md`

## Summary
LifeBridge implements an end-to-end multimodal pipeline that ingests messy real-world input (text, speech, photos, PDFs) and produces structured, verified, life-saving action cards. The architecture combines a FastAPI Python backend utilizing the Google Gen AI SDK (`google-genai`), Google Search grounding for verification, deterministic heuristic safety rules for red-flag emergency escalation, and a mobile-first React + Vite + Tailwind PWA frontend with Web Speech API support.

## Technical Context

**Language/Version**: Python 3.11+, TypeScript 5+, Node.js 20+  
**Primary Dependencies**:
- Backend: `fastapi`, `uvicorn`, `pydantic>=2.0`, `google-genai>=1.0.0`, `python-multipart`, `pypdf`, `pillow`
- Frontend: `react`, `react-dom`, `vite`, `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`  
**Storage**: Stateless zero-persistence architecture. Ephemeral file buffers in memory/temp with immediate disposal.  
**Testing**: `pytest`, `pytest-asyncio`, `httpx` (backend); Vitest / React Testing Library (frontend).  
**Target Platform**: Mobile-first Web/PWA, Docker container, Cloud Run / AWS ECS / EC2 free tier.  
**Project Type**: Full-stack web application (FastAPI backend + Vite React frontend).  
**Performance Goals**: Text triage < 3.5s; Multimodal triage < 7s; Zero UI crashes on schema variation.  
**Constraints**: Zero secrets in repo; WCAG AA touch targets (min 48x48px); Offline static emergency card fallback.

## Constitution Check

- [x] **Safety First**: AI output is explicitly disclaimed; high-risk actions include confidence, citations, and "verify with professional" notes.
- [x] **Structured Output Only**: Pydantic v2 validation enforces strict JSON schema on all Gemini outputs.
- [x] **Verification Over Generation**: Grounded claims link to Google Search/Maps source URLs; unverified claims explicitly flagged.
- [x] **Multimodal by Default**: Text, audio, image, and PDF ingestion into a single analysis pipeline.
- [x] **Privacy & Minimization**: Zero database persistence; PII sanitized in logs; clear consent banner.
- [x] **Accessibility & Multilingual**: WCAG AA touch targets; plain-language; English, Hindi, Marathi support.
- [x] **Graceful Degradation**: Offline emergency directory; clarification questions instead of hallucinated answers.
- [x] **Simplicity**: Monorepo with Dockerfile and `docker-compose.yml`, secrets passed via environment variables only.

## Project Structure

```text
lifebridge/
├── specs/
│   └── 001-lifebridge-core/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── prompt-library.md
│       ├── test-plan.md
│       └── contracts/
│           └── openapi.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   ├── prompts.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── gemini_service.py
│   │   │   ├── rules_engine.py
│   │   │   ├── grounding_service.py
│   │   │   └── multimodal_extractor.py
│   │   └── api/
│   │       ├── __init__.py
│   │       └── routes.py
│   ├── tests/
│   │   ├── test_schemas.py
│   │   ├── test_rules_engine.py
│   │   └── test_api.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── ConsentNotice.tsx
│   │   │   ├── InputPanel.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── SeverityBanner.tsx
│   │   │   ├── ActionCardList.tsx
│   │   │   ├── EntitiesCard.tsx
│   │   │   ├── VerificationPanel.tsx
│   │   │   ├── ClarifyingQuestions.tsx
│   │   │   ├── OfflineEmergencyCard.tsx
│   │   │   └── DemoScenarios.tsx
│   │   ├── types/
│   │   │   └── lifebridge.ts
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── demoData.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Architectural Execution Flow

1. **Client Ingestion**:
   - User provides voice (Web Speech API transcribed or mic stream), photo, PDF, or text.
   - Client sends `multipart/form-data` to `/api/analyze`.
2. **Backend Pipeline**:
   - `multimodal_extractor`: Extracts text from PDFs (pypdf), formats images (PIL), validates mime types.
   - `rules_engine`: Deterministic red-flag keyword check (e.g. "unresponsive", "bleeding", "stroke").
   - `gemini_service`: Calls Gemini 2.5 Flash with structured `response_schema` enforcing `LifeBridgeAnalysis`.
   - `grounding_service`: Verifies claims using Google Search grounding citations and converts location entities to Google Maps URLs.
   - Heuristic escalation merge: If red flags triggered, severity is escalated to `Critical` regardless of model output.
3. **Response & UI Render**:
   - Strict Pydantic validation guarantees schema safety.
   - Frontend renders severity banner, instant 112/108 calling buttons (if Critical/Urgent), action cards with deadlines, entities, verification sources, and clarification questions.
