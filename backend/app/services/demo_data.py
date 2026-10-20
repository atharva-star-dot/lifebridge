from app.schemas import (
    LifeBridgeAnalysis, SeverityLevel, VerificationStatus, 
    ExtractedEntities, ActionItem, VerificationItem
)

DEMO_SCENARIO_1_MEDICAL = LifeBridgeAnalysis(
    intent="Manage post-stent medication safety, detect adverse drug interactions, and address acute burning stomach pain.",
    severity=SeverityLevel.URGENT,
    urgency="Within 1 to 2 hours",
    extracted_entities=ExtractedEntities(
        people=["68-year-old male patient", "Family caregiver"],
        medications=["Aspirin 75mg daily", "Clopidogrel 75mg daily", "Ibuprofen 400mg"],
        symptoms=["Burning epigastric stomach pain", "Dizziness", "Post-cardiac stenting"],
        locations=["Home / Cardiology Clinic"],
        times=["Daily morning doses", "Acute pain started today"]
    ),
    actions=[
        ActionItem(
            id="act-med-1",
            action="Discontinue Ibuprofen 400mg immediately",
            reason="Ibuprofen is an NSAID that drastically increases upper GI bleeding and ulcer risk when combined with dual antiplatelet therapy (Aspirin + Clopidogrel).",
            deadline="Immediate (< 15 mins)",
            call_number=None,
            map_query=None,
            is_high_risk=True
        ),
        ActionItem(
            id="act-med-2",
            action="Contact Cardiologist / Attending Physician",
            reason="Report acute burning stomach pain and request safe analgesic alternatives (e.g., Paracetamol) and gastroprotection (e.g., PPI).",
            deadline="Within 2 hours",
            call_number=None,
            map_query="cardiology clinic near me",
            is_high_risk=False
        ),
        ActionItem(
            id="act-med-3",
            action="Watch for Red-Flag Gastrointestinal Bleeding",
            reason="If vomiting coffee-ground emesis, black tarry stools, or severe fainting occur, proceed to emergency immediately.",
            deadline="Continuous monitoring",
            call_number="108",
            map_query="emergency hospital near me",
            is_high_risk=True
        )
    ],
    verification=[
        VerificationItem(
            claim="Concurrent use of NSAIDs (Ibuprofen) with Dual Antiplatelet Therapy (Aspirin + Clopidogrel) increases major bleeding risk 2-3 fold.",
            status=VerificationStatus.VERIFIED,
            source_title="American College of Cardiology (ACC) / AHA Guidelines",
            source_url="https://www.acc.org/guidelines",
            notes="Clinical guidelines contraindicate non-selective NSAIDs in patients on post-PCI dual antiplatelets."
        ),
        VerificationItem(
            claim="Clopidogrel and Aspirin standard dual antiplatelet regimen post coronary stent.",
            status=VerificationStatus.VERIFIED,
            source_title="European Society of Cardiology (ESC)",
            source_url="https://www.escardio.org/Guidelines",
            notes="Standard of care for 6-12 months post-DES placement."
        )
    ],
    confidence_score=0.96,
    needs_human_confirmation=True,
    clarifying_questions=[
        "Has the patient noticed any dark, tarry stools or vomiting resembling coffee grounds?",
        "How long ago was the coronary stent procedure performed?"
    ],
    language="en",
    disclaimer="LifeBridge provides AI-assisted situational triage and is not a medical diagnosis. Always verify with attending physicians and dial 112/108 in emergencies."
)

DEMO_SCENARIO_2_FLOOD = LifeBridgeAnalysis(
    intent="Immediate flood evacuation, electrical hazard avoidance, and civic rescue coordination in Kurla West.",
    severity=SeverityLevel.CRITICAL,
    urgency="Immediate (< 5 mins)",
    extracted_entities=ExtractedEntities(
        people=["Residents of ground floor apartments"],
        medications=[],
        symptoms=["Trapped in flood waters", "Electrocution hazard"],
        locations=["Kurla West", "Mithi River flood basin", "Mumbai"],
        times=["Current storm surge", "Water level reaching 4 feet"]
    ),
    actions=[
        ActionItem(
            id="act-flood-1",
            action="Evacuate to upper floors immediately; DO NOT wade near sparking transformers",
            reason="Water conducts high-voltage electricity from submerged transformers. 4ft water depth carries severe drowning and electrocution hazards.",
            deadline="Immediate (< 1 min)",
            call_number=None,
            map_query=None,
            is_high_risk=True
        ),
        ActionItem(
            id="act-flood-2",
            action="Call BMC Disaster Control Room (1916) or National Emergency (112)",
            reason="Report sparking electrical infrastructure and request emergency NDRF boat evacuation.",
            deadline="Immediate (< 5 mins)",
            call_number="112",
            map_query=None,
            is_high_risk=True
        ),
        ActionItem(
            id="act-flood-3",
            action="Shut down main electrical breaker IF access is completely dry and safe",
            reason="Prevents internal household short-circuits. Never touch electrical switches while wet or standing in water.",
            deadline="Within 10 mins",
            call_number=None,
            map_query=None,
            is_high_risk=True
        )
    ],
    verification=[
        VerificationItem(
            claim="Brihanmumbai Municipal Corporation (BMC) Disaster Helpline is 1916; Universal Emergency is 112.",
            status=VerificationStatus.VERIFIED,
            source_title="BMC Disaster Management Department Official Portal",
            source_url="https://dm.mcgm.gov.in",
            notes="Active 24x7 control room for Mumbai urban flood response."
        ),
        VerificationItem(
            claim="Wading in floodwater near sparking utility equipment carries fatal electrical arc hazard.",
            status=VerificationStatus.VERIFIED,
            source_title="National Disaster Management Authority (NDMA) Urban Flood Advisory",
            source_url="https://ndma.gov.in",
            notes="Standard safety protocol warns against stepping into electrified water bodies."
        )
    ],
    confidence_score=0.98,
    needs_human_confirmation=True,
    clarifying_questions=[
        "Are there elderly individuals, infants, or mobility-impaired residents trapped with you?",
        "Is the water level continuing to rise rapidly inside the living area?"
    ],
    language="en",
    disclaimer="LifeBridge provides AI-assisted situational triage and is not an emergency dispatch service. Always dial 112/108 or local authorities in life-threatening disasters."
)

DEMO_SCENARIO_3_ACCIDENT = LifeBridgeAnalysis(
    intent="Critical roadside trauma triage and emergency ambulance dispatch for unconscious motorcyclist on highway.",
    severity=SeverityLevel.CRITICAL,
    urgency="Immediate (< 1 min)",
    extracted_entities=ExtractedEntities(
        people=["Unconscious male motorcycle rider", "Bystander reporting"],
        medications=[],
        symptoms=["Unconscious", "Head bleeding", "Cracked helmet"],
        locations=["Western Express Highway near Goregaon flyover", "Mumbai"],
        times=["Just now (incident underway)", "Heavy ongoing highway traffic"]
    ),
    actions=[
        ActionItem(
            id="act-acc-1",
            action="Call Ambulance (108) and Police Emergency (112) Immediately",
            reason="Trauma victim with head injury and loss of consciousness requires Advanced Life Support (ALS) paramedic dispatch.",
            deadline="Immediate (< 1 min)",
            call_number="108",
            map_query="trauma center near Goregaon West",
            is_high_risk=True
        ),
        ActionItem(
            id="act-acc-2",
            action="Secure the highway scene to prevent secondary collisions",
            reason="Park a vehicle with hazard lights blinking 30 meters ahead of the victim, or signal oncoming traffic from a safe roadside barrier.",
            deadline="Immediate (< 2 mins)",
            call_number=None,
            map_query=None,
            is_high_risk=True
        ),
        ActionItem(
            id="act-acc-3",
            action="DO NOT move victim's cervical spine or remove cracked helmet",
            reason="Removing helmet or turning the neck can sever spinal cord during high-velocity impact injuries unless airway is obstructed.",
            deadline="Immediate",
            call_number=None,
            map_query=None,
            is_high_risk=True
        )
    ],
    verification=[
        VerificationItem(
            claim="India 108 is the National Emergency Ambulance Service and 112 is Universal Emergency.",
            status=VerificationStatus.VERIFIED,
            source_title="Ministry of Health and Family Welfare (MoHFW) Emergency Services",
            source_url="https://www.mohfw.gov.in",
            notes="Toll-free emergency dispatch operational nationwide."
        ),
        VerificationItem(
            claim="C-spine immobilization protocol: Helmet removal contraindicated at roadside by non-medical bystanders.",
            status=VerificationStatus.VERIFIED,
            source_title="Advanced Trauma Life Support (ATLS) Guidelines",
            source_url="https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support",
            notes="Improper helmet removal carries high risk of secondary quadriplegia."
        )
    ],
    confidence_score=0.99,
    needs_human_confirmation=True,
    clarifying_questions=[
        "Is the victim breathing, or is there any audible wheezing/gasping?",
        "Are other vehicles involved in the collision?"
    ],
    language="en",
    disclaimer="LifeBridge provides AI-assisted situational triage and is not an emergency dispatch service. Always dial 112/108 in road accidents."
)

DEMO_SCENARIOS = {
    "medical_stack": {
        "id": "medical_stack",
        "title": "Caregiver Medical Stack",
        "description": "Post-cardiac stenting discharge summary + Ibuprofen interaction risk",
        "sample_text": "Patient 68yo male, discharged after stenting. Currently prescribed Aspirin 75mg daily and Clopidogrel 75mg. Family also gave him Ibuprofen 400mg for back pain. Patient complaining of burning stomach pain and dizziness.",
        "precomputed": DEMO_SCENARIO_1_MEDICAL
    },
    "flood_hazard": {
        "id": "flood_hazard",
        "title": "Urban Flood Hazard",
        "description": "Mumbai flood report with electrical transformer sparking in water",
        "sample_text": "Mithi River overflowing, water level reaching 4 feet at Kurla West. Ground floor apartments flooded, electrical transformers sparking in water.",
        "precomputed": DEMO_SCENARIO_2_FLOOD
    },
    "road_accident": {
        "id": "road_accident",
        "title": "Highway Road Accident",
        "description": "Panicked voice report of unconscious rider with head injury on highway",
        "sample_text": "Emergency! Two-wheeler slipped on Western Express Highway near Goregaon flyover. Rider is unconscious on the road, bleeding from head, helmet cracked. Traffic is swerving around him!",
        "precomputed": DEMO_SCENARIO_3_ACCIDENT
    }
}
