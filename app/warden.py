from flask import Blueprint, render_template

from .auth import role_required

bp = Blueprint("warden", __name__, url_prefix="/warden")


@bp.route("/")
@role_required("warden")
def panel():
    return render_template("stub.html", title="Панель воспитателя")
