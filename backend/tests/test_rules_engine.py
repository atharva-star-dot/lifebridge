from app.schemas import LifeBridgeAnalysis, SeverityLevel, ExtractedEntities, ActionItem
from app.services.rules_engine import evaluate_red_flags, apply_safety_escalation

def test_evaluate_red_flags_cardiac():
    is_red, categories = evaluate_red_flags("Patient collapsed with severe chest pain and slurred speech")
    assert is_red is True
    assert "cardiac" in categories

def test_evaluate_red_flags_trauma():
    is_red, categories = evaluate_red_flags("Motorcyclist unconscious with arterial bleed and head injury")
    assert is_red is True
    assert "trauma_bleeding" in categories

def test_evaluate_red_flags_routine():
    is_red, categories = evaluate_red_flags("Mild headache and taking vitamins in the morning")
    assert is_red is False
    assert categories == []

def test_apply_safety_escalation_forces_critical():
    initial_analysis = LifeBridgeAnalysis(
        intent="Review symptoms",
        severity=SeverityLevel.ROUTINE,
        urgency="Routine",
        confidence_score=0.5,
        actions=[]
    )
    escalated = apply_safety_escalation(initial_analysis, "Patient is unresponsive with sudden chest pain")
    assert escalated.severity == SeverityLevel.CRITICAL
    assert escalated.needs_human_confirmation is True
    assert any(a.call_number in ["108", "112"] for a in escalated.actions)
