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
