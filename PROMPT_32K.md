Ты — опытный Python-разработчик. Сделай веб-сайт «Свободно?» строго по этому описанию. Если что-то указано точно (имя файла, поле формы, текст сообщения, формат времени, порядок проверок, CSS) — делай именно так. Чего нет в описании — не придумывай, а спроси меня.

# 1. Суть
**Проблема:** в школьных интернатах жильцы делят стиральные машины, комнаты для самоподготовки, спортзал. Очередь держится на чатах и бумажках — споры и пропуски.
**Решение:** ученик с телефона за несколько секунд находит свободное время у нужного ресурса и бронирует его одним нажатием. Воспитатель настраивает ресурсы и видит все брони. Владелец сайта подключает интернаты. Сайт для конкурса по технологическому предпринимательству: простой, надёжный, красивый на демонстрации.

# 2. Роли
Сайт поддерживает несколько интернатов; у каждого свои ресурсы, жильцы, воспитатели и код регистрации.
- **Ученик** (`student`): расписание своего интерната, бронь, свои брони, отмена своих ещё не начавшихся. Вход: код интерната + имя + комната + пароль.
- **Воспитатель** (`warden`): в своём интернате добавляет/меняет ресурсы, ставит «на ремонт», видит брони на любой день, отменяет любую (и прошедшую), видит и меняет код. Вход: логин + пароль.
- **Владелец** (`owner`): создаёт интернаты и аккаунты воспитателей, видит заявки с главной. Не привязан к интернату. Вход: логин + пароль.
- **Гость:** главная, заявка «Подключить интернат», регистрация, вход.

**Ученик и воспитатель никогда не видят и не меняют данные чужого интерната:** каждый их запрос к базе фильтруется по `school_id`.

# 3. Технологии и ограничения
- Python 3.10+, Flask 3, SQLite через стандартный `sqlite3` (без ORM), Jinja2 (автоэкранирование, файлы `.html`), один CSS-файл без фреймворков, сборщиков и npm.
- JavaScript — только два `onsubmit="return confirm('...')"` (раздел 11). Без JS-библиотек и `onclick`.
- Пароли — только хэш: `werkzeug.security.generate_password_hash`/`check_password_hash`. CSRF — вручную, без Flask-WTF.
- Время — московское, `zoneinfo` (`Europe/Moscow`).
- `requirements.txt` — ровно две строки: `Flask>=3.0` и `tzdata` (нужен для `zoneinfo` на Windows).
- Интерфейс на русском. Исключение — стандартные страницы ошибок Flask для `abort(400/403/404)`: свои шаблоны ошибок и `errorhandler` не делать.
- О жильцах хранить только имя и номер комнаты.

# 4. Файлы
```
app/__init__.py   create_app(), настройки, TZ
app/db.py         подключение, init-db, код интерната, CLI
app/schema.sql
app/auth.py       регистрация, вход, выход, g.user, CSRF, role_required
app/slots.py      слоты и правила брони
app/student.py    расписание, бронь, мои брони, фильтры шаблонов
app/warden.py     панель воспитателя
app/owner.py      главная с заявкой, панель владельца
app/static/style.css
app/templates/base.html, index.html, stub.html (заглушка этапа 1)
app/templates/auth/_student_fields.html, login.html, register.html, staff_login.html
app/templates/student/schedule.html, my.html
app/templates/warden/panel.html, resource_form.html, bookings.html
app/templates/owner/panel.html
seed.py           демо-данные (этап 5)
requirements.txt
.gitignore        __pycache__/  instance/  .venv/
TZ.md             это задание
CLAUDE.md         краткая памятка и этапы с отметками
```
База — `instance/svobodno.sqlite`. Тестовые скрипты запускай вне проекта и в репозиторий не добавляй.

# 5. `app/__init__.py`
Порядок: импорты (`os`, `timedelta`, `ZoneInfo`, `Flask`) → `TZ = ZoneInfo("Europe/Moscow")` → `create_app()`:
- `Flask(__name__, instance_relative_config=True)`;
- `config.from_mapping(SECRET_KEY=os.environ.get("SECRET_KEY", "dev"), DATABASE=os.path.join(app.instance_path, "svobodno.sqlite"), PERMANENT_SESSION_LIFETIME=timedelta(days=30))`;
- `os.makedirs(app.instance_path, exist_ok=True)`;
- **внутри функции** `from . import auth, db, owner, student, warden` (сверху нельзя: `slots.py` делает `from . import TZ` — будет циклический импорт); `db.init_app(app)`; `register_blueprint(module.bp)` для auth, student, warden, owner.
Запуск: `flask --app app run`.

# 6. База (`app/schema.sql`)
```sql
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS requests;
CREATE TABLE schools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);
-- у владельца school_id пустой; login есть у воспитателя и владельца
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'warden', 'owner')),
  name TEXT NOT NULL,
  room TEXT,
  login TEXT UNIQUE,
  password_hash TEXT NOT NULL
);
CREATE UNIQUE INDEX students_unique ON users (school_id, name, room) WHERE role = 'student';
CREATE TABLE resources (
  id INTEGER PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slot_minutes INTEGER NOT NULL CHECK (slot_minutes > 0),
  open_time TEXT NOT NULL,   -- 'ЧЧ:ММ'
  close_time TEXT NOT NULL,  -- 'ЧЧ:ММ'
  weekly_limit INTEGER NOT NULL DEFAULT 3 CHECK (weekly_limit > 0),
  is_broken INTEGER NOT NULL DEFAULT 0
);
-- start_at — московское время 'ГГГГ-ММ-ДД ЧЧ:ММ'; UNIQUE не даёт занять слот дважды
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (resource_id, start_at)
);
CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
- `get_db()`: обычный `sqlite3.connect(current_app.config["DATABASE"])` **без** `isolation_level`/`autocommit` (важно для раздела 9), `row_factory = sqlite3.Row`, сразу `PRAGMA foreign_keys = ON`; соединение в `g`, закрытие в `teardown_appcontext`. `init_db()` — `executescript` файла через `current_app.open_resource("schema.sql")`.
- **Отмена брони = удаление строки** — слот снова свободен.
- **Код интерната** — `new_school_code()`: 6 символов через `secrets` из алфавита `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, повторять, пока код не уникален.
- `requests.created_at` заполнять явно по Москве: `slots.now().strftime(slots.FMT)` (`CURRENT_TIMESTAMP` — UTC).

# 7. Вход, CSRF, сообщения (`app/auth.py`, блюпринт `auth` без префикса)
- `@bp.before_app_request`: `g.user` = строка `users` по `session["user_id"]` или `None`; если метод POST и (`session.get("csrf")` пуст или `request.form.get("csrf")` не совпадает) → `abort(400)`.
- `@bp.app_context_processor`: если в сессии нет `csrf` — положить `secrets.token_hex(16)`; вернуть `{"csrf": ...}`. В **каждой** POST-форме: `<input type="hidden" name="csrf" value="{{ csrf }}">`.
- `role_required(*roles)`: нет `g.user` → редирект на `auth.login`; чужая роль → `abort(403)`.
- `HOME = {"student": "student.schedule", "warden": "warden.panel", "owner": "owner.panel"}`.
- `log_in(user)`: `session.clear()`, `session.permanent = True`, `session["user_id"] = id`, редирект на `HOME[роль]` (старый CSRF-токен пропадает — в тестах бери новый после входа).

| URL | Методы | Поля |
|---|---|---|
| `/register` | GET, POST | `code`, `name`, `room`, `password` |
| `/login` | GET, POST | те же |
| `/staff` | GET, POST | `login`, `password` (воспитатель или владелец) |
| `/logout` | POST | `session.clear()`, редирект на `owner.index` |

Выход — только POST-кнопкой. `/login`, `/register`, `/staff` открываются и для вошедших. Параметра `next` нет.
Поля ученика: `code` — `strip().upper()`, `name`, `room` — `strip()`, пароль как есть.
**`/register`** по порядку: нет интерната → «Неверный код интерната.»; пустые имя/комната или пароль < 4 → «Заполните имя и комнату, пароль — от 4 символов.»; `IntegrityError` → «Жилец с таким именем и комнатой уже зарегистрирован.»; успех → `log_in`.
**`/login`**: JOIN `users`+`schools` по `s.code`, `role='student'`, `name`, `room`, затем проверка хэша; иначе «Неверные данные для входа.»
**`/staff`**: по `login` (`strip()`) среди `warden`/`owner`; иначе «Неверный логин или пароль.»
**Сообщения на всём сайте — только `flash()`.** Ошибка в `/register`, `/login`, `/staff`, заявке на `/` и форме ресурса → `flash` + `render_template` той же страницы (код 200, значения из `request.form`, пароль никогда). Успех → редирект. `/book`, `/my/<id>/cancel`, `/warden/code`, `/warden/resource/<id>/repair`, `/warden/bookings/<id>/cancel`, `/owner/schools`, `/owner/wardens` всегда `flash` + редирект.

# 8. Время
Всё — московское naive-время: `slots.now()` = `datetime.now(TZ).replace(tzinfo=None)`. В базе слот — строка `FMT = "%Y-%m-%d %H:%M"` (`2026-10-22 07:00`); такие строки сравниваются как строки (`>`, `>= '2026-10-22'`, `LIKE '2026-10-22%'`). Часы работы — `ЧЧ:ММ`, `minutes("07:30") → 450`.

# 9. Правила брони (`app/slots.py`)
`FMT`, `DAYS_AHEAD = 7`.
- `day_slots(resource, day)`: от `open_time` с шагом `slot_minutes`; слот берётся, если `t + шаг <= close_time`. Спортзал 08:00–21:00 по 90 → 08:00, 09:30, 11:00, 12:30, 14:00, 15:30, 17:00, 18:30. Стирка 07:00–22:00 по 60 → 15 слотов 07:00…21:00.
- `booking_days()`: сегодня + 7 дней (8 дат).
- `in_window(start)`: `сейчас < start <= сейчас + 7 дней`.
- `book(db, user, resource, start)` → текст ошибки или `None`. По порядку (первые три — без запросов к базе):
  1. `is_broken` → «Ресурс на ремонте, бронировать нельзя.»
  2. `start` не в `day_slots` → «Такого слота нет.»
  3. не `in_window` → «Можно бронировать только будущее время и не дальше чем на 7 дней.»
  4. `db.execute("BEGIN IMMEDIATE")`, затем `try:` считаем брони пользователя на ресурс в **календарной неделе слота** (пн–вс): `start_at >= '<дата понедельника>' AND start_at < '<дата следующего понедельника>'`, включая прошедшие. `>= weekly_limit` → `rollback`, «Лимит исчерпан: не больше N броней в неделю на «Название».». Иначе `INSERT` + `commit`. `except sqlite3.IntegrityError` → `rollback`, «Этот слот уже заняли.»
  Двойную бронь физически не даёт `UNIQUE (resource_id, start_at)`, даже при одновременных нажатиях.
- **Защита сетки:** при редактировании ресурса, если новое `slot_minutes` или нормализованное `open_time` отличается от базы **и** есть брони с `start_at >= '<сегодня>'` — не сохранять ничего, показать форму с введёнными значениями и «Длительность слота и время открытия нельзя менять, пока есть брони с сегодняшнего дня. Сначала отмените их.» (иначе сетка сдвинется и станут возможны пересекающиеся брони). Название, закрытие и лимит менять можно всегда.

# 10. Ученик (`app/student.py`, блюпринт `student` без префикса, всё `role_required("student")`)
Фильтры (`@bp.app_template_filter`):
- `day_label(date)`: разница с сегодня 0 → «Сегодня», 1 → «Завтра», иначе `f"{WEEKDAYS[d.weekday()]}, {d:%d.%m}"`, `WEEKDAYS = ["пн","вт","ср","чт","пт","сб","вс"]` (сегодня ср 21.10.2026 → 23.10 = «пт, 23.10»).
- `slot_label("2026-10-22 07:00")` → «Завтра, 07:00».

**`/schedule`** (GET, `r` — id ресурса, `d` — дата):
- ресурсы интерната `ORDER BY name`; `d` не дата или не в `booking_days()` → сегодня; `r` не найден → первый ресурс;
- нет ресурсов → только «В интернате пока нет ресурсов. Попросите воспитателя их добавить.»;
- `<h1>` нет; сначала два ряда чипсов: ресурсы (`?r=<id>&d=<текущий день>`) и 8 дней с `day_label` (`?r=<текущий>&d=<день>`), выбранный — `chip on`;
- ресурс на ремонте → `<p class="flash">«Название» на ремонте, бронировать нельзя.</p>`;
- занятость одним запросом (`start_at LIKE 'день%'`) → словарь `start_at → user_id`. Состояние слота **строго по порядку**: есть бронь → «моё» (моя) или «занято» (чужая; кто — не показывать), даже если время прошло или ремонт; иначе ремонт или не `in_window` → «недоступно»; иначе «свободно». Только «свободно» — кнопка-форма POST `/book` (скрытые `csrf`, `resource`, `start`), **бронь в одно нажатие без подтверждения**; остальные — `<div>`.

**`/book`** (POST): ресурс по `request.form.get("resource", type=int)` **и** `school_id`; `start` по `FMT`; не найдено/не разобралось → `abort(400)`. `slots.book(...)` → ошибка или «Готово: Название, Завтра, 07:00.» (через `slot_label`). Редирект `/schedule?r=<id>&d=<дата слота>`.

**`/my`** (GET): брони ученика с `start_at >= '<сегодня>'`, `ORDER BY b.start_at`; строка: название жирным, ниже `slot_label`. «Отменить» (POST-форма с `csrf`, без подтверждения) — только если `start_at > now_key` (`slots.now().strftime(FMT)`, передаётся в шаблон). Пусто → «Броней нет.» + ссылка «Открыть расписание».

**`/my/<id>/cancel`** (POST): `DELETE ... WHERE id = ? AND user_id = <я> AND start_at > <now_key>` → «Бронь отменена.» или «Эту бронь уже нельзя отменить.»; редирект `/my`.

# 11. Воспитатель (`app/warden.py`, префикс `/warden`, всё `role_required("warden")`)
`get_resource(id)` — по `id` и `school_id`, иначе `abort(404)`.

**`/warden/`**: `<h1>` — название интерната. Карточка: «Код для регистрации жильцов: `<b class="code">КОД</b>`» и POST-форма `/warden/code` с `onsubmit="return confirm('Сменить код? Жильцы будут входить и регистрироваться с новым кодом.')"` и `<button class="link">Сменить код</button>` (не `<a>`). `<h2>Ресурсы</h2>`, `<a class="btn">Добавить ресурс</a>`, список `ORDER BY name`: название жирным (+ `<span class="tag">на ремонте</span>`), ниже `<small>60 мин, 07:00–22:00, до 3 в неделю</small>`; справа `<div class="actions">`: ссылка «Изменить» и POST-форма `/repair` с кнопкой «На ремонт»/«Починили» (без подтверждения). Пусто → «Ресурсов пока нет.»

**`/warden/code`** (POST): `new_school_code()` → «Новый код интерната: КОД», редирект `/warden/`. Аккаунты жильцов прежние, но вход и регистрация — с новым кодом.

**`/warden/resource/new` и `/warden/resource/<id>`** (GET, POST; одна функция). По умолчанию: `""`, 60, `07:00`, `22:00`, 3. Поля: «Название» (`name`, `placeholder="Стиралка 1"`), «Длительность слота, минут» (`slot_minutes`, number 5–720), «Открытие»/«Закрытие» (`open_time`/`close_time`, `type="time"`), «Броней в неделю на человека» (`weekly_limit`, number 1–50). Чтение: `name` — `strip()`, числа — `request.form.get(..., type=int)` (мусор → `None`, без 500). Проверки по порядку:
1. оба времени через `strptime("%H:%M")`, нормализовать в `ЧЧ:ММ` → «Укажите часы работы в формате ЧЧ:ММ.»
2. пустое название → «Введите название.»
3. нет или вне 5–720 → «Длительность слота — от 5 до 720 минут.»
4. нет или вне 1–50 → «Лимит в неделю — от 1 до 50.»
5. `открытие + слот > закрытие` → «Закрытие должно быть позже открытия хотя бы на один слот.»
6. защита сетки (раздел 9).
Успех → «Сохранено: Название.», редирект `/warden/`. Кнопки «Сохранить» (`btn`) и ссылка «Отмена». **Удаления ресурсов нет.**

**`/warden/resource/<id>/repair`** (POST): переключить `is_broken` → ««Название» на ремонте, новые брони закрыты.» / ««Название» снова работает.»; редирект `/warden/`. Сделанные брони **не отменяются**.

**`/warden/bookings`** (GET, `d`, не дата → сегодня, можно любой день): `<h1>Брони: {{ day|day_label }}</h1>`, `<form method="get" class="day-pick">` с `<input type="date" name="d">` и кнопкой «Показать». JOIN bookings+resources+users, `r.school_id = ? AND start_at LIKE 'день%' ORDER BY b.start_at, r.name`. Строка: `<b>07:00</b> · Ресурс<br><small>Имя, комната 101</small>`, справа POST-форма отмены (скрытые `csrf`, `d`) с `onsubmit="return confirm('Отменить эту бронь?')"`. **Никаких пользовательских данных внутри JS** (апостроф в имени = XSS). Пусто → «В этот день броней нет.»

**`/warden/bookings/<id>/cancel`** (POST): `DELETE ... WHERE id = ? AND resource_id IN (SELECT id FROM resources WHERE school_id = <мой>)`, без ограничения по времени → «Бронь отменена.» / «Бронь не найдена.»; редирект `/warden/bookings?d=<d>`.

# 12. Главная и владелец (`app/owner.py`, без префикса)
**`/`** (GET, POST). GET от вошедшего → редирект на `HOME[роль]`. Для гостя:
1. `<section class="hero">`: `<h1>Свободно?</h1>`, `<p class="lead">Запись в стиралку, комнату для самоподготовки и спортзал интерната — с телефона за несколько секунд.</p>`, `<a class="btn">Войти</a>`, `<a class="btn ghost">Регистрация</a>`, ссылка «Подключить свой интернат» на `#connect`.
2. `<h2>Как это работает</h2>`, `<ol class="steps">`: «Воспитатель добавляет ресурсы и часы работы и сообщает жильцам код интерната.» / «Жилец регистрируется по коду, открывает расписание и видит свободное время.» / «Одно нажатие — и время за ним. Занять тот же слот второй раз нельзя.»
3. `<h2>Чем полезно интернату</h2>`, `<ul class="benefits">` (начало в `<b>`): «**Без споров.** Очередь видна всем вместо чатов и бумажек.» / «**Честно.** Воспитатель задаёт лимит броней в неделю на каждого жильца.» / «**Под контролем.** Воспитатель видит все брони на день, отменяет любую и отправляет технику «на ремонт».» / «**Минимум данных.** О жильцах храним только имя и номер комнаты.» / «**Ничего не нужно устанавливать.** Работает в браузере телефона.»
4. `<h2 id="connect">Подключить интернат</h2>`, форма `.card`: «Название интерната» (`school_name`), «Ваше имя» (`contact_name`), «Телефон или e-mail» (`contact`), все `required maxlength="200"`, кнопка «Отправить заявку».
POST: все поля после `strip()` непустые и ≤ 200, иначе «Заполните все поля заявки.»; успех → запись в `requests`, «Спасибо! Заявка отправлена, мы свяжемся с вами.», редирект `/`.

**`/owner/`** (`role_required("owner")`): `<h1>Панель владельца</h1>`, разделы `<h2>`:
1. «Интернаты»: форма (`name`, `maxlength="200"`, «Создать интернат»); список `ORDER BY s.name`: название жирным, `<small>жильцов: N</small>`, справа `<b class="code">`; N — `(SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') AS students`. Пусто → «Интернатов пока нет.»
2. «Воспитатели»: форма только если есть интернаты: `<select name="school">` (по алфавиту, value = id), «Имя» (`name`, maxlength 200), «Логин» (`login`, maxlength 50, `autocapitalize="none"`), «Пароль (от 6 символов)» (`password`, обычное текстовое поле, `minlength="6" autocomplete="off"` — владелец видит, что передаёт), «Создать воспитателя». Список `ORDER BY s.name, u.name`: имя жирным, `<small>Интернат · логин vos</small>`. Пусто → «Воспитателей пока нет.»
3. «Заявки с главной»: `ORDER BY id DESC`, название жирным, `<small>Имя · контакт · {{ created_at[:16]|slot_label }}</small>`. Пусто → «Заявок пока нет.»

**`/owner/schools`** (POST): `strip()`; пусто → «Введите название интерната.»; иначе «Интернат «Название» создан, код: КОД». Редирект `/owner/`.
**`/owner/wardens`** (POST): `name`, `login` — `strip()`, `school` — `type=int`. Нет интерната или пустые имя/логин → «Выберите интернат и заполните имя и логин.»; пароль < 6 → «Пароль воспитателя — от 6 символов.»; `IntegrityError` → «Такой логин уже занят.»; успех → «Воспитатель Имя создан, логин: vos». Редирект `/owner/`.

# 13. Шаблоны
**`base.html`:**
```html
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{% block title %}{{ title or "Свободно?" }}{% endblock %} — Свободно?</title>
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
<header class="top">
<a class="logo" href="{{ url_for('owner.index') }}">Свободно?</a>
<nav>
{% if g.user %}
  {% if g.user.role == 'student' %}
    <a href="{{ url_for('student.schedule') }}">Расписание</a>
    <a href="{{ url_for('student.my') }}">Мои брони</a>
  {% elif g.user.role == 'warden' %}
    <a href="{{ url_for('warden.panel') }}">Ресурсы</a>
    <a href="{{ url_for('warden.bookings') }}">Брони</a>
  {% else %}
    <a href="{{ url_for('owner.panel') }}">Панель</a>
  {% endif %}
  <form method="post" action="{{ url_for('auth.logout') }}" class="inline">
    <input type="hidden" name="csrf" value="{{ csrf }}">
    <button class="link">Выйти</button>
  </form>
{% else %}
  <a href="{{ url_for('auth.login') }}">Войти</a>
{% endif %}
</nav>
</header>
<main>
{% for message in get_flashed_messages() %}<p class="flash">{{ message }}</p>{% endfor %}
{% block content %}{% endblock %}
</main>
</body>
</html>
```
**Заголовки** (`title` / `h1`): `/` — «Бронирование в интернате» / «Свободно?»; `/login` — «Вход» / «Вход для жильцов»; `/register` — «Регистрация» / то же; `/staff` — «Вход для воспитателей» / то же; `/schedule` — «Расписание» / нет; `/my` — «Мои брони» / то же; `/warden/` — «Панель воспитателя» / название интерната; форма ресурса — «Новый ресурс» или сохранённое в базе название / то же; `/warden/bookings` — «Брони на день» / «Брони: <day_label>»; `/owner/` — «Панель владельца» / то же.

**Вход:** `auth/_student_fields.html` — скрытое `csrf` и поля «Код интерната» (`code`, `autocapitalize="characters"`), «Имя» (`name`), «Комната» (`room`, `inputmode="numeric"`), «Пароль» (`password`, `type="password"`); `login.html` и `register.html` подключают его через `{% include %}`. `login.html`: «Войти», под формой «Нет аккаунта? Регистрация» и ссылка «Вход для воспитателей». `register.html`: подсказка «Код интерната скажет воспитатель.», «Зарегистрироваться», «Уже есть аккаунт? Войти». `staff_login.html`: `login` (`autocapitalize="none"`), `password`, «Войти».

**Разметка:** формы — `<form method="post" class="card">`, поле — `<label>Подпись <input name="..." required></label>`, кнопка — `<button class="btn">`; все видимые поля `required`. Действия-ссылки («Выйти», «Отменить», «Сменить код», «На ремонт»/«Починили») — `<button class="link">` в отдельной POST-форме с `csrf`. Строка списка — `<div class="row"><div><b>главное</b><br><small>детали</small></div>…действие…</div>`. Слоты — `<div class="slots">`; свободный — форма с `<button class="slot free">07:00<small>свободно</small></button>`; остальные — `<div class="slot busy|mine|off">07:00<small>занято|моё|недоступно</small></div>`. Чипсы — `<nav class="chips">` с `<a class="chip">`.

**`app/static/style.css`** — ровно эти правила:
```css
:root{--accent:#1f7a4d;--bg:#f6f7f5;--text:#1d1f1e;--muted:#6b716e;--line:#dde1de}
*{box-sizing:border-box}
body{margin:0;font:16px/1.5 system-ui,sans-serif;background:var(--bg);color:var(--text)}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#fff;border-bottom:1px solid var(--line)}
.top nav{display:flex;gap:14px;align-items:center}
.logo{font-weight:700;color:var(--accent);text-decoration:none}
main{max-width:640px;margin:0 auto;padding:16px}
a{color:var(--accent)}
h1{font-size:1.5rem;margin:8px 0 16px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px}
label{display:block;margin-bottom:12px;font-size:.9rem;color:var(--muted)}
input,select{display:block;width:100%;margin-top:4px;padding:12px;font-size:1rem;border:1px solid var(--line);border-radius:8px;color:var(--text)}
.btn{display:inline-block;padding:12px 20px;font-size:1rem;border:0;border-radius:8px;background:var(--accent);color:#fff;text-decoration:none;cursor:pointer}
.flash{padding:10px 14px;border-radius:8px;background:#fff4d6}
.inline{display:inline;margin:0}
.chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px}
.chip{flex:none;padding:8px 14px;border:1px solid var(--line);border-radius:20px;background:#fff;color:var(--text);text-decoration:none;white-space:nowrap}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.slots form{margin:0}
.slot{display:block;width:100%;padding:12px 4px;border:1px solid var(--line);border-radius:10px;font:600 1rem system-ui,sans-serif;text-align:center;background:#fff;color:var(--text)}
.slot small{display:block;font-weight:400;font-size:.75rem}
.slot.free{border-color:var(--accent);color:var(--accent);cursor:pointer}
.slot.mine{background:var(--accent);border-color:var(--accent);color:#fff}
.slot.busy{background:#eceeed;color:var(--muted)}
.slot.off{opacity:.45}
.row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
h2{font-size:1.2rem;margin:24px 0 8px}
small{color:var(--muted)}
.row form{margin:0}
.actions{display:flex;gap:14px;align-items:center;flex:none}
.tag{font-size:.75rem;padding:2px 8px;border-radius:10px;background:#fde2df;color:#9b2c22}
.code{font-size:1.3rem;letter-spacing:2px}
.day-pick{display:flex;gap:8px;margin-bottom:8px}
.day-pick input{margin:0}
.hero{padding:16px 0 8px}
.hero h1{font-size:2rem;color:var(--accent);margin:0 0 8px}
.lead{font-size:1.15rem}
.btn.ghost{background:#fff;color:var(--accent);border:1px solid var(--accent)}
.steps,.benefits{padding-left:20px}
.steps li,.benefits li{margin-bottom:8px}
.link{background:none;border:0;padding:0;font:inherit;color:var(--accent);text-decoration:underline;cursor:pointer}
```
На этапе 5 можно доработать под телефон, не меняя дизайн: основные кнопки и слоты не ниже ~44px, без горизонтальной прокрутки на ширине 320–400px.

# 14. CLI (`app/db.py`, в `init_app`: `teardown_appcontext(close_db)` и `app.cli.add_command`)
- `init-db` — пересоздать базу (данные удаляются), «База создана.»
- `create-owner LOGIN` — пароль `@click.password_option(prompt="Пароль")`; `role='owner'`, `name = login`; «Владелец LOGIN создан.»
- Вспомогательные: `create-school "Название"` → «Интернат «Название» создан, код: КОД»; `add-resource КОД "Название" --minutes 60 --open 07:00 --close 22:00 --limit 3` (это значения по умолчанию, без проверок) → «Ресурс «Название» добавлен.»; `create-warden КОД логин "Имя"` (пароль как у owner) → «Воспитатель логин создан.» Код — `upper()`; нет интерната → `click.ClickException("Нет интерната с таким кодом.")`.

# 15. Демо-данные (`seed.py`, этап 5)
`python seed.py` печатает «Внимание: база будет создана заново, все старые данные удалятся.», без вопроса пересоздаёт базу через `create_app()`, `app_context()` и `init_db()` и заполняет:
- интернат «Демо-интернат» с фиксированным кодом `DEMO` (без `new_school_code()`);
- «Стиралка 1/2/3» — 60 мин, 07:00–22:00, лимит 2; «Комната самоподготовки 1/2» — 60 мин, 08:00–22:00, лимит 5; «Спортзал» — 90 мин, 08:00–21:00, лимит 3;
- владелец `admin`/`admin123`; воспитатель «Мария Ивановна» `vos`/`vos123`; ученики: «Аня», 101, `1111`; «Борис», 102, `2222`; «Вика», 103, `3333`;
- брони через `slots.book()` на первые слоты в окне (сегодня, иначе завтра): Аня — первый слот «Стиралки 1»; Борис — следующий слот «Стиралки 1» и первый слот «Спортзала»;
- заявка «Школа-интернат №1», «Ольга Петровна», «olga@example.com»;
- в конце печатает код и все логины/пароли.

# 16. Чего не делать и безопасность
- Не добавлять: удаление ресурсов, интернатов и аккаунтов, сброс пароля, почту, уведомления, `next`, свои страницы ошибок, API, тёмную тему, JS-библиотеки. Не перенаправлять вошедших с `/login`, `/register`, `/staff`. `confirm` — только в двух местах из раздела 11. `gunicorn` в `requirements.txt` не добавлять.
- Пароли — хэш (ученик ≥ 4, воспитатель ≥ 6). CSRF во всех POST, без токена → 400. SQL только с `?`. Чужой ресурс при брони → 400, в панели воспитателя → 404, чужая роль → 403. Автоэкранирование не отключать, `|safe` не использовать. Выход — POST. На сервере `SECRET_KEY` — из переменной окружения.

# 17. Критерии приёмки
Проверь сам временным скриптом вне проекта (`app.test_client()`, временная база) и покажи результат:
1. Регистрация с кодом в нижнем регистре работает; дубль имени и комнаты и неверный пароль дают свои сообщения.
2. POST без CSRF → 400.
3. Ученику `/warden/` и `/owner/` → 403; после выхода `/schedule` ведёт на вход.
4. Бронь → «Готово: …»; второй ученик на тот же слот → «Этот слот уже заняли.»
5. 10:30 при шаге 60 → «Такого слота нет.»; вчера и через 8 дней → сообщение про окно; спортзал: 18:30 есть, 20:00 нет.
6. Лимит 2: третья бронь той же недели → «Лимит исчерпан: …».
7. Гонка: 10 учеников одновременно (потоки + `threading.Barrier`, у каждого свой клиент) на один слот → ровно 1 успех, 9 «Этот слот уже заняли.»
8. Чужую бронь ученик не отменит, свою будущую — отменит.
9. Ремонт → бронь запрещена, плашка и «недоступно».
10. Воспитатель: добавление и изменение, ошибки формы (пустое название, закрытие раньше открытия, слот 3 минуты, время «7»), ремонт, брони дня с именем и комнатой, отмена; чужой воспитатель → 404 и не видит чужие брони.
11. При брони смена длительности/открытия запрещена, названия/закрытия/лимита — разрешена; после отмены брони смена длительности разрешена.
12. После смены кода со старым войти нельзя, с новым — можно.
13. Пустая заявка — ошибка; нормальная видна владельцу; `<script>` в заявке экранирован.
14. Владелец создаёт интернат и воспитателя; дубль логина, короткий пароль, несуществующий интернат — ошибки; новый воспитатель входит в свой интернат.
15. Вошедший на `/` попадает в свой раздел.
16. На ширине 360px нет горизонтальной прокрутки, слоты удобно нажимать.

# 18. Порядок работы
1. Сначала **без кода**: до 5 вопросов, затем план (файлы, таблицы, этапы) — жди моего «ок».
2. Сохрани задание в `TZ.md`, создай короткий `CLAUDE.md`: суть, стек, правила, ссылка на `TZ.md`, этапы с отметками.
3. Этапы: 1) каркас и вход (схема, регистрация, вход, роли, CSRF, заглушки `stub.html`); 2) ресурсы и бронирование; 3) панель воспитателя; 4) главная и панель владельца; 5) вёрстка под телефон и демо-данные.
4. После каждого этапа: проверь по разделу 17, обнови `CLAUDE.md`, сделай git-коммит, **остановись** и коротко напиши, что сделано и как проверить.
5. Меняй только нужные места, ничего сверх задания без согласия. Отвечай коротко и просто.
6. В конце напиши: как запустить на Windows и Mac (Python с галочкой «Add Python to PATH», `python -m venv .venv`, активация `.venv\Scripts\activate` / `source .venv/bin/activate`, `pip install -r requirements.txt`, `python seed.py`, `flask --app app run`, http://127.0.0.1:5000, с телефона — `--host 0.0.0.0` в той же Wi-Fi) и как выложить на недорогой хостинг, доступный в России (хостинг с Python, загрузка кода, зависимости, `pip install gunicorn` или WSGI-настройка хостинга, `SECRET_KEY`, HTTPS, резервная копия `instance/svobodno.sqlite`).
