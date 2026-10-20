# Feature Specification: LifeBridge Core - Universal Intent to Action Engine

**Feature Branch**: `001-lifebridge-core`
**Created**: 2026-10-20
**Status**: Draft (Clarifications In Progress)
**Input**: Universal bridge between human intent and complex systems. Unstructured, messy, real-world input converted into structured, verified, prioritized, life-saving actions.

## Overview
LifeBridge accepts unstructured real-world data (audio recording/live microphone, photographic evidence, clinical PDFs/unformatted text, and hazard/news descriptions) through a single unified interface. It processes this input using multimodal AI analysis, deterministic heuristic guards, and real-time grounded verification to deliver structured, prioritized, and life-saving action cards.

---

## User Scenarios & Testing

### User Story 1 - Emergency Triage & Life-Saving Protocol (Priority: P1)
As an individual encountering an active medical or physical emergency, I want to record voice audio or type rapid, chaotic descriptions of the incident, so that I immediately receive an objective severity rating, step-by-step first-response instructions, emergency dispatch speed dials, and navigation to the closest relevant facility.

**Why this priority**: Immediate threat to life requires deterministic, low-latency triage and actionable instructions with no ambiguity.

**Independent Test**: Provide an emergency audio clip or panicked text ("man collapsed, clutching chest, sweating, irregular breathing in Andheri West"). Verify response yields `Critical` severity, instructions to call 108/112, step-by-step CPR/aspirin guidance, nearest hospital link with Google Maps coordinates, and professional disclaimer.

**Acceptance Scenarios**:
1. **Given** input with critical symptoms (e.g., severe bleeding, unresponsive individual), **When** processed by LifeBridge, **Then** the severity is flagged as `Critical`, deterministic red-flag rules override lower confidence, emergency numbers (112, 108) are rendered as instant-call buttons, and immediate step-by-step actions are shown.
2. **Given** ambiguous emergency input, **When** processed, **Then** the system outputs safest stabilization actions, displays emergency numbers, and provides `clarifying_questions` to narrow down the situation without delaying initial guidance.

---

### User Story 2 - Messy Medical History Summarization & Drug Interaction Guard (Priority: P2)
As a family caregiver, I want to upload a messy collection of discharge summaries, lab reports (PDF/text), or photos of medicine boxes/prescriptions, so that I receive a structured, 1-page summary covering active conditions, medication schedule, drug interaction red flags, allergies, and specific questions to ask the attending doctor.

**Why this priority**: Caregivers are overwhelmed by complex clinical paperwork and need clarity on drug safety and medical consultation prep without diagnostic overreach.

**Independent Test**: Upload a sample discharge summary PDF and prescription image with overlapping medications (e.g., Warfarin + Aspirin). Verify output extracts entities (conditions, drugs, dosage), identifies drug-interaction red flags with verification citations, and formulates doctor questions.

**Acceptance Scenarios**:
1. **Given** multiple prescription images or lab summary text, **When** analyzed, **Then** all entities (medications, conditions, dosages, allergies) are extracted and grouped into structured summary cards.
2. **Given** medication combinations with known adverse interactions, **When** analyzed, **Then** an unmissable warning card is presented with a "verify with a doctor/pharmacist" notice and grounding sources.

---

### User Story 3 - Environmental Hazard & Weather/Disaster Assessment (Priority: P3)
As a resident facing adverse environmental conditions (floods, building fires, structural hazards, or severe weather alerts), I want to paste news links, disaster alerts, or hazard photos, so that I get an immediate risk rating, specific do's and don'ts, evacuation routes or shelter recommendations, and verified official advisories.

**Why this priority**: Residents during disasters experience acute panic and disinformation; verified grounding provides clear, factual survival actions.

**Independent Test**: Submit a flood photo and local weather alert for Mumbai. Verify response flags risk level, lists clear actions (move to higher ground, avoid wading in floodwater), lists actions to avoid, and displays grounding verification citations.

**Acceptance Scenarios**:
1. **Given** a disaster news link or hazard image, **When** analyzed, **Then** the system extracts location, danger type, and temporal urgency, producing ordered actions and what to avoid.
2. **Given** contradictory hazard rumors, **When** checked, **Then** verification status marks unverified claims as `unverified` with links to official meteorological/civic sources.

---

### User Story 4 - Grounded Factual Transparency & Sources Verification (Priority: P4)
As any user reviewing LifeBridge outputs, I want to see exactly which claims were verified against live knowledge sources (Google Search, Maps, or medical guidelines), which are unverified, and what level of confidence the system has, so that I never act on hallucinations.

**Why this priority**: Essential to adherence to Constitutional Principle III (Verification Over Generation) and establishing user trust.

**Independent Test**: Examine the verification panel on any generated output. Verify each factual statement has a distinct badge (`verified`, `unverified`, `conflicting`) with source URL and attribution.

**Acceptance Scenarios**:
1. **Given** generated output with factual claims, **When** viewed on UI, **Then** each claim itemizes a status badge and clickable external source citation.
2. **Given** claims that cannot be grounded via Google Search/Maps, **When** returned, **Then** status is marked `unverified` and user confirmation flag is set to `true`.

---

### User Story 5 - Instant Offline Emergency Card & Demo Mode (Priority: P5)
As a user experiencing network failure or exploring the app for the first time, I want access to a permanent offline-safe emergency directory and 1-click preloaded demo scenarios, so that I can get immediate aid without internet or evaluate the app's capabilities immediately.

**Why this priority**: Ensures zero-latency reliability during network blackouts and frictionless demonstration.

**Independent Test**: Toggle offline mode / test flight mode; verify emergency helpline buttons (112, 108, 102) remain interactive. Click demo buttons (Medical Stack, Flood Photo, Road Accident Voice Note) and verify instantaneous preloaded analysis rendering.

---

## Edge Cases

- **Complete Network Disconnection**: If offline, the app displays the static Emergency Directory Card with tel: links and prompts the user to dial local services directly.
- **Audio Cluttered with Background Noise/Panic**: Multimodal model transcription fallback to browser Web Speech API transcription, paired with clarifying questions if clarity score is low.
- **Foreign / Regional Dialect Input**: Ingest Hindi, Marathi, Hinglish, or English. System normalizes intent while offering output response translated into the user's selected language.
- **Unintelligible / Corrupt Media (blurry image, corrupted PDF)**: Return graceful degradation card with specific guidance on re-capturing or clarifying the input.
- **Deterministic Red-Flag Triggers**: Explicit dictionary of life-threat keywords (unresponsive, stroke, anaphylaxis, severe burn, flood trapped) triggers unconditional `Critical` severity escalation even if AI classification is ambiguous.

---

## Requirements

### Functional Requirements
- **FR-001**: Single unified input screen accepting text, voice recording (audio file or live microphone capture), images (JPEG, PNG, WebP), and documents (PDF).
- **FR-002**: Backend endpoint `/api/analyze` handling multipart payload (text, media files, language preference, user location coordinates if permitted).
- **FR-003**: Strict JSON schema enforcement on AI responses validating via Pydantic model:
  - `intent`: Single line summary of user need
  - `severity`: `Critical` | `Urgent` | `Routine`
  - `urgency`: Qualitative timeframe (e.g., "Immediate (< 5 mins)", "Within 1 hour", "Next 24 hours")
  - `extracted_entities`: Grouped items (people, medications, symptoms, locations, times)
  - `actions[]`: Ordered list with `action`, `reason`, `deadline`, and optional `call_number` or `map_query`
  - `verification[]`: List of claims with `claim`, `status` (`verified` | `unverified` | `conflicting`), and `source_url`
  - `confidence_score`: Float between 0.0 and 1.0
  - `needs_human_confirmation`: Boolean flag
  - `clarifying_questions[]`: Array of follow-up questions when critical variables are missing
- **FR-004**: Heuristic safety override layer executing prior to client response, escalating severity to `Critical` if life-threatening emergency keywords are present.
- **FR-005**: Grounding integration with Google Search / Places to verify factual claims and generate accurate facility navigation links.
- **FR-006**: Prominent, persistent non-diagnostic medical/legal disclaimer visible on all results.
- **FR-007**: Multilingual UI support: English, Hindi (हिंदी), and Marathi (मराठी) for inputs and UI labels.
- **FR-008**: Export & Share capability: One-click "Copy Summary to Clipboard" and printable/PDF view.
- **FR-009**: Preloaded demo mode featuring 3 canonical scenarios:
  1. Caregiver messy medical stack (discharge summary + medications)
  2. Disaster hazard scene (flood photo + advisory)
  3. Road accident emergency (panicked voice note)
- **FR-010**: Zero storage persistence of user PII/PHI; temporary files cleaned immediately upon request completion.

### Key Entities
- **AnalyzeRequest**: Modality files, text prompt, optional client latitude/longitude, output language code.
- **ActionItem**: Action description, clinical/operational rationale, target deadline, contact phone/dial action, geographic query/navigation link.
- **VerificationItem**: Factual claim string, verification status enum, source citation title and URL.
- **LifeBridgeAnalysis**: Top-level validated response contract containing intent, severity, entities, actions, verifications, confidence, and clarifying questions.

---

## Success Criteria

### Measurable Outcomes
- **SC-001**: End-to-end response latency for text-only analysis under 3.5 seconds; multimodal input (audio/image/PDF) under 7.0 seconds.
- **SC-002**: 100% of responses conform to the Pydantic schema without raw JSON syntax errors reaching the client.
- **SC-003**: 100% of high-severity emergency scenarios surface direct emergency telephone links (112 / 108 / 102).
- **SC-004**: Zero user inputs, uploaded media, or PII stored in persistent databases or non-ephemeral storage.
- **SC-005**: Mobile viewport usability score passing WCAG AA touch target (min 48x48px) and contrast ratios.

---

## Assumptions & Sensible Defaults
- **Language Default**: Defaults to English, with dynamic toggle for Hindi and Marathi.
- **Emergency Helpline Default**: Primary emergency numbers default to India's national emergency services (112 universal, 108 medical/ambulance, 102 maternity/child), with auto-adaptation if geographic coordinates specify another country.
- **Maps Grounding**: Facility navigation links resolve via Google Maps search queries (`https://www.google.com/maps/search/?api=1&query=...`).
- **Grounding Model**: Gemini 2.5 Flash / Gemini 1.5 Flash using Google Search tool grounding in the Gemini API.
- **Offline Card**: Bundled statically in frontend assets, guaranteeing availability during complete disconnection.

---

## Clarifications & Ratified Decisions

- **Audio Processing Strategy**: Live speech is transcribed directly in the browser via the Web Speech API for zero-latency visual feedback and lightweight network payload; recorded audio files can also be accepted and processed.
- **Grounding & Verification Architecture**: Dual-stage verification:
  1. Google Search Tool grounding via the Gemini API to verify medical/hazard/factual claims and retrieve source URLs.
  2. Structured Google Maps / Places query link generation for verified physical facility navigation.
- **Multilingual Delivery**: Gemini is instructed via system prompt and schema to generate the output JSON fields (intent, actions, rationales, questions) directly in the requested language (`en`, `hi`, `mr`).
- **Red-Flag Escalation Protocol**: Deterministic heuristic triggers immediately force `severity: Critical`, triggering a prominent red-alert banner, pinned 112/108/102 one-tap calling buttons, and prioritizing urgent first-aid actions ahead of informational cards.
- **Demo Mode Implementation**: Hybrid architecture providing pre-baked instant responses for instant offline evaluation and zero-latency presentations, paired with an "Analyze Live with Gemini" switch to execute live multimodal API analysis.

