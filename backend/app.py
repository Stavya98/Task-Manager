from flask import Flask, request, jsonify
from flask_cors import CORS
from models import init_db, get_connection

app = Flask(__name__)
CORS(app)

init_db()

# ➕ Create Task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    title = data.get("title")
    priority = data.get("priority", "Low")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO tasks (title, priority) VALUES (?, ?)",
        (title, priority)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task added"})


# 📋 Get Tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    conn.close()

    result = []
    for t in tasks:
        result.append({
            "id": t[0],
            "title": t[1],
            "priority": t[2],
            "completed": bool(t[3])
        })

    return jsonify(result)


# ✅ Mark Complete
@app.route("/tasks/<int:id>", methods=["PUT"])
def complete_task(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE tasks SET completed = 1 WHERE id = ?",
        (id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task completed"})


# ❌ Delete Task
@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Task deleted"})


if __name__ == "__main__":
    app.run(debug=True)