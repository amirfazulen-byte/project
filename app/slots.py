"""Слоты и правила бронирования. Всё время — московское, без часового пояса,
в базе хранится строкой 'ГГГГ-ММ-ДД ЧЧ:ММ'."""
import sqlite3
from datetime import datetime, timedelta

from . import TZ

FMT = "%Y-%m-%d %H:%M"
DAYS_AHEAD = 7


def now():
    return datetime.now(TZ).replace(tzinfo=None)


def minutes(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def day_slots(resource, day):
    """Начала всех слотов ресурса в этот день; слот должен закончиться до закрытия."""
    midnight = datetime(day.year, day.month, day.day)
    t, close, step = minutes(resource["open_time"]), minutes(resource["close_time"]), resource["slot_minutes"]
    result = []
    while t + step <= close:
        result.append(midnight + timedelta(minutes=t))
        t += step
    return result


def booking_days():
    today = now().date()
    return [today + timedelta(days=i) for i in range(DAYS_AHEAD + 1)]


def in_window(start):
    """Не прошедшее время и не дальше чем на 7 дней вперёд."""
    current = now()
    return current < start <= current + timedelta(days=DAYS_AHEAD)


def book(db, user, resource, start):
    """Бронирует слот. Возвращает текст ошибки или None при успехе."""
    if resource["is_broken"]:
        return "Ресурс на ремонте, бронировать нельзя."
    if start not in day_slots(resource, start.date()):
        return "Такого слота нет."
    if not in_window(start):
        return "Можно бронировать только будущее время и не дальше чем на 7 дней."
    monday = start.date() - timedelta(days=start.weekday())
    # IMMEDIATE: проверка лимита и вставка идут одной транзакцией, без гонок.
    db.execute("BEGIN IMMEDIATE")
    try:
        count = db.execute(
            "SELECT COUNT(*) FROM bookings WHERE user_id = ? AND resource_id = ? AND start_at >= ? AND start_at < ?",
            (user["id"], resource["id"], monday.isoformat(), (monday + timedelta(days=7)).isoformat()),
        ).fetchone()[0]
        if count >= resource["weekly_limit"]:
            db.rollback()
            return f"Лимит исчерпан: не больше {resource['weekly_limit']} броней в неделю на «{resource['name']}»."
        db.execute(
            "INSERT INTO bookings (resource_id, user_id, start_at) VALUES (?, ?, ?)",
            (resource["id"], user["id"], start.strftime(FMT)),
        )
        db.commit()
    except sqlite3.IntegrityError:
        db.rollback()
        return "Этот слот уже заняли."
    return None
