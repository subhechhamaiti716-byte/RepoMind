import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "Subhechha Maiti" in data["student"]

def test_auth_register_and_login():
    # Register test user
    email = "testuser@repomind.io"
    client.post("/api/v1/auth/register", json={
        "name": "Subhechha Tester",
        "email": email,
        "password": "Password123!"
    })

    # Login
    resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    assert token is not None

    # Verify
    verify_resp = client.get("/api/v1/auth/verify", headers={"Authorization": f"Bearer {token}"})
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True

def test_project_and_analysis_lifecycle():
    # 1. Create project
    proj_resp = client.post("/api/v1/projects", json={
        "name": "Campus Management Test",
        "repository_url": "https://github.com/subhechha-dev/campus-management",
        "branch": "main"
    })
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["project_id"]

    # 2. Run synchronous analysis
    ana_resp = client.post(f"/api/v1/projects/{project_id}/analyses", json={"branch": "main"})
    assert ana_resp.status_code == 202
    analysis_id = ana_resp.json()["analysis_id"]

    # 3. Check status
    status_resp = client.get(f"/api/v1/analyses/{analysis_id}")
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "completed"

    # 4. Check issues
    issues_resp = client.get(f"/api/v1/projects/{project_id}/issues")
    assert issues_resp.status_code == 200
    issues = issues_resp.json()["issues"]
    assert len(issues) > 0

    # Verify critical SQL injection or hardcoded password detected
    titles = [i["title"] for i in issues]
    assert any("SQL Injection" in t or "Hardcoded" in t or "Circular" in t for t in titles)

    # 5. Check Architecture Graph
    arch_resp = client.get(f"/api/v1/projects/{project_id}/architecture/graph")
    assert arch_resp.status_code == 200
    graph = arch_resp.json()
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

    # 6. Check Health Score
    health_resp = client.get(f"/api/v1/projects/{project_id}/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["overall_score"] > 0

    # 7. Test AI Codebase Chat
    chat_sess_resp = client.post(f"/api/v1/projects/{project_id}/chat/sessions", json={"title": "Test Chat"})
    assert chat_sess_resp.status_code == 200
    session_id = chat_sess_resp.json()["session_id"]

    msg_resp = client.post(f"/api/v1/chat/sessions/{session_id}/messages", json={"message": "How does authentication work in this project?"})
    assert msg_resp.status_code == 200
    assert "auth" in msg_resp.json()["content"].lower()

    # 8. Test Fix Generation
    target_issue = issues[0]
    fix_resp = client.post(f"/api/v1/issues/{target_issue['issue_id']}/fix", json={"mode": "suggest"})
    assert fix_resp.status_code == 200
    assert fix_resp.json()["suggested_code"] is not None

    # 9. Test Report Generation
    rep_resp = client.post(f"/api/v1/projects/{project_id}/reports", json={"format": "pdf"})
    assert rep_resp.status_code == 201

    print("\n[SUCCESS] All 9 Core RepoMind Backend Pipeline Integration Tests Passed Successfully!")

if __name__ == "__main__":
    test_root_endpoint()
    test_auth_register_and_login()
    test_project_and_analysis_lifecycle()
