const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/17b89be3-2205-4797-b5d7-966378d908a6_6cb4af85-50c3-47ac-a3a7-cdd3927cb574/pptx/scripts/apply_theme.js");

// Палитра под тему контроля и предписаний: вишнёвый как сигнал штрафа,
// глубокий синий как опора, светлый фон для содержательных слайдов.
const THEME = {
  name: "Birka",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1C1C20", lt1: "FFFFFF",
    dk2: "2F3C7E", lt2: "FCF6F5",
    accent1: "990011", accent2: "2F3C7E", accent3: "6B7280",
    accent4: "1F7A4D", accent5: "B88A00", accent6: "D9DDE3",
    hlink: "2F3C7E", folHlink: "6B7280",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";       // 13.3 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Проект «Бирка»";
pres.title = "Бирка — проверка этикетки по техрегламенту";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.7;

/* ---------- Макеты ---------- */

pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: THEME.colors.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.5, w: W - 2 * M, h: 1.5,
      fontSize: 54, bold: true, color: C.background1, align: "left" }, text: " " } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.05, w: 8.4, h: 1.5,
      fontSize: 18, color: "D9DDE3", align: "left" }, text: " " } },
  ],
});

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: W - 2 * M, h: 0.9,
      fontSize: 38, bold: true, color: C.text2, align: "left" }, text: " " } },
    { text: { text: "Бирка · проверка этикетки по техрегламенту", options: { x: M, y: H - 0.5, w: 7, h: 0.3,
      fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" },
});

pres.defineSlideMaster({
  title: "CONTENT_TINT",
  background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: W - 2 * M, h: 0.9,
      fontSize: 38, bold: true, color: C.text2, align: "left" }, text: " " } },
    { text: { text: "Бирка · проверка этикетки по техрегламенту", options: { x: M, y: H - 0.5, w: 7, h: 0.3,
      fontSize: 10, color: THEME.colors.accent3, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.4, h: 0.3, fontSize: 10, color: THEME.colors.accent3, align: "right" },
});

pres.defineSlideMaster({
  title: "CLOSING",
  background: { color: THEME.colors.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 1.1, w: W - 2 * M, h: 1.0,
      fontSize: 40, bold: true, color: C.background1, align: "left", valign: "middle" }, text: " " } },
  ],
});

/* ---------- Помощники ---------- */

// Крупная цифра в карточке
function statCard(s, { x, y, w, h, value, label, color, valueSize = 40, name }) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08,
    fill: { color: C.background1 }, line: { color: THEME.colors.accent6, width: 1 },
    shadow: { type: "outer", color: "1C1C20", opacity: 0.08, blur: 8, offset: 2, angle: 90 },
    objectName: name });
  s.addText(value, { x: x + 0.22, y: y + 0.16, w: w - 0.44, h: 0.72, isTextBox: true, margin: 0,
    fontSize: valueSize, bold: true, color, align: "left", valign: "middle" });
  s.addText(label, { x: x + 0.22, y: y + 0.95, w: w - 0.44, h: h - 1.1, isTextBox: true, margin: 0,
    fontSize: 13, color: THEME.colors.accent3, align: "left", valign: "top" });
}

// Нумерованный шаг с кружком
function stepRow(s, { x, y, w, n, head, sub }) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.52, h: 0.52, fill: { color: THEME.colors.accent2 } });
  s.addText(String(n), { x, y, w: 0.52, h: 0.52, isTextBox: true, margin: 0,
    fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
  s.addText(head, { x: x + 0.75, y: y - 0.02, w: w - 0.75, h: 0.34, isTextBox: true, margin: 0,
    fontSize: 17, bold: true, color: C.text1 });
  s.addText(sub, { x: x + 0.75, y: y + 0.3, w: w - 0.75, h: 0.4, isTextBox: true, margin: 0,
    fontSize: 13, color: THEME.colors.accent3 });
}

/* ---------- 1. Титул ---------- */
pres.addSection({ title: "Открытие" });
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Открытие" });
s.addText("Бирка", { placeholder: "title" });
s.addText("Проверка этикетки товара на соответствие техрегламенту — за минуту, по фотографии",
  { placeholder: "body" });
s.addShape(pres.ShapeType.roundRect, { x: W - M - 2.9, y: 2.5, w: 2.9, h: 2.0, rectRadius: 0.1,
  fill: { color: THEME.colors.accent1 }, objectName: "знак штрафа" });
s.addText("до 1 млн ₽", { x: W - M - 2.75, y: 2.85, w: 2.6, h: 0.65, isTextBox: true, margin: 0,
  fontSize: 28, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
s.addText("штраф за нарушение\nмаркировки", { x: W - M - 2.75, y: 3.5, w: 2.6, h: 0.8, isTextBox: true,
  margin: 0, fontSize: 13, color: "F3C6C6", align: "center", valign: "top" });
s.addText("Фазуллин Амир", { x: M, y: H - 1.75, w: W - 2 * M, h: 0.4, isTextBox: true, margin: 0,
  fontSize: 19, bold: true, color: "FFFFFF" });
s.addText("Лицей-интернат имени Мустафы Онджеля", { x: M, y: H - 1.35, w: W - 2 * M, h: 0.35,
  isTextBox: true, margin: 0, fontSize: 15, color: "D9DDE3" });
s.addText("Школьный конкурс по технологическому предпринимательству · ИТ-парк Татарстана",
  { x: M, y: H - 0.95, w: W - 2 * M, h: 0.4, isTextBox: true, margin: 0, fontSize: 13, color: "AEB6C9" });
s.addNotes("Представиться: имя, лицей-интернат. Назвать проект одной фразой: сервис проверяет этикетку товара на соответствие техническому регламенту и сразу показывает, чем грозит нарушение.");

/* ---------- 2. Проблема ---------- */
pres.addSection({ title: "Проблема" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Проблема" });
s.addText("Ошибка на этикетке дороже товара", { placeholder: "title" });
const cardW = (W - 2 * M - 2 * 0.4) / 3;
statCard(s, { x: M, y: 1.75, w: cardW, h: 2.0, value: "100–300 тыс. ₽",
  label: "штраф юрлицу за нарушение маркировки, ч. 1 ст. 14.43 КоАП", color: THEME.colors.accent1,
  valueSize: 26, name: "штраф ч.1" });
statCard(s, { x: M + cardW + 0.4, y: 1.75, w: cardW, h: 2.0, value: "до 1 млн ₽",
  label: "по ч. 3 той же статьи, плюс конфискация всей партии", color: THEME.colors.accent1,
  valueSize: 26, name: "штраф ч.3" });
statCard(s, { x: M + 2 * (cardW + 0.4), y: 1.75, w: cardW, h: 2.0, value: "16 100 ₽",
  label: "и от 3 дней — ручная разработка этикетки в сертификационном центре",
  color: THEME.colors.accent2, valueSize: 26, name: "цена вручную" });
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.05, w: W - 2 * M, h: 1.95, rectRadius: 0.08,
  fill: { color: C.background2 }, line: { color: THEME.colors.accent6, width: 1 }, objectName: "кто страдает" });
s.addText("Кого это касается", { x: M + 0.35, y: 4.25, w: 5, h: 0.35, isTextBox: true, margin: 0,
  fontSize: 17, bold: true, color: C.text2 });
s.addText([
  { text: "1,26 млн активных продавцов на Ozon и Wildberries", options: { bullet: true, breakLine: true } },
  { text: "Малые производства, пекарни, фермерские бренды", options: { bullet: true, breakLine: true } },
  { text: "Типографии и дизайн-студии, которые делают макеты этикеток", options: { bullet: true } },
], { x: M + 0.35, y: 4.7, w: W - 2 * M - 0.7, h: 1.1, isTextBox: true, margin: 0,
  fontSize: 15, color: C.text1, paraSpaceAfter: 6 });
s.addNotes("Главное: штраф несопоставим с ценой товара, а конфискация партии обычно дороже самого штрафа. Источник — статья 14.43 КоАП, число продавцов — Data Insight, 2025.");

/* ---------- 3. Решение ---------- */
pres.addSection({ title: "Решение" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Решение" });
s.addText("Как работает «Бирка»", { placeholder: "title" });
stepRow(s, { x: M, y: 1.75, w: 6.4, n: 1, head: "Сфотографировать этикетку",
  sub: "или вставить текст, если фото нечитаемое" });
stepRow(s, { x: M, y: 2.85, w: 6.4, n: 2, head: "Сервис сверяет текст с регламентом",
  sub: "ТР ТС 022/2011 — продукты, 017/2011 — одежда, закон о защите прав потребителей — остальное" });
stepRow(s, { x: M, y: 4.25, w: 6.4, n: 3, head: "Отчёт с номерами пунктов и суммой риска",
  sub: "и готовый исправленный текст этикетки" });
s.addShape(pres.ShapeType.roundRect, { x: M + 7.0, y: 1.75, w: W - M - (M + 7.0), h: 4.05, rectRadius: 0.1,
  fill: { color: C.background2 }, line: { color: THEME.colors.accent6, width: 1 }, objectName: "пример отчёта" });
s.addText("Пример отчёта", { x: M + 7.3, y: 1.95, w: 4.2, h: 0.3, isTextBox: true, margin: 0,
  fontSize: 14, bold: true, color: THEME.colors.accent3 });
s.addShape(pres.ShapeType.roundRect, { x: M + 7.3, y: 2.35, w: W - M - (M + 7.3) - 0.3, h: 1.15, rectRadius: 0.08,
  fill: { color: "FDE7E7" }, line: { color: THEME.colors.accent1, width: 1 } });
s.addText([
  { text: "82%\n", options: { fontSize: 30, bold: true, color: THEME.colors.accent1 } },
  { text: "Соответствие · 9 из 11 сведений", options: { fontSize: 12, color: "7A2A2A" } },
], { x: M + 7.5, y: 2.45, w: 4.0, h: 0.95, isTextBox: true, margin: 0, valign: "middle" });
s.addText([
  { text: "Нет показателей пищевой ценности", options: { bullet: true, breakLine: true, bold: true } },
  { text: "п. 4.1 ТР ТС 022/2011", options: { breakLine: true, fontSize: 11, color: THEME.colors.accent3 } },
  { text: "Нет сведений о ГМО", options: { bullet: true, breakLine: true, bold: true } },
  { text: "п. 4.1 ТР ТС 022/2011", options: { fontSize: 11, color: THEME.colors.accent3 } },
], { x: M + 7.3, y: 3.65, w: W - M - (M + 7.3) - 0.3, h: 1.3, isTextBox: true, margin: 0,
  fontSize: 13, color: C.text1 });
s.addText("Ориентировочный риск: 100–300 тыс. ₽ (ч. 1 ст. 14.43 КоАП)",
  { x: M + 7.3, y: 5.05, w: W - M - (M + 7.3) - 0.3, h: 0.6, isTextBox: true, margin: 0,
    fontSize: 12, bold: true, color: THEME.colors.accent1 });
s.addNotes("Здесь переходим к живой демонстрации: попросить у жюри любой товар в упаковке и проверить его. Если сеть подведёт — показать заранее сохранённые скриншоты.");

/* ---------- 4. Демонстрация ---------- */
s = pres.addSlide({ masterName: "CLOSING", sectionTitle: "Решение" });
s.addText("Проверим прямо сейчас", { x: M, y: 1.0, w: W - 2 * M, h: 1.0, isTextBox: true, margin: 0,
  fontSize: 40, bold: true, color: "FFFFFF", align: "left", valign: "middle", fit: "none" });
s.addText("Дайте любой товар в упаковке — через минуту вы увидите, чего не хватает на его этикетке",
  { x: M, y: 2.45, w: 9.5, h: 0.9, isTextBox: true, margin: 0, fontSize: 20, color: "D9DDE3",
    valign: "top" });
// Кнопка одним объектом: текст внутри фигуры, иначе PowerPoint выравнивает его по-своему
s.addText("birka.tatnet.app", { shape: pres.ShapeType.roundRect, rectRadius: 0.12,
  fill: { color: THEME.colors.accent4 }, x: M, y: 3.75, w: 5.6, h: 1.0,
  fontSize: 24, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  objectName: "адрес сайта" });
s.addText("Работает в браузере телефона. Ничего не нужно устанавливать.",
  { x: M, y: 5.0, w: 9.5, h: 0.4, isTextBox: true, margin: 0, fontSize: 14, color: "AEB6C9",
    valign: "top" });
s.addNotes("Сайт открыть ЗАРАНЕЕ и не закрывать вкладку. Держать под рукой скриншоты отчётов и текст этикетки в заметках телефона — на случай сбоя сети.\n\nОТВЕТЫ НА ВОПРОСЫ ПОСЛЕ ДЕМОНСТРАЦИИ (говорить, если спросят):\n• Проверка предварительная, она не заменяет декларирование соответствия.\n• Высоту шрифта по фотографии не измеряем — приложение задаёт вопрос пользователю.\n• Точность: сверил 5 этикеток вручную, совпадение 94,5 процента. Хуже всего распознаётся дата, выбитая на упаковке, а не напечатанная. Поэтому есть ручной ввод текста.\n• Выделение аллергенов полужирным — рекомендация для читаемости, а не требование регламента.\n• Если фото нечитаемое, сервис честно говорит об этом и предлагает ввести текст вручную.");

/* ---------- 5. Конкуренты ---------- */
pres.addSection({ title: "Рынок" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Рынок" });
s.addText("Текст этикетки не проверяет никто", { placeholder: "title" });
const rows = [
  [{ text: "Сервис", options: { bold: true } }, { text: "Что проверяет", options: { bold: true } },
   { text: "Срок", options: { bold: true } }, { text: "Цена", options: { bold: true } }],
  ["Сертификационный центр", "Текст, даёт официальное заключение", "от 3 дней", "от 16 100 ₽"],
  ["«Честный знак», ГИС МТ", "Только коды маркировки", "сразу", "бесплатно"],
  ["МойСклад, SelSup, GetMark", "Печать и оформление этикеток", "сразу", "платно"],
  ["«Аудит карточек» Точки", "Качество карточки для продаж", "сразу", "бесплатно"],
  ["Nord Clan", "Машинное зрение на производственной линии", "—", "корпоративно"],
  [{ text: "«Бирка»", options: { bold: true, color: THEME.colors.accent1 } },
   { text: "Текст этикетки против регламента", options: { bold: true } },
   { text: "минута", options: { bold: true } }, { text: "490 ₽", options: { bold: true } }],
];
s.addTable(rows, { x: M, y: 1.7, w: W - 2 * M, colW: [3.3, 5.0, 1.5, 2.1],
  fontSize: 13, color: "1C1C20", fontFace: "Calibri",
  border: { type: "solid", color: "D9DDE3", pt: 1 }, align: "left", valign: "middle",
  rowH: 0.42, fill: { color: "FFFFFF" }, objectName: "сравнение с аналогами" });
s.addText("Все существующие сервисы работают с кодами маркировки и печатью. Соответствие текста этикетки регламенту проверяют вручную консультанты.",
  { x: M, y: 5.5, w: W - 2 * M, h: 0.7, isTextBox: true, margin: 0, fontSize: 15, color: C.text2, bold: true });
s.addNotes("Это обязательный слайд: жюри оценивает сравнение с аналогами отдельным критерием. Главная мысль — ниша свободна именно по проверке текста, а не кодов.");

/* ---------- 6. Планы ---------- */
pres.addSection({ title: "Итог" });
s = pres.addSlide({ masterName: "CLOSING", sectionTitle: "Итог" });
s.addText("Что дальше", { x: M, y: 1.0, w: W - 2 * M, h: 1.0, isTextBox: true, margin: 0,
  fontSize: 40, bold: true, color: "FFFFFF", align: "left", valign: "middle", fit: "none" });
const nW = (W - 2 * M - 2 * 0.35) / 3;
const nexts = [
  ["Детские товары", "добавить проверку\nпо ТР ТС 007/2011"],
  ["Проверка по ссылке", "разбор карточки\nмаркетплейса целиком"],
  ["Пилот с типографией", "первые клиенты\nв Казани"],
];
// Каждая карточка — один объект: текст внутри фигуры, иначе PowerPoint сдвигает надписи
nexts.forEach((n, i) => {
  s.addText([
    { text: n[0], options: { fontSize: 16, bold: true, color: "FFFFFF", breakLine: true } },
    { text: n[1], options: { fontSize: 13, color: "C6CDE4" } },
  ], { shape: pres.ShapeType.roundRect, rectRadius: 0.1, fill: { color: "3E4C94" },
    x: M + i * (nW + 0.35), y: 2.4, w: nW, h: 1.7,
    align: "left", valign: "middle", margin: [12, 16, 12, 16],
    objectName: "план " + (i + 1) });
});
s.addText("С марта 2027 года проверка карточек на маркетплейсах становится обязательной — предварительная самопроверка нужна продавцу уже сейчас",
  { x: M, y: 4.4, w: W - 2 * M, h: 0.8, isTextBox: true, margin: 0, fontSize: 15,
    color: "D9DDE3", italic: true, valign: "top" });
s.addText([
  { text: "birka.tatnet.app", options: { fontSize: 22, bold: true, color: THEME.colors.accent4, breakLine: true } },
  { text: "Спасибо. Готов ответить на вопросы", options: { fontSize: 15, color: "AEB6C9", breakLine: true } },
  { text: " ", options: { fontSize: 8, breakLine: true } },
  { text: "Фазуллин Амир · Лицей-интернат имени Мустафы Онджеля", options: { fontSize: 13, color: "8E97B5" } },
], { x: M, y: 5.35, w: 10.0, h: 1.6, isTextBox: true, margin: 0, valign: "top",
  objectName: "подпись" });
s.addNotes("Закончить на планах и поблагодарить. Держать в голове ответы на три вопроса: ответственность за ложное «всё хорошо», точность распознавания, почему продавец заплатит.");

(async () => {
  await pres.writeFile({ fileName: "/home/user/project/deck/Бирка.pptx" });
  await applyTheme("/home/user/project/deck/Бирка.pptx", THEME);
  console.log("готово");
})();
