from app import app
from flask import request, redirect, session, render_template, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy(app)

@app.route("/")
def index():
    alert = ""
    if request.cookies.get("alert"): alert = request.cookies.get("alert")
    if session:
        mapcollections_query = "SELECT a.id, a.name, a.maps FROM mapcollections a WHERE owner=:user_id ORDER BY a.id"
        mapcollections_result = db.session.execute(mapcollections_query, {"user_id": session["user_id"]})
        maps = mapcollections_result.fetchall()

        public_maps_query = "SELECT a.id, a.name, b.username, a.maps FROM mapcollections a LEFT JOIN users b ON b.id=a.owner WHERE public=True ORDER BY a.id"
        public_maps_result = db.session.execute(public_maps_query).fetchall()
               
        requests_query = "SELECT r.id, u.username FROM requests r LEFT JOIN users u ON r.sender=u.id WHERE receiver=:user_id"
        requests_result = db.session.execute(requests_query, {"user_id": session["user_id"]}).fetchall()

        friends_query = "SELECT b.id, b.username FROM users a LEFT JOIN users b ON b.id= ANY(a.friends) WHERE a.id=:user_id"
        friends = db.session.execute(friends_query, {"user_id": session["user_id"]}).fetchall()
        if friends[0][0] == None:
            friends = []
        return render_template("index.jinja",
            maps=maps,
            userid=session["user_id"],
            alert=alert,
            publicMaps=public_maps_result,
            requests=requests_result,
            friends=friends)
    else:
        return render_template("index.jinja", alert=alert)

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]

    if username.strip() == "":
        response = make_response(redirect("/"))
        response.set_cookie("alert", "empty_username")
        return response
    elif password.strip() == "":
        response = make_response(redirect("/"))
        response.set_cookie("alert", "empty_password")
        return response
    
    sql = "SELECT id, password FROM users WHERE username=:username"
    result = db.session.execute(sql, {"username":username})
    user = result.fetchone()
    print(user)
    if user == None:
        return redirect("/")
    else:
        hash_value = user[1]
        if check_password_hash(hash_value,password):
            session["username"] = username
            session["user_id"] = user[0]

    return redirect("/")

@app.route("/signup")
def signup():
    alert = ""
    if request.cookies.get("alert"): alert = request.cookies.get("alert")
    return render_template("signup.jinja", alert=alert)

@app.route("/newuser", methods=["POST"])
def newuser():
    username = request.form["username"]
    password = request.form["password"]

    stripName = username.strip()

    username_query = "SELECT * FROM users WHERE username=:name"
    username_result = db.session.execute(username_query, {"name":stripName}).fetchall()

    if stripName == "":
        response = make_response(redirect("/signup"))
        response.set_cookie("alert", "empty_username")
        return response
    elif password.strip() == "":
        response = make_response(redirect("/signup"))
        response.set_cookie("alert", "empty_password")
        return response
    elif len(username_result) > 0:
        response = make_response(redirect("/signup"))
        response.set_cookie("alert", "username_taken")
        return response

    hash_value = generate_password_hash(password)
    sql = "INSERT INTO users (username, password) VALUES (:username,:password)"
    db.session.execute(sql, {"username":username,"password":hash_value})
    db.session.commit()
    return redirect("/")

@app.route("/logout")
def logout():
    del session["user_id"]
    del session["username"]
    return redirect("/")