from flask import Flask, jsonify, request
from flask_cors import CORS
import Backend  # Imports your Backend.py file

app = Flask(__name__)
CORS(app)

# Initialize database on startup
Backend.init_db()


@app.route("/notes", methods=["GET"])
def get_notes():
  # Modify listnotes or query DB directly to return JSON
  import sqlite3

  conn = sqlite3.connect("notes.db")
  cursor = conn.cursor()
  cursor.execute("SELECT id, title, message FROM notes ORDER BY id DESC")
  rows = cursor.fetchall()
  conn.close()

  notes = [{"id": r[0], "title": r[1], "message": r[2]} for r in rows]
  return jsonify(notes)


@app.route("/notes", methods=["POST"])
def create_note():
  data = request.get_json()
  title = data.get("title", "")
  message = data.get("message", "")
  if title and message:
    
    import sqlite3

    # Inside create_note(), after validating title and message:
    with sqlite3.connect("notes.db") as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notes (title, message) VALUES (?, ?)",
            (title, message)
        )
        note_id = cursor.lastrowid

    return jsonify({
        "status": "success",
        "id": note_id
    }), 201

  return jsonify({"error": "Title or message missing"}), 400




@app.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    import sqlite3

    try:
        with sqlite3.connect("notes.db", timeout=10) as conn:
            cursor = conn.cursor()

            cursor.execute(
                "DELETE FROM notes WHERE id = ?",
                (note_id,)
            )

            if cursor.rowcount == 0:
                return jsonify({
                    "error": "Note not found"
                }), 404

        return jsonify({"status": "success"}), 200

    except sqlite3.OperationalError as error:
        return jsonify({
            "error": str(error)
        }), 500




@app.route("/notes/search", methods=["GET"])
def search_notes():
  import sqlite3

  keyword = request.args.get("q", "")
  conn = sqlite3.connect("notes.db")
  cursor = conn.cursor()
  query = "SELECT id, title, message FROM notes WHERE title LIKE ? OR message LIKE ? ORDER BY id DESC"
  cursor.execute(query, (f"%{keyword}%", f"%{keyword}%"))
  rows = cursor.fetchall()
  conn.close()

  notes = [{"id": r[0], "title": r[1], "message": r[2]} for r in rows]
  return jsonify(notes)




@app.route("/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    import sqlite3

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON"}), 400

    title = data.get("title", "").strip()
    message = data.get("message", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 400

    try:
        with sqlite3.connect("notes.db", timeout=10) as conn:
            cursor = conn.cursor()

            cursor.execute(
                "UPDATE notes SET title = ?, message = ? WHERE id = ?",
                (title, message, note_id)
            )

            if cursor.rowcount == 0:
                return jsonify({"error": "Note not found"}), 404

        return jsonify({"status": "success"}), 200

    except sqlite3.OperationalError as error:
        return jsonify({"error": str(error)}), 500




if __name__ == "__main__":
  app.run(debug=True, port=5000)