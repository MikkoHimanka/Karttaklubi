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
    if not session:
        return redirect("/")

    del_req_query = "DELETE FROM requests WHERE id=:req_id"
    db.session.execute(del_req_query, {"req_id": req_id})
    db.session.commit()

    return redirect("/")

@app.route("/user/<int:friend_id>")
def user(friend_id):
    if not session:
        return redirect("/")

    user_query = "SELECT b.username FROM users a LEFT JOIN users b ON b.id=ANY(a.friends) WHERE a.id=:user_id AND b.id=:friend_id"
    user_res = db.session.execute(user_query, {"friend_id": friend_id, "user_id": session["user_id"]}).fetchone()
    if user_res != None:
        shared_maps_query = "SELECT id, name FROM mapcollections WHERE owner=:user_id AND shared=true"
        shared_maps_res = db.session.execute(shared_maps_query, {"user_id": friend_id}).fetchall()
        public_maps_query = "SELECT id, name FROM mapcollections WHERE owner=:user_id AND public=true AND shared=false"
        public_maps_res = db.session.execute(public_maps_query, {"user_id": friend_id}).fetchall()

        return render_template("user.jinja", sharedmaps=shared_maps_res, name=user_res[0], publicmaps=public_maps_res, navigation="user")
    else:
        response = make_response(redirect("/"))
        response.set_cookie("alert", "no_friend")
        return response
    
@app.route("/addfrequest", methods=["POST"])
def addfrequest():
    if not session:
        return redirect("/")

    friend_name = request.form["name"]
    user_query = "SELECT id FROM users WHERE username=:friend_name"
    user_res = db.session.execute(user_query, {"friend_name": friend_name}).fetchone()

    if user_res != None and user_res[0] != session["user_id"]:
        already_query = "SELECT id FROM users WHERE id=:user_id AND :friend_id=ANY(friends)"
        already_res = db.session.execute(already_query, {"user_id": session["user_id"], "friend_id": user_res[0]}).fetchone()
        
        if already_res == None:
            frequest_already_query = "SELECT id FROM requests WHERE sender=:sender AND receiver=:receiver"
            frequest_already_res = db.session.execute(frequest_already_query, {"sender": session["user_id"], "receiver": user_res[0]}).fetchone()
            frequest_already_query2 = "SELECT id FROM requests WHERE sender=:sender AND receiver=:receiver"
            frequest_already_res2 = db.session.execute(frequest_already_query, {"sender": user_res[0], "receiver": session["user_id"]}).fetchone()

            if frequest_already_res == None and frequest_already_res2 == None:
                frequest_query = "INSERT INTO requests (sender, receiver) VALUES (:sender, :receiver)"
                frequest_res = db.session.execute(frequest_query, {"sender": session["user_id"], "receiver": user_res[0]})
                db.session.commit()
            else:
                response = make_response(redirect("/"))
                response.set_cookie("alert", "frequest_duplicate")
                return response
        else:
            response = make_response(redirect("/"))
            response.set_cookie("alert", "frequest_old")
            return response

        response = make_response(redirect("/"))
        response.set_cookie("alert", "frequest_send")
        return response
    elif user_res != None and user_res[0] == session["user_id"]:
        response = make_response(redirect("/"))
        response.set_cookie("alert", "frequest_self")
        return response

    response = make_response(redirect("/"))
    response.set_cookie("alert", "frequest_fail")
    return response