from flask import Flask, request, jsonify
from tracer import runCode  # your existing tracer.py function
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows Express or React to access this API

@app.route("/run-python", methods=["POST"])
def run_python_code():
    data = request.get_json()
    code = data.get("code", "")
    
    trace = runCode(code)
    return jsonify(trace)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
