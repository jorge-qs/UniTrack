from fastapi.testclient import TestClient


def test_auth_me_returns_user(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "00000000-0000-0000-0000-000000000000"
    assert "created_at" in body
