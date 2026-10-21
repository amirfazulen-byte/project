import functools
import secrets
import sqlite3

from flask import Blueprint, abort, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from .db import get_db

bp = Blueprint("auth", __name__)

HOME = {"student": "student.schedule", "warden": "warden.panel", "owner": "owner.panel"}


@bp.before_app_request
def load_user_and_check_csrf():
    user_id = session.get("user_id")
    g.user = get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone() if user_id else None
    if request.method == "POST":
        token = session.get("csrf")
        if not token or request.form.get("csrf") != token:
            abort(400)


@bp.app_context_processor
def inject_csrf():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return {"csrf": session["csrf"]}


def role_required(*roles):
    def decorator(view):
        @functools.wraps(view)
        def wrapped(**kwargs):
            if g.user is None:
                return redirect(url_for("auth.login"))
            if g.user["role"] not in roles:
                abort(403)
            return view(**kwargs)
        return wrapped
    return decorator


def log_in(user):
    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]
    return redirect(url_for(HOME[user["role"]]))


def student_form():
    f = request.form
    return f.get("code", "").strip().upper(), f.get("name", "").strip(), f.get("room", "").strip(), f.get("password", "")


@bp.route("/register", methods=("GET", "POST"))
def register():
    if request.method == "POST":
        code, name, room, password = student_form()
        db = get_db()
        school = db.execute("SELECT id FROM schools WHERE code = ?", (code,)).fetchone()
        if not school:
            flash("Неверный код интерната.")
        elif not name or not room or len(password) < 4:
            flash("Заполните имя и комнату, пароль — от 4 символов.")
        else:
            try:
                cur = db.execute(
                    "INSERT INTO users (school_id, role, name, room, password_hash) VALUES (?, 'student', ?, ?, ?)",
                    (school["id"], name, room, generate_password_hash(password)),
                )
                db.commit()
            except sqlite3.IntegrityError:
                flash("Жилец с таким именем и комнатой уже зарегистрирован.")
            else:
                return log_in(db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone())
    return render_template("auth/register.html")


@bp.route("/login", methods=("GET", "POST"))
def login():
    if request.method == "POST":
        code, name, room, password = student_form()
        user = get_db().execute(
            "SELECT u.* FROM users u JOIN schools s ON s.id = u.school_id"
            " WHERE s.code = ? AND u.role = 'student' AND u.name = ? AND u.room = ?",
            (code, name, room),
        ).fetchone()
        if user and check_password_hash(user["password_hash"], password):
            return log_in(user)
        flash("Неверные данные для входа.")
    return render_template("auth/login.html")


@bp.route("/staff", methods=("GET", "POST"))
def staff_login():
    if request.method == "POST":
        user = get_db().execute(
            "SELECT * FROM users WHERE login = ? AND role IN ('warden', 'owner')",
            (request.form.get("login", "").strip(),),
        ).fetchone()
        if user and check_password_hash(user["password_hash"], request.form.get("password", "")):
            return log_in(user)
        flash("Неверный логин или пароль.")
    return render_template("auth/staff_login.html")


@bp.route("/logout", methods=("POST",))
def logout():
    session.clear()
    return redirect(url_for("owner.index"))
