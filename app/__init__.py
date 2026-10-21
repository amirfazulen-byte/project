import os
from datetime import timedelta
from zoneinfo import ZoneInfo

from flask import Flask

TZ = ZoneInfo("Europe/Moscow")


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        DATABASE=os.path.join(app.instance_path, "svobodno.sqlite"),
        PERMANENT_SESSION_LIFETIME=timedelta(days=30),
    )
    os.makedirs(app.instance_path, exist_ok=True)

    from . import auth, db, owner, student, warden

    db.init_app(app)
    for module in (auth, student, warden, owner):
        app.register_blueprint(module.bp)
    return app
