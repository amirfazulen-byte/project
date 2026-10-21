import secrets
import sqlite3

import click
from flask import current_app, g
from werkzeug.security import generate_password_hash

CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    with current_app.open_resource("schema.sql") as f:
        get_db().executescript(f.read().decode("utf8"))


def new_school_code():
    """Случайный код интерната, которого ещё нет в базе."""
    db = get_db()
    while True:
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        if not db.execute("SELECT 1 FROM schools WHERE code = ?", (code,)).fetchone():
            return code


@click.command("init-db")
def init_db_command():
    """Создать базу заново (все данные удаляются)."""
    init_db()
    click.echo("База создана.")


@click.command("create-owner")
@click.argument("login")
@click.password_option(prompt="Пароль")
def create_owner_command(login, password):
    """Создать аккаунт владельца сайта."""
    db = get_db()
    db.execute(
        "INSERT INTO users (role, name, login, password_hash) VALUES ('owner', ?, ?, ?)",
        (login, login, generate_password_hash(password)),
    )
    db.commit()
    click.echo(f"Владелец {login} создан.")


@click.command("create-school")
@click.argument("name")
def create_school_command(name):
    """Создать интернат (для проверки до появления панели владельца)."""
    db = get_db()
    code = new_school_code()
    db.execute("INSERT INTO schools (name, code) VALUES (?, ?)", (name, code))
    db.commit()
    click.echo(f"Интернат «{name}» создан, код: {code}")


@click.command("add-resource")
@click.argument("code")
@click.argument("name")
@click.option("--minutes", default=60, help="Длительность слота")
@click.option("--open", "open_time", default="07:00")
@click.option("--close", "close_time", default="22:00")
@click.option("--limit", default=3, help="Броней в неделю на человека")
def add_resource_command(code, name, minutes, open_time, close_time, limit):
    """Добавить ресурс интернату (для проверки до появления панели воспитателя)."""
    db = get_db()
    school = db.execute("SELECT id FROM schools WHERE code = ?", (code.upper(),)).fetchone()
    if not school:
        raise click.ClickException("Нет интерната с таким кодом.")
    db.execute(
        "INSERT INTO resources (school_id, name, slot_minutes, open_time, close_time, weekly_limit)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (school["id"], name, minutes, open_time, close_time, limit),
    )
    db.commit()
    click.echo(f"Ресурс «{name}» добавлен.")


@click.command("create-warden")
@click.argument("code")
@click.argument("login")
@click.argument("name")
@click.password_option(prompt="Пароль")
def create_warden_command(code, login, name, password):
    """Создать воспитателя (для проверки до появления панели владельца)."""
    db = get_db()
    school = db.execute("SELECT id FROM schools WHERE code = ?", (code.upper(),)).fetchone()
    if not school:
        raise click.ClickException("Нет интерната с таким кодом.")
    db.execute(
        "INSERT INTO users (school_id, role, name, login, password_hash) VALUES (?, 'warden', ?, ?, ?)",
        (school["id"], name, login, generate_password_hash(password)),
    )
    db.commit()
    click.echo(f"Воспитатель {login} создан.")


def init_app(app):
    app.teardown_appcontext(close_db)
    for command in (init_db_command, create_owner_command, create_school_command, add_resource_command,
                    create_warden_command):
        app.cli.add_command(command)
