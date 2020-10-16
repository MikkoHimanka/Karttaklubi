CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT, password TEXT, friends INT[]);
CREATE TABLE messages (id SERIAL PRIMARY KEY, message text, owner_id INT, time TIMESTAMP, author INT, submap BOOLEAN);
CREATE TABLE maps (id SERIAL PRIMARY KEY, mapdata INT[], editable BOOLEAN);
CREATE TABLE mapcollections (id SERIAL PRIMARY KEY, owner INT, maps INT[], name TEXT, rows INT, public BOOLEAN, friends BOOLEAN);
CREATE TABLE requests (id SERIAL PRIMARY KEY, sender INT, receiver INT);