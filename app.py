from flask import Flask
from flask import render_template, redirect, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]= False
app.secret_key = getenv("SECRET_KEY")
db = SQLAlchemy(app)



@app.route("/maps/new_row/<int:mapcollection_id>")
def new_row(mapcollection_id):
    data = [0] * 64
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true) RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchone()[0]
    map_array_query = "SELECT maps FROM mapcollections WHERE id=:mapcollection_id"
    map_array = db.session.execute(map_array_query, {"mapcollection_id":mapcollection_id}).fetchone()[0]
    map_array.append(map_id)
    update_query = "UPDATE mapcollections SET maps=:map_array WHERE id=:mapcollection_id"
    db.session.execute(update_query, {"map_array": map_array, "mapcollection_id": mapcollection_id})
    db.session.commit()

    return redirect(url_for('maps', map_id=mapcollection_id))

@app.route("/newmap")
def newmap():
    data = [0] * 64
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true) RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchone()[0]
    
    
    new_mapcollections_query = "INSERT INTO mapcollections (owner, maps) VALUES (:user, ARRAY[:map_id])"
    mapcollection_id = db.session.execute(new_mapcollections_query, {"user": session["user_id"], "map_id": map_id})
    db.session.commit()
    
    return redirect("/")

@app.route("/")
def index():
    if session:
        user = None
        maps = None
        
        mapcollections_query = "SELECT * FROM mapcollections WHERE owner=:user_id"
        mapcollections_result = db.session.execute(mapcollections_query, {"user_id": session["user_id"]})
        maps = mapcollections_result.fetchall()

        return render_template("alku.jinja", maps=maps, userid=session["user_id"])
    else:
        return render_template("index.jinja")

@app.route("/maps/<int:map_id>")
def maps(map_id):
    map_query = "SELECT * FROM mapcollections WHERE id=:map_id"
    map_result = db.session.execute(map_query, {"map_id": map_id}).fetchone()

    return render_template("maps.jinja", mapcollection=map_result)

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    
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
    return render_template("signup.jinja")

@app.route("/newuser", methods=["POST"])
def newuser():
    username = request.form["username"]
    password = request.form["password"]
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
