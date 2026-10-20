# Test Plan: LifeBridge Core

## Overview
This test plan validates LifeBridge's core safety, performance, multimodal extraction, and UI contract compliance across automated and interactive scenarios.

---

## 1. Automated Test Suite (Pytest & Frontend Vitest)

### Backend Tests (`backend/tests/`)
1. **`test_schemas.py`**:
   - Validate Pydantic schema parsing on valid and invalid payloads.
   - Enforce enum boundaries (`SeverityLevel`, `VerificationStatus`).
   - Confirm defaults (`needs_human_confirmation=True`, `disclaimer` present).
2. **`test_rules_engine.py`**:
   - Check deterministic red-flag keywords trigger `SeverityLevel.CRITICAL`.
   - Ensure emergency helpline numbers (108/112) are injected for cardiac/trauma alerts.
   - Verify non-critical texts are not falsely escalated.
3. **`test_api.py`**:
   - Test `GET /api/health` returns status 200.
   - Test `POST /api/analyze` with plain text input.
   - Test `POST /api/analyze` with missing input returns 400 error.
   - Test `GET /api/demos` returns 3 preloaded canonical scenarios.

---

## 2. Canonical Demo Scenarios

### Scenario 1: Messy Medical History Stack
- **Input Modality**: PDF Discharge summary text + prescription image
- **Input Text**: "Patient 68yo male, discharged after stenting. Currently prescribed Aspirin 75mg daily and Clopidogrel 75mg. Family also gave him Ibuprofen 400mg for back pain. Patient complaining of burning stomach pain and dizziness."
- **Expected Output**:
  - `intent`: "Manage post-stent medication safety and acute gastrointestinal symptoms"
  - `severity`: `Urgent`
  - `extracted_entities`:
    - Medications: Aspirin 75mg, Clopidogrel 75mg, Ibuprofen 400mg
    - Symptoms: Burning stomach pain, dizziness
    - Conditions: Post-cardiac stenting
  - `actions`:
    - Action 1: Discontinue Ibuprofen immediately (High risk NSAID + antiplatelet bleeding interaction)
    - Action 2: Contact cardiologist / attending physician
    - Action 3: Seek emergency care if vomiting blood or black stools occur
  - `verification`: Grounded drug interaction citation between NSAIDs and dual antiplatelet therapy.

### Scenario 2: Disaster Hazard Scene (Mumbai Urban Flood)
- **Input Modality**: Image of flooded street + advisory text
- **Input Text**: "Mithi River overflowing, water level reaching 4 feet at Kurla West. Ground floor apartments flooded, electrical transformers sparking in water."
- **Expected Output**:
  - `intent`: "Immediate flood evacuation and electrical hazard precautions in Kurla West"
  - `severity`: `Critical`
  - `actions`:
    - Action 1: Move to higher floors immediately; do not wade in water near electrical transformers
    - Action 2: Dial BMC Disaster Management (1916) or National Emergency (112)
    - Action 3: Shut down main electrical breaker if safe to reach
  - `verification`: Official BMC/NDRF flood advisory protocols and helpline verification.

### Scenario 3: Panicked Road Accident Voice Note
- **Input Modality**: Audio voice note transcription
- **Input Text**: "Emergency! Two-wheeler slipped on Western Express Highway near Goregaon flyover. Rider is unconscious on the road, bleeding from head, helmet cracked. Traffic is swerving around him!"
- **Expected Output**:
  - `intent`: "Emergency response for unconscious trauma victim on highway"
  - `severity`: `Critical`
  - `actions`:
    - Action 1: Dial 108 (Ambulance) and 112 (Police) immediately
    - Action 2: Secure the scene (turn on vehicle hazard lights to prevent secondary collisions)
    - Action 3: Do NOT move the victim's neck or remove damaged helmet unless airway is obstructed
  - `extracted_entities`:
    - Locations: Western Express Highway near Goregaon flyover
    - Symptoms: Unconscious, bleeding from head
  - Nearest Facility: Google Maps query for trauma centers near Goregaon West.
