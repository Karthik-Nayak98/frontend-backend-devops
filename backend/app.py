from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

# Configure the SQLite database with python sqlalchemy
# sqllite:// - SQLite database driver
# todo.db -> Name of the db file.
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todo.db"

db = SQLAlchemy(app)


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(100), nullable=False)


# Application context, flask interacting with database.
with app.app_context():
    db.create_all()


@app.get("/")
def root():
    return {"status": "ok"}

@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Todo.query.all()
    return (
        jsonify(
            [
                {"id": task.id, "name": task.name, "status": task.status}
                for task in tasks
            ]
        ),
        200,
    )


@app.route("/tasks", methods=["POST"])
def add_task():
    task_data = request.get_json()

    # Empty json
    if any(key not in task_data for key in ["name", "status"]):
        return jsonify({"error": "Invalid request data"}), 500

    # Empty name or status
    if task_data["name"] == "" or task_data["status"] == "":
        return jsonify({"error": "Invalid request data"}), 400

    new_task = Todo(name=task_data["name"], status=task_data["status"])
    db.session.add(new_task)
    db.session.commit()

    return (
        jsonify({"id": new_task.id, "name": new_task.name, "status": new_task.status}),
        201,
    )


@app.route("/tasks", methods=["PUT"])
def update_task():
    task_data = request.get_json()

    if not task_data or "id" not in task_data:
        return jsonify({"error": "ID is required"}), 400

    task = db.session.get(Todo, int(task_data["id"]))

    if not task:
        return jsonify({"error": "Task not found"}), 404

    if task.status not in ["new", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    task.status = "completed" if task.status == "new" else "new"
    db.session.commit()

    return jsonify({"id": task.id, "name": task.name, "status": task.status}), 200


if __name__ == "__main__":
    app.run("0.0.0.0", port=8000, debug=True)
