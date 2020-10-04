from app import app
from flask import redirect, request, session
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@app.route("/newmsg/<int:map_id>", methods=["POST"])
def new_msg(map_id):
    author = session["user_id"]
    msg = request.form["msg"]
    submap = True if len(request.form) > 1 else False
    
    sql = "INSERT INTO messages (author, message, owner_id, time, submap) VALUES (:author, :msg, :id, CURRENT_TIMESTAMP, :submap)"
    db.session.execute(sql, {"author":author, "msg":msg, "id":map_id, "submap":submap})
    db.session.commit()
    
    if submap:
        return redirect("/editor/" + str(map_id))
    return redirect("/maps/" + str(map_id))