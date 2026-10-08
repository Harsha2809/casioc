from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Welcome to CASIOC"
    assert data["status"] == "running"


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"


def test_calculate():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "25 * 4 + 10",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["expression"] == "25 * 4 + 10"
    assert data["result"] == 110


def test_simple_addition():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "10 + 20",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["result"] == 30


def test_division():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "100 / 4",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["result"] == 25


def test_division_by_zero():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "10 / 0",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["detail"] == "Cannot divide by zero"


def test_invalid_expression():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "10 +",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["detail"] == "Invalid expression"


def test_empty_expression():
    response = client.post(
        "/api/calculate",
        json={
            "expression": "",
        },
    )

    assert response.status_code == 422