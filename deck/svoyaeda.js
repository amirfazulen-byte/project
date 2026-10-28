const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/17b89be3-2205-4797-b5d7-966378d908a6_6cb4af85-50c3-47ac-a3a7-cdd3927cb574/pptx/scripts/apply_theme.js");

// Тёплая янтарная гамма — урожай, домашняя еда
const THEME = {
  name: "SvoyaEda",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "23190E", lt1: "FFFFFF",
    dk2: "3E2B14", lt2: "EDF1E9",
    accent1: "B8761F", accent2: "8C5A15", accent3: "7A746B",
    accent4: "7D9E4F", accent5: "6E4610", accent6: "E3DED5",
    hlink: "B8761F", folHlink: "7A746B",
  },
};
const ON_DARK = "E8DDCB";
const ON_DARK_DIM = "BCAC92";
const ON_DARK_FAINT = "9A8B74";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Проект «СвояЕда»";
pres.title = "СвояЕда — площадка для домашних продавцов";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.7;
const FOOT = "СвояЕда · площадка для домашних продавцов";

/* ---------- Макеты ---------- */
const footer = { text: { text: FOOT, options: { x: M, y: H - 0.5, w: 7, h: 0.3,
  fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } };
const num = { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" };

pres.defineSlideMaster({ title: "DARK", background: { color: THEME.colors.dk2 }, objects: [] });
pres.defineSlideMaster({ title: "LIGHT", background: { color: C.background1 }, objects: [footer], slideNumber: num });
pres.defineSlideMaster({ title: "TINT", background: { color: C.background2 }, objects: [footer], slideNumber: num });

/* ---------- Помощники ---------- */
function title(s, text, dark) {
  s.addText(text, { x: M, y: dark ? 1.0 : 0.45, w: W - 2 * M, h: dark ? 1.0 : 0.9,
    isTextBox: true, margin: 0, fontSize: dark ? 40 : 38, bold: true,
    color: dark ? "FFFFFF" : THEME.colors.dk2, align: "left", valign: "middle", fit: "none" });
}

// Карточка одним объектом — текст внутри фигуры
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
s.addText("СвояЕда", { x: M, y: 1.4, w: 9.5, h: 1.2, isTextBox: true, margin: 0,
  fontSize: 52, bold: true, color: "FFFFFF", align: "left", valign: "middle", fit: "none" });
s.addText("Свежее от своих", { x: M, y: 2.65, w: 9.5, h: 0.6, isTextBox: true, margin: 0,
  fontSize: 22, color: THEME.colors.accent4, align: "left", valign: "top" });
s.addText("Домашние повара, мини-пекарни, огородники и бабушки с картошкой — всё на одной карте рядом с вами",
  { x: M, y: 3.3, w: 9.5, h: 0.6, isTextBox: true, margin: 0, fontSize: 17,
    color: ON_DARK, align: "left", valign: "top" });
s.addText([
  { text: "Фазуллин Амир", options: { fontSize: 19, bold: true, color: "FFFFFF", breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 15, color: ON_DARK, breakLine: true } },
  { text: " ", options: { fontSize: 6, breakLine: true } },
  { text: "Конкурс «Дай 5!» · ИТ-парк Татарстана", options: { fontSize: 13, color: ON_DARK_DIM } },
], { x: M, y: 4.4, w: 10.0, h: 1.6, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("Представиться. Назвать проект одной фразой: площадка, где жители посёлка продают друг другу домашнюю еду и видят, кто торгует на соседней улице.");

/* ---------- 2. Проблема ---------- */
pres.addSection({ title: "Проблема" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Проблема" });
title(s, "Рядом, но не находят друг друга");
s.addText([
  { text: "Бабушка в Урусу собрала ведро клубники. Через два дня она испортится. Ехать на рынок — стоять там полдня. Выложить на Авито — пока найдут и договорятся, ягоды пропадут. А на соседней улице есть человек, который купил бы её сегодня вечером.",
    options: { fontSize: 16, color: C.text1 } },
], { x: M, y: 1.4, w: W - 2 * M, h: 0.9, isTextBox: true, margin: 0, valign: "top" });
s.addText("То же самое у домашнего повара в городе, у мини-пекарни и у любого, кто готовит или выращивает на продажу",
  { x: M, y: 2.3, w: W - 2 * M, h: 0.4, isTextBox: true, margin: 0, fontSize: 15,
    italic: true, color: THEME.colors.accent3, valign: "top" });
const cw = (W - 2 * M - 2 * 0.4) / 3;
statCard(s, { x: M, y: 2.85, w: cw, h: 1.85, value: "401 000", valueSize: 34,
  label: "личных подсобных хозяйств в Татарстане — данные Минсельхоза РТ", name: "лпх" });
statCard(s, { x: M + cw + 0.4, y: 2.85, w: cw, h: 1.85, value: "142 млрд ₽", valueSize: 28,
  label: "продукции в год от малых хозяйств — 42% всего сельхозпроизводства республики", name: "объём" });
statCard(s, { x: M + 2 * (cw + 0.4), y: 2.85, w: cw, h: 1.85, value: "2 дня", valueSize: 34,
  label: "столько живёт свежая ягода — продать нужно сегодня, а не через неделю", name: "срок" });
s.addText([
  { text: "Суть проблемы", options: { fontSize: 17, bold: true, color: THEME.colors.dk2, breakLine: true } },
  { text: " ", options: { fontSize: 7, breakLine: true } },
  { text: "Нет простого места, где видно, что продаётся рядом с тобой прямо сейчас. Рынок далеко, чат тонет, а большие площадки рассчитаны на доставку через всю страну.",
    options: { fontSize: 15, color: C.text1 } },
], { shape: pres.ShapeType.roundRect, rectRadius: 0.08, fill: { color: THEME.colors.lt2 },
  x: M, y: 4.9, w: W - 2 * M, h: 1.3, align: "left", valign: "top", margin: [16, 20, 16, 20],
  objectName: "суть" });
s.addNotes("Историю про клубнику рассказать своими словами, не читать. Сразу подчеркнуть, что это пример: та же задача у домашних поваров и мини-пекарен в городе. Цифры — Минсельхоз Татарстана.");

/* ---------- 3. Решение ---------- */
pres.addSection({ title: "Решение" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Решение" });
title(s, "Сосед видит соседа");
const tw = (W - 2 * M - 2 * 0.4) / 3;
card(s, { x: M, y: 1.75, w: tw, h: 1.8, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Карта и расстояние",
  body: "Видно, кто продаёт рядом и сколько до него идти", name: "карта" });
card(s, { x: M + tw + 0.4, y: 1.75, w: tw, h: 1.8, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Каталог с ценой",
  body: "Товар, цена, единица — клубника, 250 ₽ за ведро", name: "каталог" });
card(s, { x: M + 2 * (tw + 0.4), y: 1.75, w: tw, h: 1.8, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Отзывы и рейтинг",
  body: "Видно, у кого покупать второй раз", name: "отзывы" });
card(s, { x: M, y: 3.7, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Самовывоз",
  body: "Забрал по пути, без доставки", name: "самовывоз" });
card(s, { x: M + tw + 0.4, y: 3.7, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Две роли",
  body: "Покупать или стать продавцом", name: "роли" });
card(s, { x: M + 2 * (tw + 0.4), y: 3.7, w: tw, h: 1.5, fill: "FFFFFF", line: true,
  headColor: THEME.colors.accent1, bodyColor: C.text1, head: "Телефон",
  body: "Открывается в браузере, ставить нечего", name: "телефон" });
s.addText("Бабушке не нужен компьютер: выложила с телефона — и соседи увидели в тот же вечер",
  { x: M, y: 5.4, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 15,
    bold: true, color: THEME.colors.dk2, valign: "top" });
s.addNotes("Главное показать карту с расстоянием — этого нет ни в чате, ни на Авито. Остальное перечислять бегло.");

/* ---------- 4. Чем отличается ---------- */
pres.addSection({ title: "Рынок" });
s = pres.addSlide({ masterName: "TINT", sectionTitle: "Рынок" });
title(s, "Почему не чат и не Авито");
s.addText("В сельском чате объявление тонет за час, и всё равно не знаешь, у кого клубника вкусная. На сайте у продавца остаются отзывы — сразу видно, к кому идти второй раз.",
  { x: M, y: 1.5, w: W - 2 * M, h: 0.7, isTextBox: true, margin: 0, fontSize: 15,
    bold: true, color: THEME.colors.dk2, valign: "top" });
const rows = [
  [{ text: "Как продают сейчас", options: { bold: true } }, { text: "Сколько ждать", options: { bold: true } },
   { text: "Видно, кто рядом", options: { bold: true } }, { text: "Есть репутация", options: { bold: true } }],
  ["Рынок в райцентре", "полдня стоять", "нет", "нет"],
  ["Чат посёлка", "тонет за час", "нет", "нет"],
  ["Авито", "дни", "нет", "частично"],
  [{ text: "«СвояЕда»", options: { bold: true, color: THEME.colors.accent1 } },
   { text: "в тот же вечер", options: { bold: true } },
   { text: "да, на карте", options: { bold: true } },
   { text: "да, отзывы", options: { bold: true } }],
];
s.addTable(rows, { x: M, y: 2.35, w: W - 2 * M, colW: [4.4, 2.7, 2.6, 2.2],
  fontSize: 13, color: "23190E", fontFace: "Calibri",
  border: { type: "solid", color: THEME.colors.accent6, pt: 1 }, align: "left", valign: "middle",
  rowH: 0.45, fill: { color: "FFFFFF" }, objectName: "сравнение" });
s.addNotes("Если спросят про холодный старт — отвечать честно: начинаем с десятка знакомых продавцов, которых в посёлке и так все знают, первые отзывы появятся за неделю.");

/* ---------- 5. Планы ---------- */
pres.addSection({ title: "Итог" });
s = pres.addSlide({ masterName: "DARK", sectionTitle: "Итог" });
title(s, "Что дальше", true);
const nW = (W - 2 * M - 2 * 0.35) / 3;
[["Первые продавцы", "начать с тех, кого в районе уже знают"],
 ["Новые районы", "та же схема без переделок"],
 ["Уведомления", "«рядом появилась клубника»"]].forEach((n, i) => {
  s.addText([
    { text: n[0], options: { fontSize: 16, bold: true, color: "FFFFFF", breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: n[1], options: { fontSize: 13, color: ON_DARK } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.1, fill: { color: "5A3F1E" },
    x: M + i * (nW + 0.35), y: 2.3, w: nW, h: 1.4,
    align: "left", valign: "top", margin: [12, 14, 12, 14], objectName: "план " + (i + 1) });
});
s.addText("401 тысяча хозяйств в одном Татарстане — и столько же домашних кухонь в городах. Площадка работает одинаково везде",
  { x: M, y: 3.95, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 15,
    color: ON_DARK, italic: true, valign: "top" });
s.addText([
  { text: "svoya-eda.tatnet.app", options: { fontSize: 22, bold: true, color: THEME.colors.accent4, breakLine: true } },
  { text: "Спасибо. Готов ответить на вопросы", options: { fontSize: 15, color: ON_DARK_DIM, breakLine: true } },
  { text: " ", options: { fontSize: 8, breakLine: true } },
  { text: "Фазуллин Амир", options: { fontSize: 13, color: ON_DARK_FAINT, breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 13, color: ON_DARK_FAINT } },
], { x: M, y: 4.6, w: 10.0, h: 1.9, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("Закончить на том, что решение подходит любому селу, и поблагодарить.");

(async () => {
  await pres.writeFile({ fileName: "/home/user/project/deck/СвояЕда.pptx" });
  await applyTheme("/home/user/project/deck/СвояЕда.pptx", THEME);
  console.log("готово");
})();
