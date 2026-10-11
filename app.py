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
    Backend.addnotes(title, message)
    return jsonify({"status": "success"}), 201
  return jsonify({"error": "Title or message missing"}), 400


if __name__ == "__main__":
  app.run(debug=True, port=5000)