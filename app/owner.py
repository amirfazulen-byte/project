import sqlite3

from flask import Blueprint, flash, g, redirect, render_template, request, url_for
from werkzeug.security import generate_password_hash

from . import slots
from .auth import HOME, role_required
from .db import get_db, new_school_code

bp = Blueprint("owner", __name__)


@bp.route("/", methods=("GET", "POST"))
def index():
    if request.method == "POST":
        values = [request.form.get(k, "").strip() for k in ("school_name", "contact_name", "contact")]
        if not all(values) or max(map(len, values)) > 200:
            flash("Заполните все поля заявки.")
        else:
            db = get_db()
            db.execute(
                "INSERT INTO requests (school_name, contact_name, contact, created_at) VALUES (?, ?, ?, ?)",
                (*values, slots.now().strftime(slots.FMT)),
            )
            db.commit()
            flash("Спасибо! Заявка отправлена, мы свяжемся с вами.")
            return redirect(url_for("owner.index"))
    elif g.user:
        return redirect(url_for(HOME[g.user["role"]]))
    return render_template("index.html")


@bp.route("/owner/")
@role_required("owner")
def panel():
    db = get_db()
    schools = db.execute(
        "SELECT s.*, (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') AS students"
        " FROM schools s ORDER BY s.name"
    ).fetchall()
    wardens = db.execute(
        "SELECT u.name, u.login, s.name AS school FROM users u JOIN schools s ON s.id = u.school_id"
        " WHERE u.role = 'warden' ORDER BY s.name, u.name"
    ).fetchall()
    reqs = db.execute("SELECT * FROM requests ORDER BY id DESC").fetchall()
    return render_template("owner/panel.html", schools=schools, wardens=wardens, reqs=reqs)


@bp.route("/owner/schools", methods=("POST",))
@role_required("owner")
def add_school():
    name = request.form.get("name", "").strip()
    if not name:
        flash("Введите название интерната.")
    else:
        db = get_db()
        code = new_school_code()
        db.execute("INSERT INTO schools (name, code) VALUES (?, ?)", (name, code))
        db.commit()
        flash(f"Интернат «{name}» создан, код: {code}")
    return redirect(url_for("owner.panel"))


@bp.route("/owner/wardens", methods=("POST",))
@role_required("owner")
def add_warden():
    f = request.form
    name, login, password = f.get("name", "").strip(), f.get("login", "").strip(), f.get("password", "")
    db = get_db()
    school = db.execute("SELECT id FROM schools WHERE id = ?", (f.get("school", type=int),)).fetchone()
    if not school or not name or not login:
        flash("Выберите интернат и заполните имя и логин.")
    elif len(password) < 6:
        flash("Пароль воспитателя — от 6 символов.")
    else:
        try:
            db.execute(
                "INSERT INTO users (school_id, role, name, login, password_hash) VALUES (?, 'warden', ?, ?, ?)",
                (school["id"], name, login, generate_password_hash(password)),
            )
            db.commit()
        except sqlite3.IntegrityError:
            flash("Такой логин уже занят.")
        else:
            flash(f"Воспитатель {name} создан, логин: {login}")
    return redirect(url_for("owner.panel"))
