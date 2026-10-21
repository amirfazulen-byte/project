from flask import Blueprint, render_template

from .auth import role_required

bp = Blueprint("student", __name__)


@bp.route("/schedule")
@role_required("student")
def schedule():
    return render_template("stub.html", title="Расписание")
