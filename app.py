from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/home/")
def pageHome():
    return "AAAAABBBBBdasdaa"

@app.route("/")
def index():
    return render_template("index.html")
