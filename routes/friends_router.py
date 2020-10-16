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