import pytest


@pytest.mark.asyncio
async def test_predict_and_history(async_client):
    payload = {
        "cod_curso": "CS101",
        "features": {
            "promedio": 0.6,
            "creditos": 20,
        },
    }

    headers = {"Authorization": "Bearer test"}

    response = await async_client.post("/api/v1/predict", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["cod_curso"] == "CS101"
    assert "score" in data

    history = await async_client.get("/api/v1/history", headers=headers)
    assert history.status_code == 200
    body = history.json()
    assert body["total"] >= 1
    assert any(item["cod_curso"] == "CS101" for item in body["items"])
