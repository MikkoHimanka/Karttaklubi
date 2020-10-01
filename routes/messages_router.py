from app import app
from flask import redirect, request, session
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@app.route("/newmsg/<int:map_id>", methods=["POST"])
def new_msg(map_id):
    author = session["user_id"]
    msg = request.form["msg"]
    sql = "INSERT INTO messages (author, message, owner_id, time) VALUES (:author, :msg, :id, CURRENT_TIMESTAMP)"
    db.session.execute(sql, {"author":author, "msg":msg, "id":map_id})
    db.session.commit()
    return redirect("/maps/"+str(map_id))