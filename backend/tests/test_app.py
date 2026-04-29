import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    return app.test_client()

def test_home(client):
    response = client.get("/")
    assert response.status_code == 200

def test_add_task(client):
    response = client.post("/tasks", json={
        "title": "Test Task",
        "priority": "High"
    })
    assert response.status_code == 200

def test_get_tasks(client):
    response = client.get("/tasks")
    assert response.status_code == 200
    assert isinstance(response.json, list)