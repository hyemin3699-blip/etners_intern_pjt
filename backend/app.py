from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from routes.context_routes import bp as context_bp
from routes.recommendation_routes import bp as recommendation_bp
from routes.faq_routes import bp as faq_bp
from services import data_store

app = Flask(__name__)
CORS(app)

app.register_blueprint(context_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(faq_bp)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/inquiries")
def inquiries():
    return jsonify(data_store.get_inquiries_with_employee())


@app.route("/api/employees/<int:employee_id>")
def employee_detail(employee_id):
    employee = data_store.get_employee(employee_id)
    if not employee:
        return jsonify({"error": "not found"}), 404
    return jsonify(employee)


if __name__ == "__main__":
    app.run(debug=True, port=5003)
