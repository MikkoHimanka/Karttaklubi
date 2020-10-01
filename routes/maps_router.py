from app import app
from flask import render_template, json, request, redirect, session, make_response, url_for
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@app.route("/save_map", methods=["POST"])
def savemap():
    data = json.loads(request.form["data"])

    save_query = "UPDATE maps SET mapdata=:map_data WHERE id=:map_id"
    db.session.execute(save_query, {"map_data": data, "map_id":request.form["id"]})
    db.session.commit()


    return redirect("/")

@app.route("/maps/new_column/<int:mapcollection_id>")
def new_column(mapcollection_id):
    map_array_query = "SELECT * FROM mapcollections WHERE id=:mapcollection_id"
    map_array = db.session.execute(map_array_query, {"mapcollection_id":mapcollection_id}).fetchone()
    map_new_array = map_array[2].copy()

    data = [0] * 64 * 64
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true)"
    for i in range(map_array[4] - 1):
        new_map_query += ", (:data, true)"
    new_map_query += " RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchall()
    map_id_array = list(map(lambda x: x[0], map_id))
    for i in range(map_array[4]):
        map_new_array[i].append(map_id_array[i])

    update_query = "UPDATE mapcollections SET maps=:map_array WHERE id=:mapcollection_id"
    db.session.execute(update_query, {"map_array": map_new_array, "mapcollection_id": mapcollection_id})
    db.session.commit()

    return redirect(url_for('maps', map_id=mapcollection_id))

@app.route("/maps/new_row/<int:mapcollection_id>")
def new_row(mapcollection_id):
    map_array_query = "SELECT * FROM mapcollections WHERE id=:mapcollection_id"
    map_array = db.session.execute(map_array_query, {"mapcollection_id":mapcollection_id}).fetchone()
    map_row_size = len(map_array[2][0])
    map_new_rows = map_array[4] + 1
    map_new_array = map_array[2].copy()

    data = [0] * 64 * 64
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true)"
    for i in range(map_row_size - 1):
        new_map_query += ", (:data, true)"
    new_map_query += " RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchall()
    map_id_array = list(map(lambda x: x[0], map_id))
    map_new_array.append(map_id_array)
    print(map_new_array)

    update_query = "UPDATE mapcollections SET maps=:map_array, rows=:new_rows WHERE id=:mapcollection_id"
    db.session.execute(update_query, {"map_array": map_new_array, "mapcollection_id": mapcollection_id, "new_rows": map_new_rows})
    db.session.commit()

    return redirect(url_for('maps', map_id=mapcollection_id))

@app.route("/newmap", methods=["POST"])
def newmap():
    if request.form["name"].strip() == "":
        response = make_response(redirect("/"))
        response.set_cookie("alert", "empty_mapname")
        return response

    data = [0] * 64 * 64
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true) RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchone()[0]
    

    
    new_mapcollections_query = "INSERT INTO mapcollections (owner, maps, rows, name) VALUES (:user, ARRAY[:map_id], 1, :name)"
    mapcollection_id = db.session.execute(new_mapcollections_query, {"user": session["user_id"], "map_id": [map_id], "name": request.form["name"]})
    db.session.commit()
    
    return redirect("/")



@app.route("/maps/<int:map_id>")
def maps(map_id):
    map_query = "SELECT * FROM mapcollections WHERE id=:map_id"
    map_result = db.session.execute(map_query, {"map_id": map_id}).fetchone()
    maps = []
    
    for row in map_result[2]:
        for m in row:
            submap_query = "SELECT id, mapdata FROM maps WHERE id=:submap_id"
            submap_result = db.session.execute(submap_query, {"submap_id":m}).fetchone()[1]
            maps.append(submap_result)
    
    msg_query = "SELECT u.username, m.message, m.id FROM messages m LEFT JOIN users u ON m.author = u.id WHERE owner_id=:id ORDER BY m.time DESC"
    msg_result = db.session.execute(msg_query, {"id":map_id}).fetchall()

    return render_template("maps.jinja", mapcollection=map_result, submaps=maps, messages=msg_result)

@app.route("/editor/<int:map_id>")
def editor(map_id):
    map_query = "SELECT * FROM maps WHERE id=:id"
    res = db.session.execute(map_query, {"id": map_id}).fetchone()
    data = json.dumps(res[1])

    return render_template("editor.jinja", map_data=data, map_id=map_id)
