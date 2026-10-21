from datetime import date, datetime

from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from . import slots
from .auth import role_required
from .db import get_db, new_school_code

bp = Blueprint("warden", __name__, url_prefix="/warden")

DEFAULTS = {"name": "", "slot_minutes": 60, "open_time": "07:00", "close_time": "22:00", "weekly_limit": 3}


def get_resource(resource_id):
    resource = get_db().execute(
        "SELECT * FROM resources WHERE id = ? AND school_id = ?", (resource_id, g.user["school_id"])
    ).fetchone()
    if resource is None:
        abort(404)
    return resource


def read_resource_form():
    """Возвращает (данные формы, текст ошибки или None)."""
    f = request.form
    data = {
        "name": f.get("name", "").strip(),
        "slot_minutes": f.get("slot_minutes", type=int),
        "open_time": f.get("open_time", ""),
        "close_time": f.get("close_time", ""),
        "weekly_limit": f.get("weekly_limit", type=int),
    }
    try:
        for key in ("open_time", "close_time"):
            data[key] = datetime.strptime(data[key], "%H:%M").strftime("%H:%M")
    except ValueError:
        return data, "Укажите часы работы в формате ЧЧ:ММ."
    if not data["name"]:
        return data, "Введите название."
    if not data["slot_minutes"] or not 5 <= data["slot_minutes"] <= 720:
        return data, "Длительность слота — от 5 до 720 минут."
    if not data["weekly_limit"] or not 1 <= data["weekly_limit"] <= 50:
        return data, "Лимит в неделю — от 1 до 50."
    if slots.minutes(data["open_time"]) + data["slot_minutes"] > slots.minutes(data["close_time"]):
        return data, "Закрытие должно быть позже открытия хотя бы на один слот."
    return data, None


@bp.route("/")
@role_required("warden")
def panel():
    db = get_db()
    school = db.execute("SELECT * FROM schools WHERE id = ?", (g.user["school_id"],)).fetchone()
    resources = db.execute(
        "SELECT * FROM resources WHERE school_id = ? ORDER BY name", (g.user["school_id"],)
    ).fetchall()
    return render_template("warden/panel.html", school=school, resources=resources)


@bp.route("/code", methods=("POST",))
@role_required("warden")
def change_code():
    db = get_db()
    code = new_school_code()
    db.execute("UPDATE schools SET code = ? WHERE id = ?", (code, g.user["school_id"]))
    db.commit()
    flash(f"Новый код интерната: {code}")
    return redirect(url_for("warden.panel"))


@bp.route("/resource/new", methods=("GET", "POST"))
@bp.route("/resource/<int:resource_id>", methods=("GET", "POST"))
@role_required("warden")
def resource_form(resource_id=None):
    resource = get_resource(resource_id) if resource_id else None
    data = dict(resource) if resource else DEFAULTS
    if request.method == "POST":
        data, error = read_resource_form()
        if error:
            flash(error)
        else:
            db = get_db()
            values = (data["name"], data["slot_minutes"], data["open_time"], data["close_time"], data["weekly_limit"])
            if resource:
                db.execute(
                    "UPDATE resources SET name = ?, slot_minutes = ?, open_time = ?, close_time = ?, weekly_limit = ?"
                    " WHERE id = ?",
                    values + (resource["id"],),
                )
            else:
                db.execute(
                    "INSERT INTO resources (name, slot_minutes, open_time, close_time, weekly_limit, school_id)"
                    " VALUES (?, ?, ?, ?, ?, ?)",
                    values + (g.user["school_id"],),
                )
            db.commit()
            flash(f"Сохранено: {data['name']}.")
            return redirect(url_for("warden.panel"))
    return render_template("warden/resource_form.html", resource=resource, data=data)


@bp.route("/resource/<int:resource_id>/repair", methods=("POST",))
@role_required("warden")
def toggle_repair(resource_id):
    resource = get_resource(resource_id)
    db = get_db()
    db.execute("UPDATE resources SET is_broken = ? WHERE id = ?", (0 if resource["is_broken"] else 1, resource["id"]))
    db.commit()
    flash(f"«{resource['name']}» " + ("снова работает." if resource["is_broken"] else "на ремонте, новые брони закрыты."))
    return redirect(url_for("warden.panel"))


@bp.route("/bookings")
@role_required("warden")
def bookings():
    try:
        day = date.fromisoformat(request.args.get("d", ""))
    except ValueError:
        day = slots.now().date()
    rows = get_db().execute(
        "SELECT b.id, b.start_at, r.name AS resource, u.name, u.room FROM bookings b"
        " JOIN resources r ON r.id = b.resource_id JOIN users u ON u.id = b.user_id"
        " WHERE r.school_id = ? AND b.start_at LIKE ? ORDER BY b.start_at, r.name",
        (g.user["school_id"], day.isoformat() + "%"),
    ).fetchall()
    return render_template("warden/bookings.html", day=day, bookings=rows)


@bp.route("/bookings/<int:booking_id>/cancel", methods=("POST",))
@role_required("warden")
def cancel(booking_id):
    db = get_db()
    cur = db.execute(
        "DELETE FROM bookings WHERE id = ? AND resource_id IN (SELECT id FROM resources WHERE school_id = ?)",
        (booking_id, g.user["school_id"]),
    )
    db.commit()
    flash("Бронь отменена." if cur.rowcount else "Бронь не найдена.")
    return redirect(url_for("warden.bookings", d=request.form.get("d")))
