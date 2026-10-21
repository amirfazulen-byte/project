# Промпт для создания сайта «Свободно?»

> Скопируйте всё, что ниже линии, и отправьте нейросети, которая умеет писать код (лучше всего — агенту с доступом к файлам и терминалу: Claude Code, Cursor и т. п.).

---

Ты — опытный Python-разработчик. Сделай веб-сайт «Свободно?» строго по этому описанию. Описание подробное специально: если что-то указано точно (имя файла, имя поля формы, текст сообщения, формат времени, порядок проверок, CSS), делай именно так, символ в символ. Если чего-то в описании нет — не придумывай новых функций, а спроси меня.

## 1. Суть проекта

**Проблема.** В школьных интернатах жильцы делят общие ресурсы: стиральные машины, комнаты для самоподготовки, спортзал. Очередь держится на чатах и бумажках, отсюда споры и пропуски.

**Решение.** Сайт, на котором ученик с телефона за несколько секунд находит свободное время у нужного ресурса и бронирует его одним нажатием. Воспитатель настраивает ресурсы и видит все брони. Владелец сайта подключает новые интернаты.

**Главная функция:** ученик открывает сайт → сразу попадает в расписание → выбирает ресурс и день → нажимает на свободный слот → бронь готова. Всё должно быть удобно с телефона.

Сайт делается для конкурса по технологическому предпринимательству: он должен быть простым, надёжным и хорошо выглядеть на демонстрации.

## 2. Роли и права

Сайт поддерживает **несколько интернатов**. У каждого интерната свои ресурсы, жильцы, воспитатели и свой код для регистрации жильцов.

| Роль | Что может | Как входит |
|---|---|---|
| **Ученик** (`student`) | Смотрит расписание своего интерната, бронирует свободные слоты, видит свои брони, отменяет свои ещё не начавшиеся брони | Код интерната + имя + номер комнаты + пароль |
| **Воспитатель** (`warden`) | В своём интернате: добавляет и меняет ресурсы, ставит ресурс «на ремонт», видит все брони на любой день, отменяет любую бронь (в том числе прошедшую), видит и меняет код интерната | Логин + пароль |
| **Владелец сайта** (`owner`) | Создаёт интернаты, создаёт аккаунты воспитателей, видит заявки на подключение с главной. Не привязан ни к одному интернату | Логин + пароль |
| **Гость** (не вошёл) | Видит главную, отправляет заявку «Подключить интернат», регистрируется, входит | — |

Строгое правило: **воспитатель и ученик никогда не видят и не меняют данные чужого интерната.** Каждый запрос к базе от их имени фильтруется по `school_id` текущего пользователя.

## 3. Технологии и ограничения

- **Python 3.10+**, **Flask 3**, **SQLite** через стандартный модуль `sqlite3` (без SQLAlchemy и других ORM).
- Шаблоны **Jinja2** (встроены во Flask), автоэкранирование включено (у файлов расширение `.html`).
- **Обычный CSS** в одном файле, без фреймворков (без Bootstrap, Tailwind и т. п.), без сборщиков, без npm. Точный CSS — в разделе 13.
- JavaScript не используется, кроме ровно двух подтверждений `onsubmit="return confirm('...')"` (см. раздел 11). Никаких JS-библиотек и `onclick`.
- Пароли хранить **только как хэш**: `werkzeug.security.generate_password_hash` / `check_password_hash` (Werkzeug ставится вместе с Flask).
- Защиту форм от CSRF сделать **вручную** (без Flask-WTF), см. раздел 7.
- **Часовой пояс — московский** (`Europe/Moscow`) через стандартный `zoneinfo`.
- Файл `requirements.txt` — ровно две строки:
  ```
  Flask>=3.0
  tzdata
  ```
  (`tzdata` нужен, чтобы `zoneinfo` работал на Windows.)
- Интерфейс **на русском языке**. Единственное исключение — стандартные страницы ошибок Flask для `abort(400/403/404)`: свои шаблоны ошибок и `errorhandler` не делать.
- Из личных данных жильцов хранить **только имя и номер комнаты**. Никаких телефонов, почты, дат рождения.
- Не добавляй функций сверх описанных без моего согласия (см. раздел 16 «Чего не делать»).

## 4. Структура файлов

Создай ровно такую структуру:

```
app/
  __init__.py        — фабрика приложения create_app(), настройки, константа TZ
  db.py              — подключение к SQLite, init-db, генерация кода интерната, CLI-команды
  schema.sql         — схема базы
  auth.py            — регистрация, вход, выход, загрузка пользователя, CSRF, декоратор ролей
  slots.py           — расчёт слотов и правила бронирования
  student.py         — расписание, бронирование, мои брони, фильтры шаблонов
  warden.py          — панель воспитателя
  owner.py           — главная страница с заявкой и панель владельца
  static/
    style.css
  templates/
    base.html
    index.html
    stub.html                 — заглушка разделов на этапе 1 (в финале не используется)
    auth/
      _student_fields.html    — общие поля для входа и регистрации ученика
      login.html
      register.html
      staff_login.html
    student/
      schedule.html
      my.html
    warden/
      panel.html
      resource_form.html
      bookings.html
    owner/
      panel.html
seed.py              — демо-данные (этап 5)
requirements.txt
.gitignore           — три строки: __pycache__/  instance/  .venv/
TZ.md                — это задание
CLAUDE.md            — короткая памятка о проекте и список этапов с отметками
```

База лежит в папке `instance/` (стандартная папка Flask): `instance/svobodno.sqlite`. Тестовые скрипты для проверки (раздел 18) запускай отдельно, вне проекта, и в репозиторий не добавляй.

## 5. Настройки приложения (`app/__init__.py`)

Порядок в файле важен:
1. Импорты: `os`, `timedelta`, `ZoneInfo`, `Flask`.
2. `TZ = ZoneInfo("Europe/Moscow")` — константа уровня модуля, её импортирует `slots.py` (`from . import TZ`).
3. Функция `create_app()`:
   - `app = Flask(__name__, instance_relative_config=True)`;
   - `app.config.from_mapping(SECRET_KEY=os.environ.get("SECRET_KEY", "dev"), DATABASE=os.path.join(app.instance_path, "svobodno.sqlite"), PERMANENT_SESSION_LIFETIME=timedelta(days=30))` — сессия живёт 30 дней, чтобы ученику не входить каждый раз; на сервере обязательно задать свой длинный случайный `SECRET_KEY`;
   - `os.makedirs(app.instance_path, exist_ok=True)`;
   - **внутри функции** `from . import auth, db, owner, student, warden` (не в начале файла — иначе циклический импорт, ведь `slots.py` импортирует `TZ` из пакета);
   - `db.init_app(app)` и `app.register_blueprint(module.bp)` для `auth, student, warden, owner` по порядку.
- Запуск: `flask --app app run`.

## 6. База данных (`app/schema.sql`)

Используй именно эту схему (скрипт сначала удаляет таблицы — команда `init-db` создаёт базу с нуля):

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

-- У владельца school_id пустой. Логин есть у воспитателей и владельца,
-- ученик входит по коду интерната, имени и комнате.
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

-- start_at — московское время 'ГГГГ-ММ-ДД ЧЧ:ММ'. UNIQUE не даёт занять слот дважды.
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

Важные детали:
- Подключение `db.get_db()`: обычный `sqlite3.connect(current_app.config["DATABASE"])` — **без** `isolation_level=...` и `autocommit=...` (режим по умолчанию, это важно для транзакции из раздела 9); `row_factory = sqlite3.Row`; сразу `PRAGMA foreign_keys = ON`. Соединение хранится в `flask.g` (одно на запрос) и закрывается в `app.teardown_appcontext`.
- `init_db()` выполняет `schema.sql` через `executescript` (файл читается через `current_app.open_resource("schema.sql")`).
- **Отмена брони = удаление строки** из `bookings`. Тогда слот снова свободен, а `UNIQUE (resource_id, start_at)` продолжает работать.
- **Код интерната**: 6 случайных символов из алфавита `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (без похожих I, O, 0, 1), через модуль `secrets`. Функция `new_school_code()` в `db.py` генерирует код, пока не найдёт такой, которого нет в базе.
- `requests.created_at` при вставке заполнять **явно московским временем** в формате `ГГГГ-ММ-ДД ЧЧ:ММ` (`slots.now().strftime(slots.FMT)`), не полагаясь на `CURRENT_TIMESTAMP` (он в UTC).

## 7. Вход, сессии, CSRF, сообщения (`app/auth.py`)

Блюпринт `auth` без префикса URL.

**Загрузка пользователя и проверка CSRF** — одна функция с `@bp.before_app_request`:
1. Берёт `user_id` из `session`, загружает строку из `users` в `g.user` (или `None`).
2. Если метод запроса `POST`: берёт `session.get("csrf")`; если токена нет или `request.form.get("csrf")` с ним не совпадает — `abort(400)`.

**Выдача токена** — `@bp.app_context_processor`: если в сессии нет `csrf`, кладёт туда `secrets.token_hex(16)`; возвращает `{"csrf": session["csrf"]}`. В **каждой** POST-форме сайта есть `<input type="hidden" name="csrf" value="{{ csrf }}">`.

**Декоратор `role_required(*roles)`**: если `g.user` нет — редирект на `auth.login`; если роль не входит в `roles` — `abort(403)`.

**Куда вести после входа:**
```python
HOME = {"student": "student.schedule", "warden": "warden.panel", "owner": "owner.panel"}
```

**`log_in(user)`**: `session.clear()`, `session.permanent = True`, `session["user_id"] = user["id"]`, редирект на `url_for(HOME[роль])`. После `session.clear()` старый CSRF-токен пропадает, новый выдаётся на следующей странице — это нормально (в тестах бери свежий токен после входа).

**Маршруты:**

| URL | Методы | Что делает |
|---|---|---|
| `/register` | GET, POST | Регистрация ученика: поля `code`, `name`, `room`, `password` |
| `/login` | GET, POST | Вход ученика: те же 4 поля |
| `/staff` | GET, POST | Вход воспитателя или владельца: поля `login`, `password` |
| `/logout` | POST | `session.clear()`, редирект на главную `owner.index` |

Выход — только POST (кнопка в маленькой форме в шапке), не ссылка. Страницы `/login`, `/register`, `/staff` открываются как обычно, даже если пользователь уже вошёл (новый вход заменяет сессию). Параметра `next` нет: после входа — всегда `HOME[роль]`.

**Поля ученика** (общая функция для `/register` и `/login`): `code` — `strip().upper()` (регистр не важен), `name` и `room` — `strip()`, `password` — как есть.

**Регистрация `/register` (POST)**, проверки по порядку:
1. Нет интерната с таким кодом → «Неверный код интерната.»
2. Пустое имя, пустая комната или пароль короче 4 символов → «Заполните имя и комнату, пароль — от 4 символов.»
3. Вставка в `users` с ролью `student`. Если сработал уникальный индекс (`sqlite3.IntegrityError`) → «Жилец с таким именем и комнатой уже зарегистрирован.»
4. Успех → сразу `log_in` → «Расписание».

**Вход ученика `/login` (POST)**: один запрос с JOIN `users` + `schools`: `s.code = ? AND u.role = 'student' AND u.name = ? AND u.room = ?`; затем `check_password_hash`. Ошибка → «Неверные данные для входа.» (не уточнять, что именно неверно).

**Вход персонала `/staff` (POST)**: ищет по `login` (после `strip()`) среди ролей `warden` и `owner`, проверяет пароль. Ошибка → «Неверный логин или пароль.»

**Как показывать сообщения (для всего сайта).** Все сообщения — и ошибки, и успех — выводятся только через `flash()`; отдельной переменной `error` в шаблонах нет.
- Ошибка в `/register`, `/login`, `/staff`, в заявке на `/` и в форме ресурса воспитателя → `flash(текст)` и сразу `render_template` той же страницы (без редиректа, код 200). Введённые значения подставляются из `request.form` (пароль — никогда).
- Успех в этих формах → `flash` (если есть текст) и редирект.
- `/book`, `/my/<id>/cancel`, `/warden/code`, `/warden/resource/<id>/repair`, `/warden/bookings/<id>/cancel`, `/owner/schools`, `/owner/wardens` всегда отвечают `flash` + редирект — и при ошибке, и при успехе (в формах владельца после ошибки поля очищаются, это нормально).

## 8. Время

- Вся работа со временем — в **московском времени без часового пояса** (naive datetime). Текущее время: `slots.now()` = `datetime.now(TZ).replace(tzinfo=None)`.
- В базе время слота хранится строкой формата `FMT = "%Y-%m-%d %H:%M"`, например `2026-10-22 07:00`. Такие строки правильно сравниваются как обычные строки (`<`, `>`, `>= '2026-10-22'`, `LIKE '2026-10-22%'`) — это используется в SQL-запросах.
- Время работы ресурса — строки `ЧЧ:ММ`; `minutes("07:30") → 450`.

## 9. Правила бронирования (`app/slots.py`)

Константы: `FMT = "%Y-%m-%d %H:%M"`, `DAYS_AHEAD = 7`.

**Сетка слотов дня** — `day_slots(resource, day)` → список `datetime`: начинаем с `open_time`, шаг `slot_minutes`; слот добавляется, только если он **целиком заканчивается не позже** `close_time` (`t + шаг <= закрытие`). Примеры: спортзал 08:00–21:00 по 90 минут → 08:00, 09:30, 11:00, 12:30, 14:00, 15:30, 17:00, 18:30 (слот 20:00 уже не помещается); стирка 07:00–22:00 по 60 минут → 07:00 … 21:00 (15 слотов).

**Дни для выбора** — `booking_days()`: сегодня и ещё 7 дней (всего 8 дат).

**Окно бронирования** — `in_window(start)`: `сейчас < start <= сейчас + 7 дней`. Нельзя бронировать прошедшее или уже начавшееся время и дальше чем на 7 суток вперёд.

**`book(db, user, resource, start)`** возвращает текст ошибки или `None` при успехе. Проверки строго по порядку (первые три — без запросов к базе):
1. `resource["is_broken"]` → «Ресурс на ремонте, бронировать нельзя.»
2. `start` не входит в `day_slots(resource, start.date())` → «Такого слота нет.»
3. Не проходит `in_window` → «Можно бронировать только будущее время и не дальше чем на 7 дней.»
4. `db.execute("BEGIN IMMEDIATE")` — транзакция с блокировкой записи, чтобы два одновременных запроса не обошли лимит. Сразу после неё `try:`
   - считаем брони этого пользователя на этот ресурс в **календарной неделе слота** (понедельник–воскресенье): `start_at >= '<дата понедельника>' AND start_at < '<дата следующего понедельника>'` (даты в формате `ГГГГ-ММ-ДД`). Считаются все брони недели, включая уже прошедшие;
   - если количество `>= weekly_limit` → `db.rollback()` и вернуть «Лимит исчерпан: не больше N броней в неделю на «Название».»
   - иначе `INSERT INTO bookings (resource_id, user_id, start_at)` и `db.commit()`;
   - `except sqlite3.IntegrityError:` (кто-то успел занять слот) → `db.rollback()` и «Этот слот уже заняли.»

Так **один слот физически нельзя занять дважды** даже при одновременных нажатиях: это гарантирует `UNIQUE (resource_id, start_at)` в базе, а не проверка в Python.

**Защита сетки.** Если поменять у ресурса длительность слота или время открытия, сетка сдвинется, старые брони перестанут совпадать со слотами, и станут возможны пересекающиеся брони. Поэтому при редактировании ресурса: если новое `slot_minutes` или нормализованное `open_time` **отличается** от значения в базе **и** у ресурса есть брони с `start_at >= '<сегодняшняя дата>'` — сохранение запрещено целиком (не сохраняется ни одно поле), форма показывается снова с введёнными значениями и сообщением «Длительность слота и время открытия нельзя менять, пока есть брони с сегодняшнего дня. Сначала отмените их.» Если меняются только название, время закрытия или лимит — сохранять без этой проверки.

## 10. Страницы ученика (`app/student.py`)

Блюпринт `student` без префикса. Все маршруты — `@role_required("student")`.

**Фильтры шаблонов** (через `@bp.app_template_filter`, доступны во всех шаблонах):
- `day_label(date)`: разница с сегодняшней датой 0 → «Сегодня», 1 → «Завтра», иначе `f"{WEEKDAYS[day.weekday()]}, {day:%d.%m}"`, где `WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]`. Пример: если сегодня среда 21.10.2026, то 23.10 → «пт, 23.10», а вчерашний день → «вт, 20.10».
- `slot_label("2026-10-22 07:00")` → `f"{day_label(дата)}, {ЧЧ:ММ}"`, например «Завтра, 07:00».

### `/schedule` — Расписание (GET)
Параметры: `r` — id ресурса, `d` — дата `ГГГГ-ММ-ДД`.
- Ресурсы — только интерната ученика, `ORDER BY name`.
- Если `d` не дата или её нет в `booking_days()` → сегодня. Если `r` не найден среди ресурсов интерната → первый ресурс.
- Если ресурсов нет — на странице только текст «В интернате пока нет ресурсов. Попросите воспитателя их добавить.» (без чипсов и сетки).
- `<h1>` на этой странице нет: она сразу начинается с двух рядов чипсов:
  1. ресурсы (выбранный — `chip on`), ссылка `?r=<id>&d=<текущий день>`;
  2. 8 дней с подписью `day_label` (выбранный — `chip on`), ссылка `?r=<текущий ресурс>&d=<день>`.
- Если ресурс на ремонте — плашка `<p class="flash">«Название» на ремонте, бронировать нельзя.</p>`.
- Ниже — сетка слотов дня. Занятость — одним запросом: брони ресурса за день (`start_at LIKE 'ГГГГ-ММ-ДД%'`) → словарь `start_at → user_id`. Состояние каждого слота — **строго в таком порядке**:
  1. Есть бронь на это время → «моё», если `user_id` — текущий ученик, иначе «занято» (кто занял, ученикам **не показывать**). Это действует, даже если время уже прошло или ресурс на ремонте.
  2. Иначе, если ресурс на ремонте или `in_window(start)` ложно → «недоступно».
  3. Иначе → «свободно».
  Только «свободно» — это кнопка: форма POST на `/book` со скрытыми `csrf`, `resource`, `start` (`ГГГГ-ММ-ДД ЧЧ:ММ`). **Бронь в одно нажатие, без подтверждения.** Остальные состояния — `<div>`, на них нажать нельзя.

### `/book` — Забронировать (POST)
- Ресурс ищется по `id` (`request.form.get("resource", type=int)`) **и** `school_id` ученика; `start` разбирается по `FMT`. Ресурс не найден или время не разобралось → `abort(400)`.
- Вызывает `slots.book(...)`. Сообщение: ошибка из `book` или «Готово: Название, Завтра, 07:00.» (через `slot_label`).
- Редирект на `/schedule?r=<ресурс>&d=<дата слота>`.

### `/my` — Мои брони (GET)
- Брони ученика с `start_at >= '<сегодняшняя дата>'` (сегодняшние, включая уже прошедшие сегодня, и будущие), `ORDER BY b.start_at`. Строка: название ресурса жирным, ниже `slot_label` (без `<small>`).
- Кнопка «Отменить» — только у броней, которые ещё не начались (`start_at > now_key`, где `now_key = slots.now().strftime(FMT)` передаётся в шаблон). Это POST-форма на `/my/<id>/cancel` с `csrf`, **без подтверждения**.
- Пусто → «Броней нет.» и ссылка «Открыть расписание».

### `/my/<id>/cancel` — Отмена (POST)
`DELETE FROM bookings WHERE id = ? AND user_id = <я> AND start_at > <now_key>`. Удалилась строка → «Бронь отменена.», иначе «Эту бронь уже нельзя отменить.» (в том числе при попытке отменить чужую). Редирект на `/my`.

## 11. Панель воспитателя (`app/warden.py`)

Блюпринт `warden` с префиксом `/warden`. Все маршруты — `@role_required("warden")`. `get_resource(id)` ищет ресурс по `id` **и** `school_id` воспитателя, иначе `abort(404)`.

### `/warden/` — Ресурсы и код (GET)
- `<h1>` — название интерната.
- Карточка `.card`: «Код для регистрации жильцов: `<b class="code">КОД</b>`», под ним POST-форма на `/warden/code` с `onsubmit="return confirm('Сменить код? Жильцы будут входить и регистрироваться с новым кодом.')"`, скрытым `csrf` и `<button class="link">Сменить код</button>` (не `<a>`: ссылка не отправляет POST).
- `<h2>Ресурсы</h2>`, кнопка-ссылка `<a class="btn">Добавить ресурс</a>` на форму нового ресурса; список ресурсов `ORDER BY name`. Строка: название жирным (если на ремонте — `<span class="tag">на ремонте</span>`), ниже `<small>60 мин, 07:00–22:00, до 3 в неделю</small>`. Справа `<div class="actions">`: ссылка «Изменить» и POST-форма на `/warden/resource/<id>/repair` с `csrf` и `<button class="link">` «На ремонт» или «Починили» (без подтверждения).
- Нет ресурсов → «Ресурсов пока нет.»

### `/warden/code` (POST)
Новый код через `new_school_code()`, `UPDATE schools`, «Новый код интерната: КОД», редирект на `/warden/`. Аккаунты жильцов не меняются, но входить и регистрироваться они теперь будут с новым кодом (со старым — «Неверные данные для входа.»).

### `/warden/resource/new` и `/warden/resource/<id>` (GET, POST) — форма ресурса
Одна функция на оба адреса. Значения по умолчанию для нового: `name=""`, `slot_minutes=60`, `open_time="07:00"`, `close_time="22:00"`, `weekly_limit=3`. Поля:
- «Название» (`name`, `placeholder="Стиралка 1"`);
- «Длительность слота, минут» (`slot_minutes`, `type="number" min="5" max="720"`);
- «Открытие» и «Закрытие» (`open_time`, `close_time`, `type="time"`);
- «Броней в неделю на человека» (`weekly_limit`, `type="number" min="1" max="50"`).

Чтение формы: `name` — `strip()`; `slot_minutes` и `weekly_limit` — `request.form.get(..., type=int)` (пустое или не число → `None`, ошибки 500 быть не должно). Проверки по порядку (сообщение — первая не прошедшая):
1. Оба времени разбираются `datetime.strptime(..., "%H:%M")` и нормализуются обратно в `ЧЧ:ММ` → иначе «Укажите часы работы в формате ЧЧ:ММ.»
2. Название не пустое → «Введите название.»
3. `slot_minutes` есть и `5 <= slot_minutes <= 720` → «Длительность слота — от 5 до 720 минут.»
4. `weekly_limit` есть и `1 <= weekly_limit <= 50` → «Лимит в неделю — от 1 до 50.»
5. `minutes(open) + slot_minutes <= minutes(close)` (помещается хотя бы один слот) → «Закрытие должно быть позже открытия хотя бы на один слот.»
6. Защита сетки из раздела 9 (только при изменении существующего ресурса).

Ошибка → форма снова с введёнными значениями. Успех → `UPDATE` или `INSERT`, «Сохранено: Название.», редирект на `/warden/`. Кнопки: `<button class="btn">Сохранить</button>` и ссылка «Отмена» (на `/warden/`). **Удаления ресурсов нет.**

### `/warden/resource/<id>/repair` (POST)
Переключает `is_broken`. Сообщения: ««Название» на ремонте, новые брони закрыты.» / ««Название» снова работает.» Редирект на `/warden/`. **Уже сделанные брони при этом не отменяются** — воспитатель отменяет их вручную, если нужно.

### `/warden/bookings` (GET) — брони на день
- Параметр `d`; если не дата — сегодня. Можно открыть любой день, и прошлый тоже.
- `<h1>Брони: {{ day|day_label }}</h1>`, затем `<form method="get" class="day-pick">` с `<input type="date" name="d">` и `<button class="btn">Показать</button>`.
- Все брони интерната за день: JOIN `bookings`, `resources`, `users`, `WHERE r.school_id = ? AND b.start_at LIKE 'ГГГГ-ММ-ДД%' ORDER BY b.start_at, r.name`. Строка: `<b>07:00</b> · Ресурс<br><small>Имя, комната 101</small>`; справа POST-форма отмены со скрытыми `csrf` и `d` (текущий день) и `onsubmit="return confirm('Отменить эту бронь?')"`.
- **Безопасность:** не вставляй имя жильца или любые пользовательские данные внутрь JavaScript (`confirm('... {{ имя }}')`): имя с апострофом сломает скрипт и откроет XSS.
- Пусто → «В этот день броней нет.»

### `/warden/bookings/<id>/cancel` (POST)
`DELETE FROM bookings WHERE id = ? AND resource_id IN (SELECT id FROM resources WHERE school_id = <мой интернат>)` — без ограничения по времени. «Бронь отменена.» или «Бронь не найдена.» Редирект на `/warden/bookings?d=<скрытое поле d>`.

## 12. Главная и панель владельца (`app/owner.py`)

Блюпринт `owner` без префикса.

### `/` — главная (GET, POST)
- GET от уже вошедшего пользователя → сразу редирект в его раздел (`HOME[роль]`): ученику так быстрее попасть в расписание. POST (заявка) обрабатывается одинаково для всех.
- Содержимое для гостя:
  1. `<section class="hero">`: `<h1>Свободно?</h1>`, `<p class="lead">Запись в стиралку, комнату для самоподготовки и спортзал интерната — с телефона за несколько секунд.</p>`, кнопки `<a class="btn">Войти</a>` и `<a class="btn ghost">Регистрация</a>`, ссылка «Подключить свой интернат» на `#connect`.
  2. `<h2>Как это работает</h2>` и `<ol class="steps">`:
     - Воспитатель добавляет ресурсы и часы работы и сообщает жильцам код интерната.
     - Жилец регистрируется по коду, открывает расписание и видит свободное время.
     - Одно нажатие — и время за ним. Занять тот же слот второй раз нельзя.
  3. `<h2>Чем полезно интернату</h2>` и `<ul class="benefits">` (начало каждого пункта — в `<b>`):
     - **Без споров.** Очередь видна всем вместо чатов и бумажек.
     - **Честно.** Воспитатель задаёт лимит броней в неделю на каждого жильца.
     - **Под контролем.** Воспитатель видит все брони на день, отменяет любую и отправляет технику «на ремонт».
     - **Минимум данных.** О жильцах храним только имя и номер комнаты.
     - **Ничего не нужно устанавливать.** Работает в браузере телефона.
  4. `<h2 id="connect">Подключить интернат</h2>` и форма `.card`: «Название интерната» (`school_name`), «Ваше имя» (`contact_name`), «Телефон или e-mail» (`contact`) — все `required maxlength="200"`; кнопка «Отправить заявку».
- POST: все три поля после `strip()` не пустые и не длиннее 200 символов, иначе «Заполните все поля заявки.» (форма снова с введёнными значениями). Успех → запись в `requests` (с `created_at` по Москве), «Спасибо! Заявка отправлена, мы свяжемся с вами.», редирект на `/`.

### `/owner/` — панель владельца (GET, `@role_required("owner")`)
`<h1>Панель владельца</h1>` и три раздела `<h2>` в таком порядке:
1. **«Интернаты»**: форма `.card` (поле «Название» `name`, `required maxlength="200"`, кнопка «Создать интернат»); список `ORDER BY s.name`: название жирным, ниже `<small>жильцов: N</small>`, справа `<b class="code">КОД</b>`. N — подзапрос `(SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') AS students`. Пусто → «Интернатов пока нет.»
2. **«Воспитатели»**: форма `.card` показывается, только если есть хотя бы один интернат: «Интернат» (`<select name="school" required>`, интернаты по алфавиту, `value` = id), «Имя» (`name`, `maxlength="200"`), «Логин» (`login`, `maxlength="50" autocapitalize="none"`), «Пароль (от 6 символов)» (`password`, обычное текстовое поле без `type`, `minlength="6" autocomplete="off"` — чтобы владелец видел, что передаёт воспитателю); кнопка «Создать воспитателя». Список: `SELECT u.name, u.login, s.name AS school ... WHERE u.role = 'warden' ORDER BY s.name, u.name`: имя жирным, ниже `<small>Интернат · логин vos</small>`. Пусто → «Воспитателей пока нет.»
3. **«Заявки с главной»**: `ORDER BY id DESC`: название интерната жирным, ниже `<small>Имя · контакт · {{ created_at[:16]|slot_label }}</small>`. Пусто → «Заявок пока нет.»

### `/owner/schools` (POST)
`name` после `strip()`. Пусто → «Введите название интерната.» Иначе создать с `new_school_code()` → «Интернат «Название» создан, код: КОД». Редирект на `/owner/`.

### `/owner/wardens` (POST)
`name` и `login` — `strip()`, `password` — как есть, `school` — `type=int`. Проверки по порядку:
1. Интернат с таким id не найден, или пустое имя, или пустой логин → «Выберите интернат и заполните имя и логин.»
2. Пароль короче 6 → «Пароль воспитателя — от 6 символов.»
3. Логин занят (`sqlite3.IntegrityError`) → «Такой логин уже занят.»
4. Успех → «Воспитатель Имя создан, логин: vos».
Редирект на `/owner/`. Длина названия, имени и логина на сервере не проверяется (только непустота).

## 13. Шаблоны и внешний вид

### `base.html` — ровно такой

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

### Заголовки страниц

`{% block title %}` (base.html добавляет « — Свободно?»), `<h1>` — первая строка контента:

| Страница | title | h1 |
|---|---|---|
| `/` | Бронирование в интернате | Свободно? (внутри `.hero`) |
| `/login` | Вход | Вход для жильцов |
| `/register` | Регистрация | Регистрация |
| `/staff` | Вход для воспитателей | Вход для воспитателей |
| `/schedule` | Расписание | **нет** (сразу ряды чипсов) |
| `/my` | Мои брони | Мои брони |
| `/warden/` | Панель воспитателя | название интерната |
| `/warden/resource/new`, `/warden/resource/<id>` | «Новый ресурс» или сохранённое в базе название ресурса (не меняется при ошибке формы) | то же |
| `/warden/bookings` | Брони на день | Брони: <day_label дня> |
| `/owner/` | Панель владельца | Панель владельца |

### Страницы входа
- `auth/_student_fields.html`: скрытое `csrf` и четыре поля: «Код интерната» (`code`, `required autocapitalize="characters"`), «Имя» (`name`, `required`), «Комната» (`room`, `required inputmode="numeric"`), «Пароль» (`password`, `type="password" required`). Значения `code`, `name`, `room` — из `request.form`. `login.html` и `register.html` подключают его через `{% include %}` внутри своей формы.
- `login.html`: h1 «Вход для жильцов», форма `.card` с полями и кнопкой «Войти»; под формой «Нет аккаунта? <a>Регистрация</a>» и отдельной строкой ссылка «Вход для воспитателей» (на `/staff`).
- `register.html`: h1 «Регистрация», подсказка «Код интерната скажет воспитатель.», форма с теми же полями и кнопкой «Зарегистрироваться», под формой «Уже есть аккаунт? <a>Войти</a>».
- `staff_login.html`: h1 «Вход для воспитателей», форма `.card`: `csrf`, «Логин» (`login`, `required autocapitalize="none"`, значение из `request.form`), «Пароль» (`password`, `type="password" required`), кнопка «Войти».

### Правила разметки
- Формы ввода — `<form method="post" class="card">`; каждое поле — `<label>Подпись <input name="..." ...></label>` (поле внутри label); кнопка отправки — `<button class="btn">`. Все видимые поля всех форм — `required`.
- Действия, которые выглядят как ссылки («Выйти», «Отменить», «Сменить код», «На ремонт»/«Починили»), — `<button class="link">` внутри отдельной маленькой POST-формы с `csrf`.
- Строка списка: `<div class="row"><div><b>главное</b><br><small>детали</small></div> …справа действие…</div>`.
- Сетка слотов: `<div class="slots">`. Свободный слот — `<form method="post" action="{{ url_for('student.book') }}">` со скрытыми `csrf`, `resource`, `start` и `<button class="slot free">07:00<small>свободно</small></button>`. Остальные — `<div class="slot busy|mine|off">07:00<small>занято|моё|недоступно</small></div>`.
- Ряды выбора — `<nav class="chips">` с `<a class="chip">` (`class="chip on"` у выбранного).

### CSS — `app/static/style.css`, ровно этот файл

```css
:root { --accent: #1f7a4d; --bg: #f6f7f5; --text: #1d1f1e; --muted: #6b716e; --line: #dde1de; }
* { box-sizing: border-box; }
body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: var(--bg); color: var(--text); }
.top { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--line); }
.top nav { display: flex; gap: 14px; align-items: center; }
.logo { font-weight: 700; color: var(--accent); text-decoration: none; }
main { max-width: 640px; margin: 0 auto; padding: 16px; }
a { color: var(--accent); }
h1 { font-size: 1.5rem; margin: 8px 0 16px; }
.card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
label { display: block; margin-bottom: 12px; font-size: .9rem; color: var(--muted); }
input, select { display: block; width: 100%; margin-top: 4px; padding: 12px; font-size: 1rem; border: 1px solid var(--line); border-radius: 8px; color: var(--text); }
.btn { display: inline-block; padding: 12px 20px; font-size: 1rem; border: 0; border-radius: 8px; background: var(--accent); color: #fff; text-decoration: none; cursor: pointer; }
.flash { padding: 10px 14px; border-radius: 8px; background: #fff4d6; }
.inline { display: inline; margin: 0; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; }
.chip { flex: none; padding: 8px 14px; border: 1px solid var(--line); border-radius: 20px; background: #fff; color: var(--text); text-decoration: none; white-space: nowrap; }
.chip.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px; }
.slots form { margin: 0; }
.slot { display: block; width: 100%; padding: 12px 4px; border: 1px solid var(--line); border-radius: 10px; font: 600 1rem system-ui, sans-serif; text-align: center; background: #fff; color: var(--text); }
.slot small { display: block; font-weight: 400; font-size: .75rem; }
.slot.free { border-color: var(--accent); color: var(--accent); cursor: pointer; }
.slot.mine { background: var(--accent); border-color: var(--accent); color: #fff; }
.slot.busy { background: #eceeed; color: var(--muted); }
.slot.off { opacity: .45; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
h2 { font-size: 1.2rem; margin: 24px 0 8px; }
small { color: var(--muted); }
.row form { margin: 0; }
.actions { display: flex; gap: 14px; align-items: center; flex: none; }
.tag { font-size: .75rem; padding: 2px 8px; border-radius: 10px; background: #fde2df; color: #9b2c22; }
.code { font-size: 1.3rem; letter-spacing: 2px; }
.day-pick { display: flex; gap: 8px; margin-bottom: 8px; }
.day-pick input { margin: 0; }
.hero { padding: 16px 0 8px; }
.hero h1 { font-size: 2rem; color: var(--accent); margin: 0 0 8px; }
.lead { font-size: 1.15rem; }
.btn.ghost { background: #fff; color: var(--accent); border: 1px solid var(--accent); }
.steps, .benefits { padding-left: 20px; }
.steps li, .benefits li { margin-bottom: 8px; }
.link { background: none; border: 0; padding: 0; font: inherit; color: var(--accent); text-decoration: underline; cursor: pointer; }
```

На этапе 5 можно доработать CSS под телефон (не меняя дизайн): основные кнопки и слоты — не ниже ~44px по высоте, без горизонтальной прокрутки страницы на ширине 320–400px.

## 14. Служебные команды (CLI, `app/db.py`)

Регистрируются в `init_app(app)` (там же `app.teardown_appcontext(close_db)`) через `app.cli.add_command`:
- `flask --app app init-db` — создать базу заново (**все данные удаляются**), выводит «База создана.»
- `flask --app app create-owner LOGIN` — пароль через `@click.password_option(prompt="Пароль")` (спрашивается дважды). Вставляет `role='owner'`, `name = login`, `school_id` пустой. Выводит «Владелец LOGIN создан.»
- Вспомогательные для проверки (дублируют панели):
  - `create-school "Название"` — код через `new_school_code()`, выводит «Интернат «Название» создан, код: КОД»;
  - `add-resource КОД "Название"` с необязательными опциями `--minutes 60 --open 07:00 --close 22:00 --limit 3` (это значения по умолчанию). Код приводится к `upper()`. Нет интерната → `raise click.ClickException("Нет интерната с таким кодом.")`. Значения не проверяются. Выводит «Ресурс «Название» добавлен.»;
  - `create-warden КОД логин "Имя"` — пароль через `@click.password_option(prompt="Пароль")`, код в `upper()`, та же ошибка про код. Выводит «Воспитатель логин создан.»

## 15. Демо-данные (`seed.py`, этап 5)

`python seed.py`:
- сначала печатает «Внимание: база будет создана заново, все старые данные удалятся.» и продолжает без вопроса;
- работает через `create_app()` и `with app.app_context():`, базу пересоздаёт той же функцией `init_db()`, что и `init-db`.

Наполнение:
- Интернат **«Демо-интернат»** с фиксированным кодом **`DEMO`** (вставляется напрямую, без `new_school_code()`, чтобы было легко показывать на конкурсе).
- Ресурсы:
  - «Стиралка 1», «Стиралка 2», «Стиралка 3» — по 60 минут, 07:00–22:00, лимит 2 в неделю;
  - «Комната самоподготовки 1», «Комната самоподготовки 2» — по 60 минут, 08:00–22:00, лимит 5 в неделю;
  - «Спортзал» — по 90 минут, 08:00–21:00, лимит 3 в неделю.
- Аккаунты:
  - владелец: логин `admin`, пароль `admin123`;
  - воспитатель «Мария Ивановна»: логин `vos`, пароль `vos123`;
  - ученики (код `DEMO`): «Аня», комната 101, пароль `1111`; «Борис», комната 102, пароль `2222`; «Вика», комната 103, пароль `3333`.
- Брони создаются через `slots.book()` (чтобы соблюдались сетка, окно и лимиты) на первые слоты, проходящие `in_window` (сегодня, а если сегодня их уже нет — завтра): Аня — первый такой слот «Стиралки 1»; Борис — следующий слот «Стиралки 1» и первый такой слот «Спортзала». Так у Ани в расписании видны «моё» и «занято».
- Демо-заявка: «Школа-интернат №1», «Ольга Петровна», «olga@example.com».
- В конце скрипт печатает код интерната и все демо-логины и пароли.

## 16. Чего не делать

- Не добавлять: удаление ресурсов, интернатов и аккаунтов, сброс пароля, почту и уведомления, параметр `next` после входа, свои страницы ошибок, API, тёмную тему, JS-библиотеки.
- Не перенаправлять уже вошедших со страниц `/login`, `/register`, `/staff`.
- Не ставить `confirm` никуда, кроме двух мест из раздела 11 (бронь слота, отмена своей брони учеником, ремонт, выход и формы создания работают без подтверждения).
- Не добавлять `gunicorn` в `requirements.txt` (на сервере его ставят отдельной командой).
- Не отключать автоэкранирование Jinja и не использовать `|safe`.

## 17. Безопасность — чек-лист

- Пароли только хэшем; минимальная длина: ученик 4, воспитатель 6.
- Во всех POST-формах есть CSRF-токен; POST без токена → 400.
- Все SQL-запросы — с параметрами `?`, никакой склейки строк с пользовательскими данными.
- Все запросы ученика и воспитателя ограничены их `school_id`: чужой ресурс при брони → 400, в панели воспитателя → 404; чужая роль → 403.
- Пользовательские данные не попадают в JavaScript.
- Выход — только POST.
- На сервере `SECRET_KEY` задаётся через переменную окружения.

## 18. Как проверить (критерии приёмки)

Проверь каждый пункт сам временным скриптом вне проекта (через `app.test_client()` во Flask, на временной базе) и покажи мне результат:
1. Регистрация с кодом в нижнем регистре работает; повторная регистрация того же имени и комнаты — «Жилец с таким именем и комнатой уже зарегистрирован.»; неверный пароль — «Неверные данные для входа.»
2. POST без CSRF-токена → 400.
3. Ученик не открывает `/warden/` и `/owner/` (403); после выхода `/schedule` ведёт на вход.
4. Бронь свободного слота → «Готово: …»; второй ученик на тот же слот → «Этот слот уже заняли.»
5. Время не по сетке (10:30 при шаге 60) → «Такого слота нет.»; вчера и через 8 дней → сообщение про окно бронирования; спортзал 08:00–21:00 по 90 минут: слот 18:30 есть, 20:00 нет.
6. При лимите 2 третья бронь на той же календарной неделе → «Лимит исчерпан: …».
7. **Гонка:** 10 разных учеников одновременно (потоки, старт через `threading.Barrier`, у каждого свой клиент) бронируют один слот → ровно 1 успех и 9 «Этот слот уже заняли.»
8. Ученик не может отменить чужую бронь; свою будущую — может.
9. Ресурс «на ремонте» → бронь запрещена, в расписании плашка и «недоступно».
10. Воспитатель: добавление и изменение ресурса, все ошибки формы (пустое название, закрытие раньше открытия, слот 3 минуты, время «7»), ремонт, брони дня с именем и комнатой, отмена; чужой воспитатель получает 404 и не видит чужие брони.
11. При существующей брони смена длительности слота или времени открытия запрещена; смена названия, закрытия и лимита — разрешена; после отмены брони смена длительности разрешена.
12. Смена кода: со старым кодом войти нельзя, с новым — можно, аккаунт тот же.
13. Главная: заявка с пустым полем — ошибка; нормальная заявка видна владельцу; текст `<script>` в заявке выводится экранированным.
14. Владелец создаёт интернат (появляется код) и воспитателя; дубль логина, короткий пароль, несуществующий интернат — ошибки; новый воспитатель входит и видит свой интернат.
15. Вошедший пользователь на `/` перенаправляется в свой раздел; после выхода главная открывается.
16. На ширине экрана 360px нет горизонтальной прокрутки, слоты удобно нажимать пальцем.

## 19. Порядок работы

1. Сначала **не пиши код**: если что-то неясно — задай до 5 вопросов, потом покажи план (структура файлов, таблицы, этапы) и жди моего «ок».
2. Сохрани это задание в `TZ.md`. Создай короткий `CLAUDE.md`: суть проекта, стек, правила работы, ссылка на `TZ.md`, список этапов с отметками о готовности.
3. Этапы:
   1. Каркас и вход (схема базы, регистрация, вход, роли, CSRF, заглушки разделов через `stub.html`).
   2. Ресурсы и бронирование (слоты, правила, расписание, мои брони).
   3. Панель воспитателя.
   4. Главная и панель владельца.
   5. Вёрстка под телефон и демо-данные.
4. После каждого этапа: проверь по критериям из раздела 18, обнови `CLAUDE.md`, сделай коммит в git, **остановись** и коротко напиши, что сделано и как мне это проверить.
5. Меняй в файлах только нужные места. Не добавляй функций сверх задания без моего согласия.
6. Отвечай мне коротко и простым языком.
7. В конце напиши:
   - как запустить сайт на компьютере (Windows и Mac): установка Python (галочка «Add Python to PATH» на Windows), `python -m venv .venv`, активация (`.venv\Scripts\activate` / `source .venv/bin/activate`), `pip install -r requirements.txt`, `python seed.py` (или `flask --app app init-db` + `flask --app app create-owner admin`), `flask --app app run`, адрес http://127.0.0.1:5000, как открыть с телефона в той же Wi-Fi сети (`flask --app app run --host 0.0.0.0`);
   - как выложить сайт на недорогой хостинг, доступный в России, по шагам: выбор хостинга с поддержкой Python, загрузка кода, установка зависимостей, `pip install gunicorn` и запуск (или WSGI-настройка хостинга), переменная `SECRET_KEY`, HTTPS, где лежит база (`instance/svobodno.sqlite`) и как делать её резервную копию.
