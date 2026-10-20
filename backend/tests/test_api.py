from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_data import DEMO_SCENARIO_1_MEDICAL

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "model" in data

def test_api_demos():
    response = client.get("/api/demos")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 3

def test_api_analyze_empty_payload():
    response = client.post("/api/analyze", data={})
    assert response.status_code == 400

def test_api_analyze_text():
    response = client.post("/api/analyze", data={"text": "Patient has severe chest pain and collapsed", "language": "en"})
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "Critical"
    assert len(data["actions"]) > 0
    assert data["needs_human_confirmation"] is True
