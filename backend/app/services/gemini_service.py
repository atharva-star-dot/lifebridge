import json
import logging
from typing import Optional
from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, DEFAULT_MODEL
from app.schemas import (
    LifeBridgeAnalysis, SeverityLevel, VerificationStatus,
    ExtractedEntities, ActionItem, VerificationItem
)
from app.prompts import SYSTEM_PROMPT, build_user_prompt
from app.services.rules_engine import apply_safety_escalation
from app.services.grounding_service import enrich_actions_with_navigation, process_grounding_citations
from app.services.demo_data import DEMO_SCENARIO_1_MEDICAL, DEMO_SCENARIO_2_FLOOD, DEMO_SCENARIO_3_ACCIDENT

logger = logging.getLogger(__name__)

def get_gemini_client() -> Optional[genai.Client]:
    if not GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Error initializing Gemini client: {e}")
        return None

def analyze_input(
    text: str,
    file_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None,
    language: str = "en",
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None
) -> LifeBridgeAnalysis:
    """
    Main analysis orchestrator:
    1. Prepares prompt and multimodal parts.
    2. Calls Gemini 2.5 Flash with structured output schema.
    3. Merges Google Search grounding citations.
    4. Applies deterministic heuristic safety escalation (rules engine).
    5. Enriches actions with verified Google Maps navigation URLs.
    """
    client = get_gemini_client()

    if not client:
        logger.warning("No GEMINI_API_KEY detected. Utilizing demo fallback analyzer.")
        return _fallback_local_analysis(text, language, user_lat, user_lon)

    user_prompt = build_user_prompt(text=text, language=language)
    contents = []

    # Attach file if present
    if file_bytes and mime_type:
        try:
            part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            contents.append(part)
        except Exception as e:
            logger.error(f"Failed to attach multimodal bytes: {e}")

    contents.append(user_prompt)

    try:
        # Attempt generation with response_schema
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=LifeBridgeAnalysis,
            temperature=0.2
        )
        
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=config
        )

        raw_json = response.text
        parsed_dict = json.loads(raw_json)
        analysis = LifeBridgeAnalysis.model_validate(parsed_dict)

        # Process grounding metadata if returned
        if hasattr(response, "candidates") and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, "grounding_metadata") and candidate.grounding_metadata:
                analysis.verification = process_grounding_citations(
                    analysis.verification, 
                    candidate.grounding_metadata.model_dump() if hasattr(candidate.grounding_metadata, "model_dump") else None
                )

    except Exception as e:
        logger.error(f"Gemini API invocation error: {e}. Executing safe fallback.")
        analysis = _fallback_local_analysis(text, language, user_lat, user_lon)

    # Deterministic heuristic red-flag escalation
    analysis = apply_safety_escalation(analysis, text)

    # Google Maps facility link enrichment
    locations = analysis.extracted_entities.locations
    analysis.actions = enrich_actions_with_navigation(analysis.actions, locations, user_lat, user_lon)

    return analysis

def _fallback_local_analysis(
    text: str, 
    language: str = "en",
    user_lat: Optional[float] = None, 
    user_lon: Optional[float] = None
) -> LifeBridgeAnalysis:
    """
    Intelligent zero-crash fallback analyzer when running without API key or during network disconnects.
    Recognizes core keywords or matches the 3 canonical demo scenarios.
    """
    text_lower = text.lower() if text else ""

    if "kurla" in text_lower or "flood" in text_lower or "transformer" in text_lower or "mithi" in text_lower:
        base = DEMO_SCENARIO_2_FLOOD.model_copy(deep=True)
    elif "accident" in text_lower or "flyover" in text_lower or "helmet" in text_lower or "highway" in text_lower or "unconscious" in text_lower:
        base = DEMO_SCENARIO_3_ACCIDENT.model_copy(deep=True)
    elif "stent" in text_lower or "aspirin" in text_lower or "ibuprofen" in text_lower or "medication" in text_lower:
        base = DEMO_SCENARIO_1_MEDICAL.model_copy(deep=True)
    else:
        # Generic structured triage
        base = LifeBridgeAnalysis(
            intent=f"Analyze and triage: {text[:60]}..." if len(text) > 60 else text or "Emergency assistance",
            severity=SeverityLevel.URGENT,
            urgency="Within 1 to 2 hours",
            extracted_entities=ExtractedEntities(
                people=[],
                medications=[],
                symptoms=["Reported distress / emergency event"],
                locations=[],
                times=["Current moment"]
            ),
            actions=[
                ActionItem(
                    id="act-gen-1",
                    action="Contact Local Emergency Services (112)",
                    reason="Ensure responder dispatch if anyone is in physical or medical danger.",
                    deadline="Immediate (< 5 mins)",
                    call_number="112",
                    map_query="emergency facility near me",
                    is_high_risk=True
                ),
                ActionItem(
                    id="act-gen-2",
                    action="Assess surroundings and move to safety",
                    reason="Eliminate immediate hazards before administering aid.",
                    deadline="Within 10 mins",
                    call_number=None,
                    map_query=None,
                    is_high_risk=False
                )
            ],
            verification=[
                VerificationItem(
                    claim="India National Universal Emergency helpline is 112.",
                    status=VerificationStatus.VERIFIED,
                    source_title="National Emergency Response System (NERS)",
                    source_url="https://112.gov.in",
                    notes="Universal single emergency number across India."
                )
            ],
            confidence_score=0.88,
            needs_human_confirmation=True,
            clarifying_questions=[
                "What is your exact location or nearest landmark?",
                "Is anyone severely injured, bleeding, or unconscious?"
            ],
            language=language
        )

    base.language = language
    base = apply_safety_escalation(base, text)
    base.actions = enrich_actions_with_navigation(base.actions, base.extracted_entities.locations, user_lat, user_lon)
    return base
