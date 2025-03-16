import pytest
from app import app, db, Todo


@pytest.fixture
def client():
    # Create a test app with a separate in-memory database
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()


# Ensure the endpoint returns an empty list if no tasks are present.
def test_get_tasks_empty(client):
    response = client.get("/tasks")
    assert response.status_code == 200
    assert response.json == []


# Ensure a new task can be created successfully.
def test_add_task(client):
    data = {"name": "Test Task", "status": "new"}
    response = client.post("/tasks", json=data)

    assert response.status_code == 201
    assert response.json["name"] == "Test Task"
    assert response.json["status"] == "new"

    # Check if the task exists in the database
    task = Todo.query.first()
    assert task is not None
    assert task.name == "Test Task"
    assert task.status == "new"


# Ensure tasks are listed correctly after being added.
def test_get_tasks(client):
    # Add a task first
    client.post("/tasks", json={"name": "Task 1", "status": "new"})

    # Fetch the tasks
    response = client.get("/tasks")

    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["name"] == "Task 1"
    assert response.json[0]["status"] == "new"


def test_update_task(client):
    # Add a task first
    add_response = client.post("/tasks", json={"name": "Task 1", "status": "new"})
    task_id = add_response.json["id"]

    # Update the task status
    update_response = client.put("/tasks", json={"id": task_id})

    assert update_response.status_code == 200
    assert update_response.json["status"] == "completed"

    # Fetch task and check the status
    updated_task = db.session.get(Todo, task_id)
    assert updated_task.status == "completed"


def test_add_task_missing_data(client):
    response = client.post("/tasks", json={"status": "new"})
    assert response.status_code == 500  # SQLAlchemy will throw an integrity error


# Invalid task id
def test_update_task_invalid_id(client):
    response = client.put("/tasks", json={"id": 999})

    assert response.status_code == 404
    assert response.json["error"] == "Task not found"


# Ensure an error is returned if the ID is missing in the request.
def test_update_task_missing_id(client):
    response = client.put("/tasks", json={})

    assert response.status_code == 400
    assert response.json["error"] == "ID is required"


# Test with invalid status
def test_update_task_invalid_status(client):
    # Add a task with an invalid status
    client.post("/tasks", json={"name": "Task 1", "status": "invalid"})

    # Try updating it
    task = Todo.query.first()
    response = client.put("/tasks", json={"id": task.id})

    assert response.status_code == 400
    assert response.json["error"] == "Invalid status"


# Ensure validation fails if task name or status is empty.
def test_add_task_empty_name_or_status(client):
    data = {"name": "", "status": "new"}
    response = client.post("/tasks", json=data)
    assert response.status_code == 400
    assert response.json["error"] == "Invalid request data"

    data = {"name": "Task", "status": ""}
    response = client.post("/tasks", json=data)
    assert response.status_code == 400
    assert response.json["error"] == "Invalid request data"


#  Ensure CORS headers are set correctly.
def test_cors_headers(client):
    response = client.get("/tasks")
    assert response.headers["Access-Control-Allow-Origin"] == "*"
