from flask import Blueprint, render_template

from .auth import role_required

bp = Blueprint("owner", __name__)


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/owner/")
@role_required("owner")
def panel():
    return render_template("stub.html", title="Панель владельца")
