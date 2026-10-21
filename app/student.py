from datetime import date, datetime

from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from . import slots
from .auth import role_required
from .db import get_db

bp = Blueprint("student", __name__)

WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]


@bp.app_template_filter("day_label")
def day_label(day):
    diff = (day - slots.now().date()).days
    return {0: "Сегодня", 1: "Завтра"}.get(diff, f"{WEEKDAYS[day.weekday()]}, {day:%d.%m}")


@bp.app_template_filter("slot_label")
def slot_label(start_at):
    start = datetime.strptime(start_at, slots.FMT)
    return f"{day_label(start.date())}, {start:%H:%M}"


@bp.route("/schedule")
@role_required("student")
def schedule():
    db = get_db()
    resources = db.execute(
        "SELECT * FROM resources WHERE school_id = ? ORDER BY name", (g.user["school_id"],)
    ).fetchall()
    days = slots.booking_days()
    try:
        day = date.fromisoformat(request.args.get("d", ""))
    except ValueError:
        day = None
    if day not in days:
        day = days[0]
    resource = next((r for r in resources if str(r["id"]) == request.args.get("r")), resources[0] if resources else None)

    day_slots = []
    if resource:
        taken = dict(db.execute(
            "SELECT start_at, user_id FROM bookings WHERE resource_id = ? AND start_at LIKE ?",
            (resource["id"], day.isoformat() + "%"),
        ).fetchall())
        for start in slots.day_slots(resource, day):
            key = start.strftime(slots.FMT)
            if key in taken:
                state = "mine" if taken[key] == g.user["id"] else "busy"
            elif resource["is_broken"] or not slots.in_window(start):
                state = "off"
            else:
                state = "free"
            day_slots.append((start, key, state))
    return render_template(
        "student/schedule.html", resources=resources, resource=resource, days=days, day=day, day_slots=day_slots
    )


@bp.route("/book", methods=("POST",))
@role_required("student")
def book():
    db = get_db()
    resource = db.execute(
        "SELECT * FROM resources WHERE id = ? AND school_id = ?",
        (request.form.get("resource", type=int), g.user["school_id"]),
    ).fetchone()
    try:
        start = datetime.strptime(request.form.get("start", ""), slots.FMT)
    except ValueError:
        start = None
    if not resource or not start:
        abort(400)
    error = slots.book(db, g.user, resource, start)
    flash(error or f"Готово: {resource['name']}, {slot_label(start.strftime(slots.FMT))}.")
    return redirect(url_for("student.schedule", r=resource["id"], d=start.date().isoformat()))


@bp.route("/my")
@role_required("student")
def my():
    bookings = get_db().execute(
        "SELECT b.id, b.start_at, r.name FROM bookings b JOIN resources r ON r.id = b.resource_id"
        " WHERE b.user_id = ? AND b.start_at >= ? ORDER BY b.start_at",
        (g.user["id"], slots.now().date().isoformat()),
    ).fetchall()
    return render_template("student/my.html", bookings=bookings, now_key=slots.now().strftime(slots.FMT))


@bp.route("/my/<int:booking_id>/cancel", methods=("POST",))
@role_required("student")
def cancel(booking_id):
    db = get_db()
    cur = db.execute(
        "DELETE FROM bookings WHERE id = ? AND user_id = ? AND start_at > ?",
        (booking_id, g.user["id"], slots.now().strftime(slots.FMT)),
    )
    db.commit()
    flash("Бронь отменена." if cur.rowcount else "Эту бронь уже нельзя отменить.")
    return redirect(url_for("student.my"))
