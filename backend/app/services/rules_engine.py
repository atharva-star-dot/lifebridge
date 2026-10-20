import re
from typing import Tuple, List
from app.schemas import SeverityLevel, ActionItem, LifeBridgeAnalysis

# Red-flag keywords mapped to clinical/incident emergency categories
RED_FLAG_PATTERNS = {
    "cardiac": [
        r"\bchest\s+pain\b", r"\bheart\s+attack\b", r"\bcardiac\s+arrest\b",
        r"\bunresponsive\b", r"\bcollapsed\b", r"\bno\s+pulse\b",
        r"\bclutching\s+chest\b", r"\bfacial\s+droop\b", r"\bslurred\s+speech\b"
    ],
    "respiratory": [
        r"\bchoking\b", r"\bcan'?t\s+breathe\b", r"\bstopped\s+breathing\b",
        r"\bsuffocating\b", r"\bsevere\s+asthma\b", r"\bcyanosis\b", r"\bblue\s+lips\b"
    ],
    "trauma_bleeding": [
        r"\bsevere\s+bleeding\b", r"\barterial\s+bleed\b", r"\bamputation\b",
        r"\bunconscious\b", r"\bhead\s+injury\b", r"\bdeep\s+stab\b",
        r"\bgunshot\b", r"\bcracked\s+helmet\b", r"\bcompound\s+fracture\b"
    ],
    "disaster_hazard": [
        r"\btrapped\s+in\s+flood\b", r"\bflash\s+flood\b", r"\bbuilding\s+collapse\b",
        r"\bfire\s+spreading\b", r"\bgas\s+leak\b", r"\belectrical\s+sparking\s+in\s+water\b",
        r"\btransformer\s+sparking\b"
    ],
    "poison_overdose": [
        r"\bswallowed\s+poison\b", r"\bdrug\s+overdose\b", r"\bsnake\s+bite\b",
        r"\bpesticide\s+ingestion\b", r"\bconsumed\s+acid\b"
    ]
}

def evaluate_red_flags(text: str) -> Tuple[bool, List[str]]:
    """
    Evaluates text for deterministic red flags.
    Returns (is_red_flag, triggered_categories).
    """
    if not text:
        return False, []

    triggered = []
    text_lower = text.lower()

    for category, patterns in RED_FLAG_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                triggered.append(category)
                break

    return len(triggered) > 0, triggered

def apply_safety_escalation(analysis: LifeBridgeAnalysis, input_text: str) -> LifeBridgeAnalysis:
    """
    Applies non-negotiable deterministic heuristic escalation.
    Overrides severity and ensures instant emergency calling actions are present.
    """
    is_red_flag, categories = evaluate_red_flags(input_text)
    
    if not is_red_flag:
        return analysis

    # Force Critical severity
    analysis.severity = SeverityLevel.CRITICAL
    analysis.needs_human_confirmation = True
    analysis.urgency = "Immediate (< 5 mins)"

    # Check if emergency call action is already the top action
    has_call_action = any(
        action.call_number in ["112", "108", "102"] for action in analysis.actions
    )

    if not has_call_action:
        emergency_action = ActionItem(
            id="act-emergency-0",
            action="Call Emergency Services Immediately (Dial 108 / 112)",
            reason=f"Life-threatening emergency indicators detected ({', '.join(categories)}). Immediate paramedic or rescue intervention required.",
            deadline="Immediate (< 1 min)",
            call_number="108",
            map_query="emergency trauma center near me",
            is_high_risk=True
        )
        analysis.actions.insert(0, emergency_action)

    # Ensure all emergency actions have high_risk marked
    for action in analysis.actions:
        if action.call_number in ["108", "112"]:
            action.is_high_risk = True

    return analysis
