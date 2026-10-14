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


def test_square_root_expression():
    response = client.post(
        "/api/calculate",
        json={"expression": "sqrt(81)"},
    )

    assert response.status_code == 200
    assert response.json()["result"] == 9


def test_factorial_expression():
    response = client.post(
        "/api/calculate",
        json={"expression": "factorial(5)"},
    )

    assert response.status_code == 200
    assert response.json()["result"] == 120


def test_caret_exponent_expression():
    response = client.post(
        "/api/calculate",
        json={"expression": "2^3"},
    )

    assert response.status_code == 200
    assert response.json()["result"] == 8


def test_arbitrary_function_call_is_rejected():
    response = client.post(
        "/api/calculate",
        json={"expression": "__import__('os').getcwd()"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid expression"


def test_unreasonably_large_exponent_is_rejected():
    response = client.post(
        "/api/calculate",
        json={"expression": "10 ** 1001"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid expression"


def test_websocket_uses_supported_expression_parser():
    with client.websocket_connect("/ws") as websocket:
        websocket.send_json({"expression": "sqrt(81) + 2 ** 3"})

        assert websocket.receive_json() == {
            "event": "CALCULATION_STARTED",
            "expression": "sqrt(81) + 2 ** 3",
        }
        assert websocket.receive_json() == {
            "event": "CALCULATION_COMPLETED",
            "expression": "sqrt(81) + 2 ** 3",
            "result": 17.0,
        }