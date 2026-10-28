const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/17b89be3-2205-4797-b5d7-966378d908a6_6cb4af85-50c3-47ac-a3a7-cdd3927cb574/pptx/scripts/apply_theme.js");

// Гамма снята с сайта svoya-eda.tatnet.app:
// светлый тёплый фон, серифные заголовки, зелёный акцент, белые карточки
const THEME = {
  name: "SvoyaEda",
  headFontFace: "Cambria",   // ближайший безопасный аналог Fraunces
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1A1A17", lt1: "FFFFFF",
    dk2: "14331E", lt2: "F7F7F2",
    accent1: "1E6B33", accent2: "19542A", accent3: "6B6B66",
    accent4: "3E9455", accent5: "E3F0E6", accent6: "E6E6DF",
    hlink: "1E6B33", folHlink: "6B6B66",
  },
};
const BG = "F7F7F2", INK = "1A1A17", MUTED = "6B6B66",
      GREEN = "1E6B33", PILL = "E3F0E6", LINE = "E6E6DF";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Проект «СвояЕда»";
pres.title = "СвояЕда — площадка для домашних продавцов";

const W = 13.3, H = 7.5, M = 0.9;

/* ---------- Макет: как на сайте — светлый фон, логотип сверху ---------- */
pres.defineSlideMaster({
  title: "PAGE",
  background: { color: BG },
});

/* ---------- Помощники ---------- */
// Логотип сайта. В мастере нельзя: pptxgenjs склеивает форматированный текст в строку
function logo(s) {
  s.addText([
    { text: "Своя", options: { bold: true, color: INK } },
    { text: "еда", options: { bold: true, color: GREEN } },
  ], { x: M, y: 0.4, w: 3, h: 0.35, fontSize: 16, fontFace: "Cambria",
    isTextBox: true, margin: 0, valign: "middle", objectName: "логотип" });
}

// Надзаголовок: шаг истории, связывает слайды в один рассказ
function eyebrow(s, text) {
  s.addText(text, { x: M, y: 1.0, w: W - 2 * M, h: 0.3, isTextBox: true, margin: 0,
    fontSize: 13, bold: true, color: GREEN, valign: "middle", objectName: "шаг" });
}

// Заголовок как на сайте: серифный, чёрный, с зелёным курсивным акцентом
function heading(s, parts, y = 1.3, size = 40) {
  s.addText(parts, { x: M, y, w: W - 2 * M, h: 1.0, isTextBox: true, margin: 0,
    fontSize: size, fontFace: "Cambria", color: INK, align: "left", valign: "middle", fit: "none" });
}

// Белая карточка со скруглением 12px, как в каталоге сайта
function card(s, { x, y, w, h, head, body, name, headSize = 16, bodySize = 13.5 }) {
  s.addText([
    { text: head, options: { fontSize: headSize, bold: true, color: INK, fontFace: "Cambria", breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: body, options: { fontSize: bodySize, color: MUTED } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.1, fill: { color: "FFFFFF" },
    line: { color: LINE, width: 1 }, x, y, w, h,
    align: "left", valign: "top", margin: [14, 16, 14, 16], objectName: name });
}

// Зелёная «таблетка», как метка «Самовывоз» на сайте
function pill(s, { x, y, w, text, name }) {
  s.addText(text, { shape: pres.ShapeType.roundRect, rectRadius: 0.5, fill: { color: PILL },
    x, y, w, h: 0.42, fontSize: 13, bold: true, color: GREEN,
    align: "center", valign: "middle", margin: 0, objectName: name });
}

/* ---------- 1. Титул ---------- */
pres.addSection({ title: "Открытие" });
let s = pres.addSlide({ masterName: "PAGE", sectionTitle: "Открытие" });
s.addImage({ path: "/home/user/project/deck/img/sait-telefon.png", x: 8.85, y: 0.2, w: 3.7, h: 6.15,
  objectName: "сайт на телефоне" });
logo(s);
s.addText([
  { text: "Свежее от ", options: { color: INK } },
  { text: "своих", options: { color: GREEN, italic: true } },
], { x: M, y: 2.2, w: 7.3, h: 1.3, isTextBox: true, margin: 0,
  fontSize: 50, fontFace: "Cambria", align: "left", valign: "middle", fit: "none" });
s.addText("Площадка, где видно, кто готовит и выращивает\nна продажу на соседних улицах",
  { x: M, y: 3.55, w: 7.3, h: 0.9, isTextBox: true, margin: 0, fontSize: 19,
    color: MUTED, align: "left", valign: "top" });
pill(s, { x: M, y: 4.65, w: 1.9, text: "Самовывоз", name: "метка 1" });
pill(s, { x: M + 2.1, y: 4.65, w: 2.3, text: "Рядом с вами", name: "метка 2" });
pill(s, { x: M + 4.6, y: 4.65, w: 2.1, text: "Свои люди", name: "метка 3" });
s.addText([
  { text: "Хамитов Амир", options: { fontSize: 17, bold: true, color: INK, breakLine: true } },
  { text: "Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 14, color: MUTED } },
], { x: M, y: 5.6, w: 9.0, h: 0.9, isTextBox: true, margin: 0, valign: "top", objectName: "подпись" });
s.addNotes("Представиться. Назвать проект одной фразой: площадка, где люди продают друг другу домашнюю еду и видят, кто торгует рядом.");

/* ---------- 2. Проблема ---------- */
pres.addSection({ title: "Проблема" });
s = pres.addSlide({ masterName: "PAGE", sectionTitle: "Проблема" });
logo(s);
eyebrow(s, "ШАГ 1 · КАК ПРОДАЮТ СЕЙЧАС");
heading(s, [
  { text: "Рядом, но ", options: { color: INK } },
  { text: "не находят", options: { color: GREEN, italic: true } },
  { text: " друг друга", options: { color: INK } },
], 1.6, 38);
s.addText("Моя бабушка собрала ведро клубники. На соседней улице есть человек, который купил бы его сегодня вечером. Они друг о друге не знают.",
  { x: M, y: 2.5, w: 10.5, h: 0.9, isTextBox: true, margin: 0, fontSize: 20,
    color: INK, align: "left", valign: "top" });
const cw = (W - 2 * M - 2 * 0.35) / 3;
card(s, { x: M, y: 3.6, w: cw, h: 1.75, head: "Рынок",
  body: "Ехать в райцентр и стоять там полдня ради одного ведра", name: "рынок" });
card(s, { x: M + cw + 0.35, y: 3.6, w: cw, h: 1.75, head: "Чат посёлка",
  body: "Объявление тонет за час, и непонятно, у кого вкусно", name: "чат" });
card(s, { x: M + 2 * (cw + 0.35), y: 3.6, w: cw, h: 1.75, head: "Никому",
  body: "Ведро остаётся дома и через два дня пропадает", name: "никак" });
s.addText("Клубника живёт два дня — покупателя надо найти сегодня. И он есть, в трёх домах отсюда.",
  { x: M, y: 5.6, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 16,
    italic: true, color: MUTED, valign: "top" });
s.addNotes("Историю рассказать своими словами. Слушатель должен увидеть картинку: ведро клубники и сосед через улицу. Добавить, что так же живут домашний повар и мини-пекарня.");

/* ---------- 3. Идея ---------- */
pres.addSection({ title: "Идея" });
s = pres.addSlide({ masterName: "PAGE", sectionTitle: "Идея" });
logo(s);
eyebrow(s, "ШАГ 2 · ЧТО ДЕЛАЕТ «СВОЯЕДА»");
heading(s, [
  { text: "То же ведро, но его ", options: { color: INK } },
  { text: "видно", options: { color: GREEN, italic: true } },
], 1.6, 38);
s.addText("Бабушка выкладывает клубнику за минуту — и её сразу видят соседи",
  { x: M, y: 2.45, w: 10.5, h: 0.45, isTextBox: true, margin: 0, fontSize: 19,
    color: MUTED, align: "left", valign: "top" });
const tw = (W - 2 * M - 2 * 0.35) / 3;
card(s, { x: M, y: 3.0, w: tw, h: 1.4, head: "Товар и цена",
  body: "Фотография, цена и единица — клубника, ведро", name: "каталог" });
card(s, { x: M + tw + 0.35, y: 3.0, w: tw, h: 1.4, head: "Отзывы",
  body: "Видно, у кого покупать второй раз", name: "отзывы" });
card(s, { x: M + 2 * (tw + 0.35), y: 3.0, w: tw, h: 1.4, head: "Самовывоз",
  body: "Забрал по пути, без доставки и курьеров", name: "самовывоз" });
card(s, { x: M, y: 4.55, w: tw, h: 1.4, head: "Две роли",
  body: "Покупать или стать продавцом — в один клик", name: "роли" });
card(s, { x: M + tw + 0.35, y: 4.55, w: tw, h: 1.4, head: "С телефона",
  body: "Открывается в браузере, ставить ничего не нужно", name: "телефон" });
s.addText("Ведро уходит в тот же вечер. Тут обычно спрашивают: а чем не подошли чат и Авито?",
  { x: M, y: 6.1, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 16,
    italic: true, color: MUTED, valign: "top" });
s.addNotes("Показать живой сайт: карточка товара с ценой и отзывы. Остальное перечислить бегло и сразу перейти к возражению.");

/* ---------- 4. Чем отличается ---------- */
pres.addSection({ title: "Отличие" });
s = pres.addSlide({ masterName: "PAGE", sectionTitle: "Отличие" });
logo(s);
eyebrow(s, "ШАГ 3 · ВОЗРАЖЕНИЕ");
heading(s, [
  { text: "Авито про вещи, мы — ", options: { color: INK } },
  { text: "про ужин", options: { color: GREEN, italic: true } },
], 1.6, 38);
s.addText("На Авито ищут диван и телефон, а не ведро клубники: объявление видно по всему городу, сделка идёт днями, а за свежей ягодой никто не поедет через полгорода. В чате объявление тонет за час, и всё равно непонятно, у кого вкусно.",
  { x: M, y: 2.45, w: 11.0, h: 1.0, isTextBox: true, margin: 0, fontSize: 17,
    color: INK, align: "left", valign: "top" });
const rows = [
  [{ text: "Где продают", options: { bold: true } }, { text: "Сколько ждать", options: { bold: true } },
   { text: "Видно, кто рядом", options: { bold: true } }, { text: "Есть репутация", options: { bold: true } }],
  ["Рынок в райцентре", "полдня стоять", "нет", "нет"],
  ["Чат посёлка", "тонет за час", "нет", "нет"],
  ["Авито и доски объявлений", "дни", "нет, весь город", "частично"],
  [{ text: "«СвояЕда»", options: { bold: true, color: GREEN } },
   { text: "в тот же вечер", options: { bold: true } },
   { text: "да, соседи", options: { bold: true } },
   { text: "да, отзывы", options: { bold: true } }],
];
s.addTable(rows, { x: M, y: 3.6, w: W - 2 * M, colW: [4.3, 2.4, 2.4, 2.4],
  fontSize: 13, color: INK, fontFace: "Calibri",
  border: { type: "solid", color: LINE, pt: 1 }, align: "left", valign: "middle",
  rowH: 0.45, fill: { color: "FFFFFF" }, objectName: "сравнение" });
s.addText("Еду рядом ищут не так, как диван в другом конце города. Поэтому для неё нужна своя площадка.",
  { x: M, y: 6.0, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0, fontSize: 16,
    italic: true, color: MUTED, valign: "top" });
s.addNotes("Про холодный старт отвечать честно: начинаем с продавцов, которых в районе и так все знают, первые отзывы появятся за неделю.");

/* ---------- 5. Финал ---------- */
pres.addSection({ title: "Итог" });
s = pres.addSlide({ masterName: "PAGE", sectionTitle: "Итог" });
logo(s);
eyebrow(s, "ШАГ 4 · ЧТО ДАЛЬШЕ");
heading(s, [
  { text: "Одно ведро — и ", options: { color: INK } },
  { text: "так же всё остальное", options: { color: GREEN, italic: true } },
], 1.75, 38);
s.addText("С клубникой получилось. Ровно так же продаются выпечка, мёд,\nмолоко и обеды — и в селе, и в городе.",
  { x: M, y: 2.7, w: 8.1, h: 1.0, isTextBox: true, margin: 0, fontSize: 18,
    color: MUTED, align: "left", valign: "top" });
const nW = (W - 2 * M - 2 * 0.35) / 3;
[["Первые продавцы", "те, кого в районе уже знают"],
 ["Новые районы", "та же схема, без переделок"]].forEach((n, i) => {
  card(s, { x: M + i * (nW + 0.35), y: 3.8, w: nW, h: 1.35,
    head: n[0], body: n[1], name: "план " + (i + 1), headSize: 15, bodySize: 13 });
});
s.addImage({ path: "/home/user/project/deck/img/sait-ekran.png", x: M + 2 * (nW + 0.35), y: 2.7,
  w: nW, h: 2.45, objectName: "сайт на экране" });
s.addText([
  { text: "svoya-eda.tatnet.app", options: { fontSize: 22, bold: true, color: GREEN,
    fontFace: "Cambria", breakLine: true } },
  { text: "Спасибо за внимание", options: { fontSize: 15, color: MUTED } },
], { x: M, y: 5.45, w: 10.0, h: 1.0, isTextBox: true, margin: 0, valign: "top", objectName: "финал" });
s.addNotes("Замкнуть историю: начали с ведра клубники, закончили тем, что схема повторяется для любого домашнего продавца. Поблагодарить.");

(async () => {
  await pres.writeFile({ fileName: "/home/user/project/deck/СвояЕда.pptx" });
  await applyTheme("/home/user/project/deck/СвояЕда.pptx", THEME);
  console.log("готово");
})();
