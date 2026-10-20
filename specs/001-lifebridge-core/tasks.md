# Tasks: LifeBridge Core - Universal Intent to Action Engine

**Branch**: `001-lifebridge-core` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Organization
Tasks are ordered sequentially so that a working end-to-end demo (text input → structured action cards) exists first, followed by multimodal ingestion, verification grounding, multilingual capabilities, demo scenarios, and Docker deployment.

---

## Phase 1: Setup & Foundational Infrastructure
**Goal**: Initialize backend and frontend scaffolds, dependencies, and configuration.

- [x] T001 Initialize repository structure with `backend/` and `frontend/` directories per plan.
- [x] T002 [P] Create `backend/requirements.txt` with FastAPI, Uvicorn, Pydantic v2, Google GenAI SDK, python-multipart, pypdf, and Pillow.
- [x] T003 [P] Create `backend/app/config.py` for environment variables (`GEMINI_API_KEY`, `ENVIRONMENT`, `PORT`).
- [x] T004 Create `backend/app/schemas.py` implementing Pydantic models: `SeverityLevel`, `VerificationStatus`, `ExtractedEntities`, `ActionItem`, `VerificationItem`, and `LifeBridgeAnalysis`.
- [x] T005 Initialize frontend with Vite + React + TypeScript + Tailwind CSS and Lucide icons in `frontend/`.
- [x] T006 [P] Create frontend TypeScript definitions in `frontend/src/types/lifebridge.ts` mirroring `schemas.py`.

---

## Phase 2: MVP End-to-End (Text Input → Structured Action Cards)
**Goal**: Establish a functional MVP where messy text input generates verified, structured action cards.

- [x] T007 Implement deterministic heuristic safety rules engine in `backend/app/services/rules_engine.py` (cardiac, trauma, disaster red flags).
- [x] T008 Implement Gemini GenAI service in `backend/app/services/gemini_service.py` with structured `response_schema` and prompt template.
- [x] T009 Create `/api/health` and `/api/analyze` (text-only MVP) routes in `backend/app/api/routes.py` and `backend/app/main.py`.
- [x] T010 Build frontend API client service in `frontend/src/services/api.ts` to call `/api/analyze`.
- [x] T011 Create UI components:
  - `Header.tsx` with logo, subtitle, and medical disclaimer banner.
  - `ConsentNotice.tsx` showing zero-storage and privacy notice.
  - `InputPanel.tsx` with textarea for real-world input and submit button.
  - `SeverityBanner.tsx` displaying color-coded severity (Critical red, Urgent amber, Routine blue).
  - `ActionCardList.tsx` rendering prioritized action cards with urgency, rationale, and call buttons.
- [x] T012 Integrate MVP components into `frontend/src/App.tsx` and verify end-to-end flow with text input.

---

## Phase 3: Multimodal Pipeline (Image, PDF & Voice Ingestion)
**Goal**: Expand input capabilities to photos (injuries, prescriptions), PDFs (medical histories), and speech recordings.

- [x] T013 Implement `backend/app/services/multimodal_extractor.py` to extract text from PDFs (`pypdf`) and handle image payloads for Gemini.
- [x] T014 Update `backend/app/api/routes.py` to accept multipart files (images, PDFs, audio) alongside text.
- [x] T015 Implement `frontend/src/components/VoiceRecorder.tsx` with Web Speech API live transcription and fallback audio recorder.
- [x] T016 Add drag-and-drop file upload for photos and PDFs in `frontend/src/components/InputPanel.tsx` with preview and badge chips.
- [x] T017 Implement `EntitiesCard.tsx` in frontend to display categorized entities (people, medications, symptoms, locations, times).

---

## Phase 4: Grounded Verification & Facility Navigation
**Goal**: Ground factual claims with search citations and provide nearest facility navigation links.

- [x] T018 Implement grounding citation parser in `backend/app/services/grounding_service.py` to populate `VerificationItem` with Google Search sources and status.
- [x] T019 Implement Google Maps facility search URL generator based on extracted locations and urgency in `grounding_service.py`.
- [x] T020 Build `frontend/src/components/VerificationPanel.tsx` to display verified claims, status badges, and external citation source links.
- [x] T021 Build `frontend/src/components/ClarifyingQuestions.tsx` to render targeted follow-up questions when information is missing.

---

## Phase 5: Multilingual Support, Offline Emergency Card & Demo Scenarios
**Goal**: Inclusivity (Hindi/Marathi/English), offline safety, and 1-click evaluation scenarios.

- [x] T022 Create translation dictionary in `frontend/src/i18n/translations.ts` for English, Hindi (हिंदी), and Marathi (मराठी).
- [x] T023 Add language selector in `Header.tsx` and pass `language` parameter to `/api/analyze` for model localization.
- [x] T024 Build `frontend/src/components/OfflineEmergencyCard.tsx` with static emergency numbers (112, 108, 102 for India) and tel: links.
- [x] T025 Create `frontend/src/services/demoData.ts` and `backend/app/services/demo_data.py` with the 3 canonical preloaded scenarios:
  1. Caregiver messy medical stack (discharge summary + medications)
  2. Disaster hazard scene (flood photo + advisory)
  3. Road accident emergency (panicked voice note)
- [x] T026 Build `frontend/src/components/DemoScenarios.tsx` selector allowing instant 1-click loading and analysis.
- [x] T027 Add "Share / Copy Summary" and print-ready summary exporter in `App.tsx`.

---

## Phase 6: Testing, Containerization & Deployment
**Goal**: Verify reliability, create Docker setup, and document instructions.

- [x] T028 Write backend tests in `backend/tests/`:
  - `test_schemas.py`
  - `test_rules_engine.py`
  - `test_api.py`
- [x] T029 Create `backend/Dockerfile` and root `Dockerfile` / `docker-compose.yml` for unified single-command deployment.
- [x] T030 Create root `.env.example` documenting `GEMINI_API_KEY` and optional port configs.
- [x] T031 Write comprehensive `README.md` with architecture diagram, quickstart setup, API documentation, and test execution commands.
- [x] T032 Run backend test suite and end-to-end integration verification.
