CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT, password TEXT);
CREATE TABLE messages (id SERIAL PRIMARY KEY, message text, owner_id INT, time TIMESTAMP, author INT);
CREATE TABLE maps (id SERIAL PRIMARY KEY, mapdata INT[], editable BOOLEAN);
CREATE TABLE mapcollections (id SERIAL PRIMARY KEY, owner INT, maps INT[], name TEXT, rows INT);