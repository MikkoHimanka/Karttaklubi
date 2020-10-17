from app import app
from flask import request, redirect, session, render_template, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy(app)

@app.route("/frequest/accept/<int:req_id>")
def accept(req_id):
    req_query = "SELECT sender FROM requests WHERE id=:id AND receiver=:receiver_id"
    res = db.session.execute(req_query, {"id": req_id, "receiver_id": session["user_id"]}).fetchone()

    if len(res) > 0:
        users_query1 = "UPDATE users SET friends = array_append(friends, :user1_id) WHERE id=:user2_id"
        users_query2 = "UPDATE users SET friends = array_append(friends, :user2_id) WHERE id=:user1_id"
        del_req_query = "DELETE FROM requests WHERE id=:req_id"
        db.session.execute(users_query1, {"user1_id": session["user_id"], "user2_id": res[0]})
        db.session.execute(users_query2, {"user1_id": session["user_id"], "user2_id": res[0]})
        db.session.execute(del_req_query, {"req_id": req_id})
        db.session.commit()


    return redirect("/")

@app.route("/frequest/decline/<int:req_id>")
def decline(req_id):
    del_req_query = "DELETE FROM requests WHERE id=:req_id"
    db.session.execute(del_req_query, {"req_id": req_id})
    db.session.commit()

    return redirect("/")

@app.route("/user/<int:friend_id>")
def user(friend_id):
    user_query = "SELECT a.friends FROM users a LEFT JOIN users b ON b.id=ANY(a.friends) WHERE a.id=:user_id AND b.id=:friend_id"
    user_res = db.session.execute(user_query, {"friend_id": friend_id, "user_id": session["user_id"]}).fetchone()
    print(user_res)


    if user_res != None:
        return render_template("user.jinja")
    else:
        response = make_response(redirect("/"))
        response.set_cookie("alert", "no_friend")
        return response
    
@app.route("/addfrequest/", methods=["POST"])
def addfrequest():
    friend_name = request.form["name"]
    user_query = "SELECT id FROM users WHERE username=:friend_name"
    user_res = db.session.execute(user_query, {"friend_name": friend_name}).fetchone()

    if user.res != None:
        print("löytyi")

    return