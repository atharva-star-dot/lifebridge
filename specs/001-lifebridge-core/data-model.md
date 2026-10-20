# Data Model: LifeBridge Core

## Overview
This document defines the domain models and Pydantic schema contracts used across the LifeBridge backend and TypeScript frontend interfaces.

---

## 1. Domain Entities & Schemas

### `SeverityLevel` (Enum)
- `CRITICAL`: Life-threatening emergency requiring immediate intervention.
- `URGENT`: Serious situation requiring rapid action within hours.
- `ROUTINE`: General information, medication review, or non-acute guidance.

### `VerificationStatus` (Enum)
- `VERIFIED`: Factual claim confirmed by trusted grounding source (Google Search, medical reference, official alert).
- `UNVERIFIED`: Claim cannot be independently verified from available context.
- `CONFLICTING`: Grounded sources contradict the input premise or claim.

### `ExtractedEntities` (Model)
Key extracted named entities categorized for quick caregiver and responder reference:
```python
class ExtractedEntities(BaseModel):
    people: list[str] = Field(default_factory=list, description="Names of patients, victims, or contacts")
    medications: list[str] = Field(default_factory=list, description="Drugs, prescriptions, or dosages identified")
    symptoms: list[str] = Field(default_factory=list, description="Reported pain, symptoms, or physical states")
    locations: list[str] = Field(default_factory=list, description="Addresses, landmarks, or geographic coordinates")
    times: list[str] = Field(default_factory=list, description="Timestamps, incident times, or dosage frequencies")
```

### `ActionItem` (Model)
Prioritized, step-by-step action card:
```python
class ActionItem(BaseModel):
    id: str = Field(description="Unique action ID e.g. act-1")
    action: str = Field(description="Clear, directive title of the action")
    reason: str = Field(description="Clinical or situational rationale for why this action is required")
    deadline: str = Field(description="Timeframe or urgency limit e.g. 'Immediate (<5m)', 'Within 2 hours'")
    call_number: Optional[str] = Field(None, description="Direct dial phone number e.g. '108', '112'")
    map_query: Optional[str] = Field(None, description="Search query or direct URL for nearest facility")
    is_high_risk: bool = Field(default=False, description="Flag indicating if action has medical or physical risk")
```

### `VerificationItem` (Model)
Factual statement verification record:
```python
class VerificationItem(BaseModel):
    claim: str = Field(description="Specific factual claim evaluated")
    status: VerificationStatus = Field(description="Verified, unverified, or conflicting")
    source_title: Optional[str] = Field(None, description="Name of source authority or publication")
    source_url: Optional[str] = Field(None, description="Clickable citation URL")
    notes: Optional[str] = Field(None, description="Brief explanation of findings")
```

### `LifeBridgeAnalysis` (Model - Root Response Contract)
The complete validated response contract returned by `/api/analyze`:
```python
class LifeBridgeAnalysis(BaseModel):
    intent: str = Field(description="Single-line summary of what the user needs")
    severity: SeverityLevel = Field(description="Critical, Urgent, or Routine")
    urgency: str = Field(description="Qualitative urgency e.g. 'Immediate', 'High', 'Low'")
    extracted_entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    actions: list[ActionItem] = Field(default_factory=list, description="Ordered step-by-step actions")
    verification: list[VerificationItem] = Field(default_factory=list, description="Factual verification claims")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Model self-assessed confidence")
    needs_human_confirmation: bool = Field(default=True, description="Always true for medical/emergency triage")
    clarifying_questions: list[str] = Field(default_factory=list, description="Questions when input is ambiguous")
    language: str = Field(default="en", description="Output language ISO code ('en', 'hi', 'mr')")
    disclaimer: str = Field(
        default="LifeBridge provides AI-assisted situational guidance and is not a medical diagnosis or emergency dispatch service. Always verify with professionals and dial 112/108 in emergencies.",
        description="Mandatory legal and medical disclaimer"
    )
```

---

## 2. Red-Flag Heuristic Schema

```python
class RedFlagRule(BaseModel):
    keywords: list[str]
    category: str  # "cardiac", "respiratory", "trauma", "disaster"
    escalate_to: SeverityLevel = SeverityLevel.CRITICAL
    recommended_emergency_number: str = "108"
```
