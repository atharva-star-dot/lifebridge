import pytest
from pydantic import ValidationError
from app.schemas import (
    LifeBridgeAnalysis, SeverityLevel, VerificationStatus,
    ExtractedEntities, ActionItem, VerificationItem
)

def test_lifebridge_analysis_valid_schema():
    analysis = LifeBridgeAnalysis(
        intent="Emergency triage for cardiac event",
        severity=SeverityLevel.CRITICAL,
        urgency="Immediate (< 5 mins)",
        extracted_entities=ExtractedEntities(
            people=["John Doe"],
            medications=["Aspirin"],
            symptoms=["Chest pain"],
            locations=["Mumbai"],
            times=["Now"]
        ),
        actions=[
            ActionItem(
                id="act-1",
                action="Call 108",
                reason="Chest pain requires immediate medical transport",
                deadline="Immediate",
                call_number="108",
                map_query="cardiac hospital near me",
                is_high_risk=True
            )
        ],
        verification=[
            VerificationItem(
                claim="Aspirin 300mg is administered during acute coronary syndrome",
                status=VerificationStatus.VERIFIED,
                source_title="AHA Guidelines",
                source_url="https://heart.org"
            )
        ],
        confidence_score=0.95,
        needs_human_confirmation=True,
        clarifying_questions=["Does the patient have an aspirin allergy?"]
    )
    assert analysis.severity == SeverityLevel.CRITICAL
    assert len(analysis.actions) == 1
    assert analysis.actions[0].call_number == "108"
    assert "AHA Guidelines" in analysis.verification[0].source_title
    assert analysis.disclaimer != ""

def test_lifebridge_analysis_invalid_severity():
    with pytest.raises(ValidationError):
        LifeBridgeAnalysis(
            intent="Test",
            severity="NotAValidSeverity",
            urgency="Now",
            confidence_score=0.5
        )
