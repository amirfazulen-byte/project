const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/17b89be3-2205-4797-b5d7-966378d908a6_6cb4af85-50c3-47ac-a3a7-cdd3927cb574/pptx/scripts/apply_theme.js");

// Терракотовая гамма — под археологию и древнюю историю
const THEME = {
  name: "TatHistory",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "231512", lt1: "FFFFFF",
    dk2: "4A2420", lt2: "EFF3F1",
    accent1: "B85042", accent2: "7A4A3F", accent3: "7A736F",
    accent4: "A7BEAE", accent5: "8C3A2E", accent6: "E0D9D4",
    hlink: "B85042", folHlink: "7A736F",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Проект «Путешествие сквозь тысячелетия»";
pres.title = "Квест по истории Татарстана для 5–11 классов";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.7;

/* ---------- Макеты ---------- */
const footer = (txt) => ({ text: { text: txt, options: { x: M, y: H - 0.5, w: 7, h: 0.3,
  fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } });
const num = { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" };
const FOOT = "Путешествие сквозь тысячелетия · квест по истории Татарстана";

pres.defineSlideMaster({ title: "DARK", background: { color: THEME.colors.dk2 }, objects: [] });
pres.defineSlideMaster({ title: "LIGHT", background: { color: C.background1 },
  objects: [footer(FOOT)], slideNumber: num });
pres.defineSlideMaster({ title: "TINT", background: { color: C.background2 },
  objects: [footer(FOOT)], slideNumber: num });

/* ---------- Помощники ---------- */
// Заголовок — обычная надпись: шаблонные блоки PowerPoint двигает сам
function title(s, text, dark) {
  s.addText(text, { x: M, y: dark ? 1.0 : 0.45, w: W - 2 * M, h: dark ? 1.0 : 0.9,
    isTextBox: true, margin: 0, fontSize: dark ? 40 : 38, bold: true,
    color: dark ? "FFFFFF" : THEME.colors.dk2, align: "left", valign: "middle", fit: "none" });
}

// Карточка одним объектом — текст внутри фигуры, ничего не разъезжается
function card(s, { x, y, w, h, head, body, fill, headColor, bodyColor, line, name, headSize = 16, bodySize = 13 }) {
  s.addText([
    { text: head, options: { fontSize: headSize, bold: true, color: headColor, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: body, options: { fontSize: bodySize, color: bodyColor } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: fill },
    line: line ? { color: THEME.colors.accent6, width: 1 } : undefined,
    x, y, w, h, align: "left", valign: "top", margin: [12, 14, 12, 14], objectName: name });
}

function statCard(s, { x, y, w, h, value, label, valueSize = 32, name }) {
  s.addText([
    { text: value, options: { fontSize: valueSize, bold: true, color: THEME.colors.accent1, breakLine: true } },
    { text: " ", options: { fontSize: 7, breakLine: true } },
    { text: label, options: { fontSize: 13, color: THEME.colors.accent3 } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: "FFFFFF" },
    line: { color: THEME.colors.accent6, width: 1 },
    x, y, w, h, align: "left", valign: "top", margin: [14, 16, 14, 16], objectName: name });
}

/* ---------- 1. Титул ---------- */
pres.addSection({ title: "Открытие" });
let s = pres.addSlide({ masterName: "DARK", sectionTitle: "Открытие" });
s.addText("Путешествие\nсквозь тысячелетия", { x: M, y: 1.9, w: 9.5, h: 1.8, isTextBox: true, margin: 0,
  fontSize: 46, bold: true, color: "FFFFFF", align: "left", valign: "middle", fit: "none" });
s.addText("Квест по истории Татарстана: от Волжской Булгарии до современности",
  { x: M, y: 3.85, w: 9.5, h: 0.6, isTextBox: true, margin: 0, fontSize: 20,
    color: THEME.colors.accent4, align: "left", valign: "top" });
s.addText("Для 5–11 классов · бесплатно · работает в браузере телефона",
  { x: M, y: 4.45, w: 9.5, h: 0.5, isTextBox: true, margin: 0, fontSize: 16,
    color: "D8CBC6", align: "left", valign: "top" });
s.addText([
  { text: "Фамилия Имя", options: { fontSize: 19, bold: true, color: "FFFFFF", breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 15, color: "D8CBC6", breakLine: true } },
  { text: " ", options: { fontSize: 6, breakLine: true } },
  { text: "Школьный конкурс по технологическому предпринимательству · ИТ-парк Татарстана",
    options: { fontSize: 13, color: "A89189" } },
], { x: M, y: 5.45, w: 10.0, h: 1.6, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("ЗАМЕНИТЬ «Фамилия Имя». Представиться и назвать проект одной фразой: игра, по которой школьник проходит историю Татарстана от Волжской Булгарии до наших дней.");

/* ---------- 2. Проблема ---------- */
pres.addSection({ title: "Проблема" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Проблема" });
title(s, "Курс ввели, а учиться по нему не по чему");
const cw = (W - 2 * M - 2 * 0.4) / 3;
statCard(s, { x: M, y: 1.75, w: cw, h: 1.95, value: "512 000", valueSize: 34,
  label: "школьников в Татарстане — все изучают историю родного края",
  name: "школьники" });
statCard(s, { x: M + cw + 0.4, y: 1.75, w: cw, h: 1.95, value: "5–7 класс", valueSize: 28,
  label: "курс «История нашего края» введён с 2025/26 учебного года",
  name: "курс" });
statCard(s, { x: M + 2 * (cw + 0.4), y: 1.75, w: cw, h: 1.95, value: "32 региона", valueSize: 28,
  label: "разрабатывают такие курсы, Татарстан среди пилотных",
  name: "пилот" });
s.addText([
  { text: "В чём сложность", options: { fontSize: 17, bold: true, color: THEME.colors.dk2, breakLine: true } },
  { text: " ", options: { fontSize: 7, breakLine: true } },
  { text: "Курс уже идёт, а учебники ещё разрабатываются: макеты только направлены в Минпросвещения. Учителю приходится собирать материал самому, а ученику — учить даты по параграфам, которых пока нет.",
    options: { fontSize: 15, color: C.text1 } },
], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: THEME.colors.lt2 },
  x: M, y: 4.0, w: W - 2 * M, h: 1.7, align: "left", valign: "top", margin: [16, 20, 16, 20],
  objectName: "сложность" });
s.addNotes("Главная мысль: курс ввели раньше, чем появились учебники. Мы закрываем этот разрыв уже сейчас. Цифры: 512 тысяч школьников — Татарстанстат, курс и 32 пилотных региона — Минобрнауки РТ через Татар-информ.");

/* ---------- 3. Что внутри ---------- */
pres.addSection({ title: "Решение" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Решение" });
title(s, "История как игра, а не параграф");
const tw = (W - 2 * M - 2 * 0.4) / 3;
card(s, { x: M, y: 1.75, w: tw, h: 1.7, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "10+ уровней",
  body: "От Волжской Булгарии до современности — эпоха за эпохой", name: "уровни" });
card(s, { x: M + tw + 0.4, y: 1.75, w: tw, h: 1.7, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "7 мини-игр",
  body: "Раскопки, шифры, пазлы, викторины", name: "игры" });
card(s, { x: M + 2 * (tw + 0.4), y: 1.75, w: tw, h: 1.7, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "22 достижения",
  body: "Ачивки и внутренняя валюта тәңкә", name: "ачивки" });
card(s, { x: M, y: 3.6, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Магазин",
  body: "Подсказки, рамки, фоны за заработанное", name: "магазин" });
card(s, { x: M + tw + 0.4, y: 3.6, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Таблица лидеров",
  body: "Соревнование с одноклассниками", name: "лидеры" });
card(s, { x: M + 2 * (tw + 0.4), y: 3.6, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Любое устройство",
  body: "Работает в браузере телефона", name: "адаптив" });
s.addText("Ребёнок играет — и запоминает последовательность эпох, а не отдельные даты",
  { x: M, y: 5.35, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 15,
    bold: true, color: THEME.colors.dk2, valign: "top" });
s.addNotes("Не перечислять все шесть пунктов подряд — назвать два-три и перейти к демонстрации. Главное отличие от учебника: материал проходится через действие, а не через чтение.");

/* ---------- 4. Учитель ---------- */
pres.addSection({ title: "Внедрение" });
s = pres.addSlide({ masterName: "TINT", sectionTitle: "Внедрение" });
title(s, "Учитель ведёт класс, а не проверяет тетради");
const hw = (W - 2 * M - 0.4) / 2;
card(s, { x: M, y: 1.75, w: hw, h: 2.2, fill: "FFFFFF", line: true, headSize: 18, bodySize: 14,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Роль «Ученик»",
  body: "Проходит уровни, играет в мини-игры, зарабатывает достижения и место в рейтинге. Можно заниматься дома, без учителя.",
  name: "ученик" });
card(s, { x: M + hw + 0.4, y: 1.75, w: hw, h: 2.2, fill: "FFFFFF", line: true, headSize: 18, bodySize: 14,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Роль «Учитель»",
  body: "Создаёт класс, регистрирует учеников, выдаёт задания и видит, кто какой уровень прошёл.",
  name: "учитель" });
s.addText([
  { text: "Почему это важно для внедрения", options: { fontSize: 17, bold: true, color: "FFFFFF", breakLine: true } },
  { text: " ", options: { fontSize: 7, breakLine: true } },
  { text: "Решение принимает учитель, а не ученик. Поэтому в сервисе есть готовый кабинет учителя: класс заводится за пару минут, ничего устанавливать и согласовывать не нужно — достаточно открыть ссылку.",
    options: { fontSize: 15, color: "F0E4E0" } },
], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: THEME.colors.accent1 },
  x: M, y: 4.2, w: W - 2 * M, h: 1.6, align: "left", valign: "top", margin: [16, 20, 16, 20],
  objectName: "внедрение" });
s.addNotes("Это ключевой слайд для жюри: показывает, кто внедряет продукт. Начать можно с одного класса в своей школе — это и будет первый пилот.");

/* ---------- 5. Планы ---------- */
pres.addSection({ title: "Итог" });
s = pres.addSlide({ masterName: "DARK", sectionTitle: "Итог" });
title(s, "Что дальше", true);
const nW = (W - 2 * M - 2 * 0.35) / 3;
[["Пилот в классе", "один класс своей школы"],
 ["Больше эпох", "уровни до наших дней"],
 ["Отчёт учителю", "видно, кто отстал"]].forEach((n, i) => {
  s.addText([
    { text: n[0], options: { fontSize: 16, bold: true, color: "FFFFFF", breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: n[1], options: { fontSize: 13, color: "D8CBC6" } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.1, fill: { color: "6B332C" },
    x: M + i * (nW + 0.35), y: 2.3, w: nW, h: 1.3,
    align: "left", valign: "top", margin: [12, 14, 12, 14], objectName: "план " + (i + 1) });
});
s.addText("Курс по истории края ввели в 32 регионах — сделанное для Татарстана подойдёт и соседям",
  { x: M, y: 3.95, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 15,
    color: "D8CBC6", italic: true, valign: "top" });
s.addText([
  { text: "tathistory.tatnet.app", options: { fontSize: 22, bold: true, color: THEME.colors.accent4, breakLine: true } },
  { text: "Спасибо. Готов ответить на вопросы", options: { fontSize: 15, color: "A89189", breakLine: true } },
  { text: " ", options: { fontSize: 8, breakLine: true } },
  { text: "Фамилия Имя", options: { fontSize: 13, color: "8F7870", breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 13, color: "8F7870" } },
], { x: M, y: 4.75, w: 10.0, h: 2.2, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("ЗАМЕНИТЬ «Фамилия Имя». Закончить на планах и поблагодарить.");

(async () => {
  await pres.writeFile({ fileName: "/home/user/project/deck/Путешествие сквозь тысячелетия.pptx" });
  await applyTheme("/home/user/project/deck/Путешествие сквозь тысячелетия.pptx", THEME);
  console.log("готово");
})();
