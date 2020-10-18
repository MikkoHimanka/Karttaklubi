from app import app
from flask import render_template, json, request, redirect, session, make_response, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy

import threading
import time

db = SQLAlchemy(app)
threads = {}

class timeThread(threading.Thread):
    def __init__(self, address, id):
        super(timeThread, self).__init__()
        self._stopper = threading.Event()
        self.elapsed = 0
        self.addr = address
        self.id = id

    def addTime(self):
        self.elapsed = 0

    def stopit(self):
        self._stopper.set()

    def stopped(self):
        return self._stopper.isSet()
    
    def run(self):
        while self.elapsed < 10:
            if self.stopped():
                return
            time.sleep(1)
            self.elapsed += 1
        
        set_editable_query = "UPDATE maps SET editable=true WHERE id=:id"
        db.session.execute(set_editable_query, {"id": self.id})
        db.session.commit()
        self._stopper.set()

class monitorThread(threading.Thread):
    def __init__(self):
        super(monitorThread, self).__init__()
        self._stopper = threading.Event()
        self.name = "monitor"
    
    def stopThread(self, name):
        if threads[name].stopped:
            threads[name].join()
            threads.pop(name)
            print("times up")

    def stopit(self):
        self._stopper.set()

    def stopped(self):
        return self._stopper.isSet()

    def run(self):
        elapsed = 1
        while True:
            if self.stopped():
                return
            
            if elapsed % 11 == 0:
                threadsToPop = []
                for t in threads:
                    if threads[t].stopped:
                        threadsToPop.append(t)
                for t in threadsToPop:
                    self.stopThread(t)
                threadsToPop.clear()
                
                elapsed = 1
            else:
                time.sleep(1)
                elapsed += 1     

monitori = monitorThread()
monitori.start()

@app.route("/add_time", methods=["POST"])
def add_time():
    if request.remote_addr in threads:
        threads[request.remote_addr].addTime()

        return jsonify(success=True)
    else: return jsonify(success=False)

@app.route("/save_map", methods=["POST"])
def savemap():
    data = json.loads(request.form["data"])



    save_query = "UPDATE maps SET mapdata=:map_data WHERE id=:map_id"
    db.session.execute(save_query, {"map_data": data, "map_id":request.form["id"]})
    db.session.commit()


    return redirect("/")

@app.route("/maps/new_column/<int:mapcollection_id>")
def new_column(mapcollection_id):
    if not session:
        return redirect("/")

    map_array_query = "SELECT * FROM mapcollections WHERE id=:mapcollection_id"
    map_array = db.session.execute(map_array_query, {"mapcollection_id":mapcollection_id}).fetchone()
    map_new_array = map_array[2].copy()

    data = [0] * 256 * 256
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
    if not session:
        return redirect("/")

    map_array_query = "SELECT * FROM mapcollections WHERE id=:mapcollection_id"
    map_array = db.session.execute(map_array_query, {"mapcollection_id":mapcollection_id}).fetchone()
    map_row_size = len(map_array[2][0])
    map_new_rows = map_array[4] + 1
    map_new_array = map_array[2].copy()

    data = [0] * 256 * 256
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
    if not session:
        return redirect("/")

    if request.form["name"].strip() == "":
        response = make_response(redirect("/"))
        response.set_cookie("alert", "empty_mapname")
        return response

    data = [0] * 256 * 256
    new_map_query = "INSERT INTO maps (mapdata, editable) VALUES (:data, true) RETURNING id"
    map_id = db.session.execute(new_map_query, {"data":data}).fetchone()[0]
    

    
    new_mapcollections_query = "INSERT INTO mapcollections (owner, maps, rows, name, public, shared) VALUES (:user, ARRAY[:map_id], 1, :name, False, False)"
    mapcollection_id = db.session.execute(new_mapcollections_query, {"user": session["user_id"], "map_id": [map_id], "name": request.form["name"]})
    db.session.commit()
    
    return redirect("/")

@app.route("/maps/<int:map_id>")
def maps(map_id):
    if not session:
        return redirect("/")
    
    map_query = "SELECT maps, name, public, owner, shared FROM mapcollections WHERE id=:map_id"
    map_result = db.session.execute(map_query, {"map_id": map_id}).fetchone()
    
    if not map_result:
        return redirect("/")

    if not map_result[2] and not map_result[4] and map_result[3] != session["user_id"]:
        return redirect("/")

    mapcollection= map_result[0]
    map_title = map_result[1]
    maps = []
    editables = []
    
    for row in mapcollection:
        for m in row:
            submap_query = "SELECT id, mapdata, editable FROM maps WHERE id=:submap_id"
            submap_result = db.session.execute(submap_query, {"submap_id":m}).fetchone()
            maps.append(submap_result[1])
            editables.append(1) if submap_result[2] else editables.append(0)
    
    msg_query = "SELECT u.username, m.message, m.id FROM messages m LEFT JOIN users u ON m.author = u.id WHERE owner_id=:id AND m.submap=False ORDER BY m.time DESC"
    msg_result = db.session.execute(msg_query, {"id":map_id}).fetchall()

    return render_template("maps.jinja",
        mapcollection=mapcollection,
        submaps=maps,
        editables=editables,
        messages=msg_result,
        title=map_title,
        mapcollection_id=map_id,
        owner=map_result[3],
        public=map_result[2],
        shared=map_result[4],
        navigation="maps",
        msg_target_id=map_id)

@app.route("/editor/<int:map_id>")
def editor(map_id):
    if not session:
        return redirect("/")

    parent_query = "SELECT a.id, a.owner, a.shared, a.public FROM mapcollections a WHERE :id = ANY(a.maps)"
    parent_res = db.session.execute(parent_query, {"id": map_id}).fetchone()

    editable_query = "SELECT editable FROM maps WHERE id=:id"
    editable_res = db.session.execute(editable_query, {"id": map_id}).fetchone()
    print(editable_res)
    if not editable_res[0]:
        return redirect("/")

    allowed = parent_res[1] == session["user_id"]

    if not allowed and parent_res != None:
        allowed = parent_res[2]
                    
        if not allowed and parent_res[1] != session["user_id"]:
            if parent_res[3] == True:
                check_friends_q = "SELECT id FROM users WHERE id=:owner_id AND :user_id=ANY(friends)"
                check_result = db.session.execute(check_friends_q, {"owner_id": parent_res[1], "user_id": session["user_id"]}).fetchone()
                allowed = check_result != None

    if allowed:
        map_query = "SELECT mapdata FROM maps WHERE id=:id"
        res = db.session.execute(map_query, {"id": map_id}).fetchone()
        data = json.dumps(res[0])

        msg_query = "SELECT u.username, m.message, m.id FROM messages m LEFT JOIN users u ON m.author = u.id WHERE owner_id=:id AND submap=True ORDER BY m.time DESC"
        msg_result = db.session.execute(msg_query, {"id":map_id}).fetchall()

        threads[request.remote_addr] = timeThread(request.remote_addr, map_id)
        threads[request.remote_addr].start()

        set_editable_query = "UPDATE maps SET editable=False WHERE id=:id"
        db.session.execute(set_editable_query, {"id": map_id})
        db.session.commit()

        return render_template("editor.jinja",
            map_data=data,
            map_id=map_id,
            navigation="editor",
            parent=parent_res[0],
            messages=msg_result,
            msg_target_id=map_id)
    else:
        response = make_response(redirect("/"))
        response.set_cookie("alert", "no_map")
        return response



@app.route("/public/<int:map_id>", methods=["POST"])
def public(map_id):
    if not session:
        return jsonify(success=False)
    
    parent_query = "SELECT a.id, a.owner FROM mapcollections a WHERE id=:id"
    parent_res = db.session.execute(parent_query, {"id": map_id}).fetchone()

    allowed = parent_res[1] == session["user_id"]

    if allowed:
        public_query = "UPDATE mapcollections SET public = NOT public WHERE id = :map_id"
        db.session.execute(public_query, {"map_id": map_id})
        db.session.commit()

        return jsonify(success=True)
    else: return jsonify(success=False)

@app.route("/share/<int:map_id>", methods=["POST"])
def share(map_id):
    if not session:
        return jsonify(success=False)

    parent_query = "SELECT a.id, a.owner FROM mapcollections a WHERE id=:id"
    parent_res = db.session.execute(parent_query, {"id": map_id}).fetchone()

    allowed = parent_res[1] == session["user_id"]

    if allowed:
        public_query = "UPDATE mapcollections SET shared = NOT shared WHERE id = :map_id"
        db.session.execute(public_query, {"map_id": map_id})
        db.session.commit()

        return jsonify(success=True)
    else: return jsonify(success=False)