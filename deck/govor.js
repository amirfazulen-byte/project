const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/17b89be3-2205-4797-b5d7-966378d908a6_6cb4af85-50c3-47ac-a3a7-cdd3927cb574/pptx/scripts/apply_theme.js");

// Спокойная бирюзовая гамма — под тему «без оценок, без давления»
const THEME = {
  name: "Spokoyno",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "16262B", lt1: "FFFFFF",
    dk2: "04414F", lt2: "F1F8F8",
    accent1: "028090", accent2: "00A896", accent3: "6B7B80",
    accent4: "02C39A", accent5: "0C6070", accent6: "D5E4E6",
    hlink: "028090", folHlink: "6B7B80",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Проект «Спокойно у доски»";
pres.title = "Спокойно у доски — тренажёр для школьников";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.7;

/* ---------- Макеты: только фон и подвал, заголовки ставим надписями ---------- */

pres.defineSlideMaster({
  title: "DARK",
  background: { color: THEME.colors.dk2 },
  objects: [],
});

pres.defineSlideMaster({
  title: "LIGHT",
  background: { color: C.background1 },
  objects: [
    { text: { text: "Спокойно у доски · тренажёр для школьников", options: { x: M, y: H - 0.5, w: 7, h: 0.3,
      fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" },
});

pres.defineSlideMaster({
  title: "TINT",
  background: { color: C.background2 },
  objects: [
    { text: { text: "Спокойно у доски · тренажёр для школьников", options: { x: M, y: H - 0.5, w: 7, h: 0.3,
      fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" },
});

/* ---------- Помощники ---------- */

// Заголовок слайда — всегда обычная надпись: шаблонные блоки PowerPoint сдвигает сам
function title(s, text, dark) {
  s.addText(text, { x: M, y: dark ? 1.0 : 0.45, w: W - 2 * M, h: dark ? 1.0 : 0.9,
    isTextBox: true, margin: 0, fontSize: dark ? 40 : 38, bold: true,
    color: dark ? "FFFFFF" : THEME.colors.dk2, align: "left", valign: "middle", fit: "none" });
}

// Карточка целиком одним объектом — ничего не разъедется
function card(s, { x, y, w, h, head, body, headSize = 17, bodySize = 14, fill, headColor, bodyColor, name }) {
  s.addText([
    { text: head, options: { fontSize: headSize, bold: true, color: headColor, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: body, options: { fontSize: bodySize, color: bodyColor } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: fill },
    line: fill === "FFFFFF" ? { color: THEME.colors.accent6, width: 1 } : undefined,
    x, y, w, h, align: "left", valign: "top", margin: [14, 16, 14, 16], objectName: name });
}

function statCard(s, { x, y, w, h, value, label, color, valueSize = 30, name }) {
  s.addText([
    { text: value, options: { fontSize: valueSize, bold: true, color, breakLine: true } },
    { text: " ", options: { fontSize: 7, breakLine: true } },
    { text: label, options: { fontSize: 13, color: THEME.colors.accent3 } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: "FFFFFF" },
    line: { color: THEME.colors.accent6, width: 1 },
    x, y, w, h, align: "left", valign: "top", margin: [14, 16, 14, 16], objectName: name });
}

/* ---------- 1. Титул ---------- */
pres.addSection({ title: "Открытие" });
let s = pres.addSlide({ masterName: "DARK", sectionTitle: "Открытие" });
s.addText("Спокойно у доски", { x: M, y: 2.3, w: 9.0, h: 1.2, isTextBox: true, margin: 0,
  fontSize: 52, bold: true, color: "FFFFFF", align: "left", valign: "middle", fit: "none" });
s.addText("Не надо быть идеальным — надо быть понятным", { x: M, y: 3.6, w: 9.0, h: 0.6,
  isTextBox: true, margin: 0, fontSize: 20, color: THEME.colors.accent4, align: "left", valign: "top" });
s.addText("Тренажёр для школьников, которые боятся отвечать у доски", { x: M, y: 4.25, w: 9.0, h: 0.5,
  isTextBox: true, margin: 0, fontSize: 16, color: "C5DADD", align: "left", valign: "top" });
s.addText([
  { text: "Батыршин Ильназ", options: { fontSize: 19, bold: true, color: "FFFFFF", breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 15, color: "C5DADD", breakLine: true } },
  { text: " ", options: { fontSize: 6, breakLine: true } },
  { text: "Школьный конкурс по технологическому предпринимательству · ИТ-парк Татарстана",
    options: { fontSize: 13, color: "8FAEB3" } },
], { x: M, y: 5.45, w: 10.0, h: 1.5, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("Представиться и назвать проект одной фразой: тренажёр, который помогает школьнику не бояться отвечать у доски.");

/* ---------- 2. Проблема ---------- */
pres.addSection({ title: "Проблема" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Проблема" });
title(s, "Страх у доски мешает учиться");
const cw = (W - 2 * M - 2 * 0.4) / 3;
statCard(s, { x: M, y: 1.75, w: cw, h: 2.0, value: "11%", valueSize: 38,
  label: "людей в России боятся публичных выступлений — опрос ВЦИОМ", color: THEME.colors.accent1,
  name: "вциом" });
statCard(s, { x: M + cw + 0.4, y: 1.75, w: cw, h: 2.0, value: "65%", valueSize: 38,
  label: "школьников знаком этот страх — опрос 114 учеников в школьном исследовании",
  color: THEME.colors.accent1, name: "школьники" });
statCard(s, { x: M + 2 * (cw + 0.4), y: 1.75, w: cw, h: 2.0, value: "6 и 8 класс", valueSize: 24,
  label: "возраст, когда страх встречается чаще всего", color: THEME.colors.accent1, name: "возраст" });
s.addText([
  { text: "Что происходит на уроке", options: { fontSize: 17, bold: true, color: THEME.colors.dk2, breakLine: true } },
  { text: " ", options: { fontSize: 7, breakLine: true } },
  { text: "Ученик знает материал, но у доски теряется: забывает структуру, говорит обрывками, получает оценку ниже своих знаний. Со временем начинает избегать ответов вообще.",
    options: { fontSize: 15, color: C.text1 } },
], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: THEME.colors.lt2 },
  x: M, y: 4.05, w: W - 2 * M, h: 1.6, align: "left", valign: "top", margin: [16, 20, 16, 20],
  objectName: "что происходит" });
s.addText("Школьное исследование — небольшая выборка. Свои цифры по классу надёжнее: опросите 20–30 одноклассников.",
  { x: M, y: 5.8, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 12,
    color: THEME.colors.accent3, italic: true, valign: "top" });
s.addNotes("Цифра ВЦИОМ — про взрослых, это честно и стоит сказать. 65% и возраст 6–8 класса — из школьного исследования на 114 учениках, выборка небольшая. ЛУЧШЕ ВСЕГО: опросить 20–30 одноклассников и поставить свою цифру — это сильнее любой чужой статистики.");

/* ---------- 3. Решение ---------- */
pres.addSection({ title: "Решение" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Решение" });
title(s, "Три инструмента вместо советов");
const tw = (W - 2 * M - 2 * 0.4) / 3;
card(s, { x: M, y: 1.75, w: tw, h: 2.5, fill: "FFFFFF", headColor: THEME.colors.accent1,
  bodyColor: C.text1, head: "Быстрые приёмы",
  body: "Дыхание 4-7-8, точка опоры под ногами, один спокойный взгляд в классе. Работают за 10–15 секунд, пока идёшь к доске.",
  name: "приёмы" });
card(s, { x: M + tw + 0.4, y: 1.75, w: tw, h: 2.5, fill: "FFFFFF", headColor: THEME.colors.accent1,
  bodyColor: C.text1, head: "Скелет ответа",
  body: "Вступление, 2–3 главных момента, вывод. Готовые фразы можно скопировать: «Я хочу рассказать о…», «Во-первых, …», «Таким образом, …».",
  name: "скелет" });
card(s, { x: M + 2 * (tw + 0.4), y: 1.75, w: tw, h: 2.5, fill: "FFFFFF", headColor: THEME.colors.accent1,
  bodyColor: C.text1, head: "Тренажёр на минуту",
  body: "Выбираешь тему или крутишь колесо, за минуту записываешь тезисы и отмечаешь, что получилось. Без оценки.",
  name: "тренажёр" });
s.addText([
  { text: "Главный принцип — без оценок", options: { fontSize: 17, bold: true, color: "FFFFFF", breakLine: true } },
  { text: " ", options: { fontSize: 7, breakLine: true } },
  { text: "Там, где ставят оценку, страх только растёт. Здесь ученик тренируется один, в своём темпе, и никто не видит его ошибок.",
    options: { fontSize: 15, color: "D5EDEF" } },
], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: THEME.colors.accent1 },
  x: M, y: 4.5, w: W - 2 * M, h: 1.5, align: "left", valign: "top", margin: [16, 20, 16, 20],
  objectName: "принцип" });
s.addNotes("Подчеркнуть: это не советы «не волнуйся», а конкретные действия, которые можно сделать прямо сейчас у доски.");
/* ---------- 4. Чем отличается ---------- */
pres.addSection({ title: "Рынок" });
s = pres.addSlide({ masterName: "TINT", sectionTitle: "Рынок" });
title(s, "Чем отличается от курсов");
const rows = [
  [{ text: "Что есть сейчас", options: { bold: true } }, { text: "Сколько стоит", options: { bold: true } },
   { text: "Сколько занимает", options: { bold: true } }, { text: "Есть оценка", options: { bold: true } }],
  ["Курс ораторского искусства", "от 29 990 ₽", "недели", "да"],
  ["Репетитор по риторике", "платно", "месяцы", "да"],
  ["Школьный психолог", "бесплатно", "по записи", "нет"],
  ["Советы в интернете", "бесплатно", "минуты", "нет"],
  [{ text: "«Спокойно у доски»", options: { bold: true, color: THEME.colors.accent1 } },
   { text: "бесплатно", options: { bold: true } },
   { text: "1 минута", options: { bold: true } },
   { text: "нет", options: { bold: true } }],
];
// Вывод ставим НАД таблицей: в PowerPoint строки таблицы растут под текст
// и наползли бы на подпись снизу
s.addText("Курсы учат выступать вообще. Здесь решается одна конкретная ситуация — ответ у доски, и тренировка занимает минуту, а не недели.",
  { x: M, y: 1.5, w: W - 2 * M, h: 0.7, isTextBox: true, margin: 0, fontSize: 15,
    bold: true, color: THEME.colors.dk2, valign: "top" });
s.addTable(rows, { x: M, y: 2.35, w: W - 2 * M, colW: [4.4, 2.7, 2.6, 2.2],
  fontSize: 13, color: "16262B", fontFace: "Calibri",
  border: { type: "solid", color: THEME.colors.accent6, pt: 1 }, align: "left", valign: "middle",
  rowH: 0.45, fill: { color: "FFFFFF" }, objectName: "сравнение" });
s.addNotes("Цена 29 990 ₽ — реальный онлайн-курс ораторского искусства, найден в открытом доступе. Главная мысль слайда: мы решаем узкую задачу быстро, а не учим ораторскому мастерству вообще.");

/* ---------- 5. Планы ---------- */
pres.addSection({ title: "Итог" });
s = pres.addSlide({ masterName: "DARK", sectionTitle: "Итог" });
title(s, "Что дальше", true);
const nW = (W - 2 * M - 2 * 0.35) / 3;
// Карточки с запасом по высоте: в PowerPoint шрифт шире и текст вылезал за края
const nexts = [
  ["Запись голоса", "проговорить ответ вслух"],
  ["Темы по предметам", "биология, история, литература"],
  ["Класс целиком", "учитель открывает всему классу"],
];
nexts.forEach((n, i) => {
  s.addText([
    { text: n[0], options: { fontSize: 16, bold: true, color: "FFFFFF", breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: n[1], options: { fontSize: 13, color: "C5DADD" } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.1, fill: { color: "0C6070" },
    x: M + i * (nW + 0.35), y: 2.3, w: nW, h: 1.3,
    align: "left", valign: "top", margin: [12, 14, 12, 14], objectName: "план " + (i + 1) });
});
s.addText("Начать можно с одного класса: тренажёр ничего не стоит и не требует разрешений",
  { x: M, y: 3.95, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 15,
    color: "C5DADD", italic: true, valign: "top" });
s.addText([
  { text: "govor.tatnet.app", options: { fontSize: 22, bold: true, color: THEME.colors.accent4, breakLine: true } },
  { text: "Спасибо. Готов ответить на вопросы", options: { fontSize: 15, color: "8FAEB3", breakLine: true } },
  { text: " ", options: { fontSize: 8, breakLine: true } },
  { text: "Батыршин Ильназ", options: { fontSize: 13, color: "6E8E94", breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 13, color: "6E8E94" } },
], { x: M, y: 4.75, w: 10.0, h: 2.2, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("Закончить на планах и поблагодарить.");

(async () => {
  await pres.writeFile({ fileName: "/home/user/project/deck/Спокойно у доски.pptx" });
  await applyTheme("/home/user/project/deck/Спокойно у доски.pptx", THEME);
  console.log("готово");
})();
