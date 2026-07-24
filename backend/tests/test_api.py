import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database.db import init_db

# Initialize DB tables for test run
init_db()

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Revive AI" in response.json()["app"]

def test_analyze_repository():
    response = client.post(
        "/api/analyze",
        json={"repo_url": "https://github.com/facebook/react"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "recovery_score" in data
    assert data["recovery_score"] >= 0

def test_get_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_user():
    response = client.get("/api/user")
    assert response.status_code == 200
    assert "email" in response.json()

def test_distinct_repo_analyses():
    # 1. Analyze react (JS/TS frontend)
    res_react = client.post("/api/analyze", json={"repo_url": "https://github.com/facebook/react"})
    assert res_react.status_code == 200
    data_react = res_react.json()

    # 2. Analyze nocode (empty repo)
    res_nocode = client.post("/api/analyze", json={"repo_url": "https://github.com/kelseyhightower/nocode"})
    assert res_nocode.status_code == 200
    data_nocode = res_nocode.json()

    # 3. Analyze flask (Python framework)
    res_flask = client.post("/api/analyze", json={"repo_url": "https://github.com/pallets/flask"})
    assert res_flask.status_code == 200
    data_flask = res_flask.json()

    # Assert that analysis outputs are DISTINCT
    assert data_nocode["summary"] != data_react["summary"]
    assert data_flask["summary"] != data_react["summary"]
    assert data_nocode["recovery_score"] != data_react["recovery_score"]
    assert "no active source code" in data_nocode["summary"].lower() or "empty" in data_nocode["summary"].lower()
    assert "python" in data_flask["summary"].lower() or "flask" in data_flask["summary"].lower()

