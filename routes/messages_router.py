from app import app
from flask import redirect, request
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@app.route("/newmsg/<int:map_id>", methods=["POST"])
def new_msg(map_id):
    msg = request.form["msg"]
    sql = "INSERT INTO messages (message, owner_id, time) VALUES (:msg, :id, CURRENT_TIMESTAMP)"
    db.session.execute(sql, {"msg":msg, "id":map_id})
    db.session.commit()
    return redirect("/maps/"+str(map_id))