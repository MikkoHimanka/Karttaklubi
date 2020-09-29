from flask import Flask
from flask import render_template, redirect, request, session, url_for, json

from os import getenv


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]= False
app.secret_key = getenv("SECRET_KEY")


import routes.user_router
import routes.maps_router
import routes.messages_router