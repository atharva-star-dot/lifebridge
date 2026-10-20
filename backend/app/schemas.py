from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class SeverityLevel(str, Enum):
    CRITICAL = "Critical"
    URGENT = "Urgent"
    ROUTINE = "Routine"

class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    CONFLICTING = "conflicting"

class ExtractedEntities(BaseModel):
    people: list[str] = Field(default_factory=list, description="Names of individuals, patients, or emergency contacts")
    medications: list[str] = Field(default_factory=list, description="Prescribed or mentioned medications and dosages")
    symptoms: list[str] = Field(default_factory=list, description="Reported pain, injuries, or physiological symptoms")
    locations: list[str] = Field(default_factory=list, description="Addresses, landmarks, or geographic coordinates")
    times: list[str] = Field(default_factory=list, description="Timestamps, durations, or scheduled medication intervals")

class ActionItem(BaseModel):
    id: str = Field(description="Unique action identifier e.g. act-1")
    action: str = Field(description="Clear, directive title of the action to take")
    reason: str = Field(description="Clinical, physical, or operational rationale")
    deadline: str = Field(description="Target timeframe or urgency threshold e.g. 'Immediate (<5m)'")
    call_number: Optional[str] = Field(None, description="Direct telephone dial number e.g. '108', '112'")
    map_query: Optional[str] = Field(None, description="Navigation query or direct URL for nearest facility")
    is_high_risk: bool = Field(default=False, description="Flag indicating if action has medical or physical risks")

class VerificationItem(BaseModel):
    claim: str = Field(description="Factual claim or statement evaluated")
    status: VerificationStatus = Field(description="Status: verified, unverified, or conflicting")
    source_title: Optional[str] = Field(None, description="Title of grounding authority or publication")
    source_url: Optional[str] = Field(None, description="Clickable citation URL")
    notes: Optional[str] = Field(None, description="Brief explanation or grounding excerpt")

class LifeBridgeAnalysis(BaseModel):
    intent: str = Field(description="One-line summary of what the user needs")
    severity: SeverityLevel = Field(description="Assessed severity level: Critical, Urgent, Routine")
    urgency: str = Field(description="Timeframe urgency indicator e.g. 'Immediate (< 5 mins)'")
    extracted_entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    actions: list[ActionItem] = Field(default_factory=list, description="Prioritized sequence of actions")
    verification: list[VerificationItem] = Field(default_factory=list, description="Factual verification claims with citations")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Self-assessed confidence level")
    needs_human_confirmation: bool = Field(default=True, description="Always true for medical or emergency triage")
    clarifying_questions: list[str] = Field(default_factory=list, description="Targeted follow-up questions when variables are missing")
    language: str = Field(default="en", description="Output language code: en, hi, mr")
    disclaimer: str = Field(
        default="LifeBridge provides AI-assisted situational triage and is not a medical diagnosis or emergency dispatch service. Always verify with professionals and dial 112/108 in emergencies.",
        description="Mandatory legal and medical disclaimer"
    )

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    gemini_configured: bool = False
    model: str = "gemini-2.5-flash"
