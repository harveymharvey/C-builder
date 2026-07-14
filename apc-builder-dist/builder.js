// APC Lesson Builder — renders a validated JSON lesson spec to PPTX
// Reads JSON, applies the schema's locked geometry, typography, and palette,
// emits a .pptx and (if YOU DO slides exist) a -portal.md companion file.
//
// This file is the ONLY place schema geometry should live in code.
// Specs supply data; the builder applies the schema.

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ---- Pill vocabulary ----
const PILL = {
  concept: "KEY CONCEPT", definition: "DEFINITION", principle: "PRINCIPLE",
  process: "PROCESS", "worked-example": "WORKED EXAMPLE"
};
const SCAFFOLD_LABELS = {
  "sentence-starter": "Start with", "key-terms": "Use these terms",
  "structure-hint": "Structure", "worked-fragment": "Worked start", "checklist": "Check you have"
};

// ---- §1.14 pill width ----
function pillWidth(text) { return Math.max(0.90, text.length * 0.11 + 0.30); }

// ---- shared chassis helpers ----
function drawHeaderBar(slide, P, fill, text) {
  slide.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.56, fill: { color: fill }, line: { color: fill } });
  slide.addShape("rect", { x: 0, y: 0, w: 0.06, h: 0.56, fill: { color: P.pipe }, line: { color: P.pipe } });
  slide.addText(text, { x: 0.18, y: 0, w: 13.10, h: 0.56, fontSize: 16, color: P.textInverse, fontFace: "Calibri", valign: "middle" });
}
function drawLeftStripe(slide, P) {
  slide.addShape("rect", { x: 0, y: 0.56, w: 0.06, h: 6.94, fill: { color: P.pipe }, line: { color: P.pipe } });
}
function drawCard(slide, P, x, y, w, h) {
  slide.addShape("rect", { x, y, w, h, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" },
    shadow: { type: "outer", blur: 4, offset: 2, angle: 135, opacity: 0.08, color: "000000" } });
}
function drawPill(slide, P, text, x, y) {
  const w = pillWidth(text);
  slide.addShape("rect", { x, y, w, h: 0.32, fill: { color: P.pipe }, line: { color: P.pipe } });
  slide.addText(text, { x, y, w, h: 0.32, fontSize: 12, bold: true, color: P.textInverse, fontFace: "Calibri", valign: "middle", align: "center" });
}

// ---- slide renderers ----
function titleSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addShape("rect", { x: 0, y: 0, w: 0.40, h: 7.5, fill: { color: P.accent }, line: { color: P.accent } });
  slide.addText(d.topic, { x: 0.80, y: 2.60, w: 11.93, h: 2.20, fontSize: 52, bold: true, color: P.text, fontFace: "Calibri", valign: "middle", align: "left", margin: 0 });
  const meta = d.unit || [d.subject, d.yearLevel, d.unit].filter(Boolean).join(" · ");
  slide.addText(meta, { x: 0.80, y: 5.10, w: 11.93, h: 0.40, fontSize: 18, color: P.text, fontFace: "Calibri", valign: "top", align: "left" });
  if (d.notes) slide.addNotes(d.notes);
}

function doNowSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgDoNow };
  const mode = d.variant === "discussion" ? "in pairs" : "individually and silently";
  drawHeaderBar(slide, P, P.doNow, `| DO NOW — complete on entry, ${mode} (5 min)`);
  drawLeftStripe(slide, P);

  if (d.variant === "questions") {
    const runs = d.items.map(q => ({ text: q, options: { fontSize: 18, paraSpaceAfter: 20, breakLine: true, bullet: { type: "number" } } }));
    slide.addText(runs, { x: 0.20, y: 0.85, w: 12.99, h: 6.30, fontFace: "Calibri", color: P.text, valign: "top" });
  } else if (d.variant === "discussion") {
    slide.addShape("rect", { x: 2.00, y: 1.40, w: 9.33, h: 4.00, fill: { color: "FFFFFF" }, line: { color: P.doNow, width: 2 } });
    slide.addText(d.prompt, { x: 2.20, y: 1.50, w: 8.93, h: 3.80, fontSize: 24, color: P.text, fontFace: "Calibri", valign: "middle", align: "center" });
    slide.addText("Think individually (90s) → share with partner → ready to share with class", { x: 0.20, y: 5.70, w: 12.99, h: 0.60, fontSize: 18, color: P.pipe, fontFace: "Calibri", align: "center", valign: "top" });
  } else if (d.variant === "riddle") {
    slide.addShape("rect", { x: 1.50, y: 1.20, w: 10.33, h: 3.80, fill: { color: "FFFFFF" }, line: { color: P.doNow, width: 2 } });
    slide.addText(d.riddle, { x: 1.70, y: 1.30, w: 9.93, h: 3.60, fontSize: 22, color: P.text, fontFace: "Calibri", valign: "middle", align: "center" });
    slide.addText(d.prompt, { x: 1.50, y: 5.40, w: 10.33, h: 1.20, fontSize: 20, bold: true, italic: true, color: P.pipe, fontFace: "Calibri", align: "center" });
  } else if (d.variant === "recall") {
    slide.addText(d.instruction || "Define each term from memory. No notes.", { x: 0.20, y: 0.85, w: 12.99, h: 0.40, fontSize: 18, color: P.text, fontFace: "Calibri" });
    const N = d.terms.length;
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);
    const cellW = (12.99 - 0.20 - (cols - 1) * 0.15) / cols;
    const cellH = (6.66 - 1.10 - (rows - 1) * 0.20) / rows;
    d.terms.forEach((term, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const x = 0.40 + c * (cellW + 0.15), y = 1.55 + r * (cellH + 0.20);
      slide.addShape("rect", { x, y, w: cellW, h: cellH, fill: { color: P.bgLight }, line: { color: P.doNow, width: 1 } });
      slide.addText(term, { x: x + 0.10, y, w: cellW - 0.20, h: cellH, fontSize: 18, bold: true, color: P.text, fontFace: "Calibri", valign: "middle", align: "center" });
    });
  } else if (d.variant === "would-you-rather") {
    slide.addShape("rect", { x: 0.60, y: 1.40, w: 5.80, h: 4.20, fill: { color: "FFFFFF" }, line: { color: P.doNow, width: 2 } });
    slide.addText("A", { x: 0.80, y: 1.55, w: 1.0, h: 0.70, fontSize: 36, bold: true, color: P.pipe, fontFace: "Calibri" });
    slide.addText(d.optionA, { x: 0.80, y: 2.30, w: 5.40, h: 3.10, fontSize: 20, color: P.text, fontFace: "Calibri", valign: "top" });
    slide.addText("OR", { x: 6.40, y: 3.30, w: 0.53, h: 0.40, fontSize: 20, bold: true, color: P.pipe, fontFace: "Calibri", align: "center" });
    slide.addShape("rect", { x: 6.93, y: 1.40, w: 5.80, h: 4.20, fill: { color: "FFFFFF" }, line: { color: P.doNow, width: 2 } });
    slide.addText("B", { x: 7.13, y: 1.55, w: 1.0, h: 0.70, fontSize: 36, bold: true, color: P.pipe, fontFace: "Calibri" });
    slide.addText(d.optionB, { x: 7.13, y: 2.30, w: 5.40, h: 3.10, fontSize: 20, color: P.text, fontFace: "Calibri", valign: "top" });
    if (d.followUp) slide.addText(d.followUp, { x: 0.20, y: 5.85, w: 12.99, h: 0.60, fontSize: 18, color: P.text, fontFace: "Calibri", align: "center" });
  } else if (d.variant === "predict") {
    slide.addText(d.setup, { x: 0.20, y: 1.10, w: 12.99, h: 2.20, fontSize: 20, color: P.text, fontFace: "Calibri", valign: "middle", align: "center" });
    slide.addShape("rect", { x: 1.50, y: 3.80, w: 10.33, h: 2.80, fill: { color: P.bgLight }, line: { color: P.doNow, width: 2 } });
    slide.addText(d.prompt, { x: 1.60, y: 3.90, w: 10.13, h: 2.60, fontSize: 24, bold: true, color: P.text, fontFace: "Calibri", valign: "middle", align: "center" });
  }
  slide.addNotes(d.notes);
}

function lisSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.iDo, "| LEARNING INTENTIONS & SUCCESS CRITERIA");
  drawLeftStripe(slide, P);

  slide.addShape("rect", { x: 0.20, y: 0.70, w: 6.347, h: 6.30, fill: { color: P.cardKK }, line: { color: P.pipe, width: 1, transparency: 70 } });
  drawPill(slide, P, "KEY KNOWLEDGE", 0.30, 0.80);
  const kkRuns = d.keyKnowledge.map(it => ({ text: it, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }));
  slide.addText(kkRuns, { x: 0.40, y: 1.30, w: 5.95, h: 5.55, fontFace: "Calibri", color: P.text, valign: "top" });

  slide.addShape("rect", { x: 6.847, y: 0.70, w: 6.347, h: 6.30, fill: { color: P.cardKS }, line: { color: P.pipe, width: 1, transparency: 70 } });
  drawPill(slide, P, "KEY SKILLS", 6.947, 0.80);
  const ksRuns = d.keySkills.map(it => ({ text: it, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }));
  slide.addText(ksRuns, { x: 7.047, y: 1.30, w: 5.95, h: 5.55, fontFace: "Calibri", color: P.text, valign: "top" });

  slide.addNotes(d.notes);
}

function iDoSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.iDo, `| I DO — ${d.headerTitle}`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, PILL[d.variant], 0.98, 1.18);

  const numbered = (d.variant === "process" || d.variant === "worked-example");
  const runs = [{ text: d.concept, options: { fontSize: 24, bold: true, paraSpaceAfter: 14, breakLine: true } }];
  d.bullets.forEach(b => {
    if (b.label) {
      runs.push({ text: `${b.label}: `, options: { fontSize: 18, bold: true, color: P.pipe, bullet: numbered ? { type: "number" } : { code: "25A0", color: P.pipe } } });
      runs.push({ text: b.text, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true } });
    } else {
      runs.push({ text: b.text, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true, bullet: numbered ? { type: "number" } : { code: "25A0", color: P.pipe } } });
    }
  });
  slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}

function learningActivitySlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.weDo, `| LEARNING ACTIVITY — ${d.headerTitle} (${d.timeMinutes} min)`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, "TASK", 0.98, 1.18);

  const runs = [{ text: d.task, options: { fontSize: 24, bold: true, paraSpaceAfter: d.stimulusReference ? 14 : 24, breakLine: true } }];
  if (d.stimulusReference) runs.push({ text: `📖 ${d.stimulusReference}`, options: { fontSize: 18, italic: true, color: P.pipe, paraSpaceAfter: 24, breakLine: true } });
  runs.push({ text: "SCAFFOLDING — USE WHAT YOU NEED", options: { fontSize: 18, bold: true, color: P.pipe, paraSpaceAfter: 12, breakLine: true } });
  d.scaffolding.forEach(s => {
    runs.push({ text: `${SCAFFOLD_LABELS[s.type]}: `, options: { fontSize: 18, bold: true, color: P.pipe, bullet: { code: "25A0", color: P.pipe } } });
    runs.push({ text: s.content, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true } });
  });
  slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}

function youDoSlide(pres, P, d, portalEntries) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.youDo, `| YOU DO — ${d.taskName} (${d.timeMinutes} min)`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.20, 11.73, 5.50);
  const runs = [
    { text: "Open the Challenge Continuum task on the portal", options: { fontSize: 28, bold: true, paraSpaceAfter: 18, align: "center", breakLine: true } },
    { text: d.taskName, options: { fontSize: 22, color: P.pipe, paraSpaceAfter: 18, align: "center", breakLine: true } },
    { text: `${d.timeMinutes} minutes`, options: { fontSize: 20, italic: true, align: "center", breakLine: true } }
  ];
  slide.addText(runs, { x: 0.98, y: 1.40, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "middle" });

  const lvls = d.continuumLevels;
  const noteBlock = [
    `Continuum task: ${d.taskName}`, "",
    `ACQUIRING:     ${lvls[0]}`,
    `CONSOLIDATING: ${lvls[1]}`,
    `REFINING:      ${lvls[2]}`,
    `EXTENDING:     ${lvls[3]}`,
    `MASTERING:     ${lvls[4]}`,
    "",
    "Teacher prompts: after 5 min check level selection; half-time prompt early finishers up a level; final 5 min students capture evidence.",
    "", d.notes
  ].join("\n");
  slide.addNotes(noteBlock);

  portalEntries.push({ taskName: d.taskName, timeMinutes: d.timeMinutes, continuumLevels: lvls });
}

function stimulusSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.iDo, `| STIMULUS — ${d.headerTitle}`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, "STIMULUS", 0.98, 1.18);

  if (d.mode === "image-placeholder") {
    slide.addShape("rect", { x: 1.40, y: 1.80, w: 10.53, h: 4.40,
      fill: { color: P.bgLight }, line: { color: P.pipe, width: 2, dashType: "dash" } });
    slide.addText(`📌  ${d.placeholderText}`, { x: 1.60, y: 3.40, w: 10.13, h: 1.20,
      fontSize: 20, italic: true, color: P.pipe, fontFace: "Calibri", align: "center", valign: "middle" });
    if (d.caption) slide.addText(d.caption, { x: 0.98, y: 6.35, w: 11.37, h: 0.45,
      fontSize: 18, color: P.text, fontFace: "Calibri", align: "center" });
  } else {
    const runs = [];
    if (d.caption) runs.push({ text: d.caption, options: { fontSize: 20, bold: true, paraSpaceAfter: 14, breakLine: true } });
    d.dataRows.forEach(r => runs.push({ text: r, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }));
    slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  }
  slide.addNotes(d.notes);
}

function examTipSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.exit, `| EXAM TIP — ${d.headerTitle}`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, "EXAM TIP", 0.98, 1.18);
  const runs = [{ text: d.tip, options: { fontSize: 24, bold: true, paraSpaceAfter: 18, breakLine: true } }];
  if (d.wrong && d.right) {
    runs.push({ text: `✗  ${d.wrong}`, options: { fontSize: 18, color: P.exit, paraSpaceAfter: 8, breakLine: true } });
    runs.push({ text: `✓  ${d.right}`, options: { fontSize: 18, color: P.weDo, paraSpaceAfter: 18, breakLine: true } });
  }
  if (d.why) runs.push({ text: `Why it matters: ${d.why}`, options: { fontSize: 18, italic: true, breakLine: true } });
  slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}

function examPracticeSlides(pres, P, d) {
  const q = pres.addSlide();
  q.background = { color: P.bgLight };
  drawHeaderBar(q, P, P.exit, `| EXAM PRACTICE — ${d.headerTitle} (${d.marks} marks, ${d.attemptMinutes} min)`);
  drawLeftStripe(q, P);
  drawCard(q, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(q, P, "QUESTION", 0.98, 1.18);
  const qRuns = [
    { text: d.question, options: { fontSize: 24, bold: true, paraSpaceAfter: 24, breakLine: true } },
    { text: "HOW TO APPROACH", options: { fontSize: 18, bold: true, color: P.pipe, paraSpaceAfter: 12, breakLine: true } },
    ...d.strategy.map(s => ({ text: s, options: { fontSize: 18, paraSpaceAfter: 8, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }))
  ];
  q.addText(qRuns, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  q.addNotes(d.notes);

  const m = pres.addSlide();
  m.background = { color: P.bgLight };
  drawHeaderBar(m, P, P.exit, `| EXAM PRACTICE — Modelled Answer (${d.marks} marks)`);
  drawLeftStripe(m, P);
  drawCard(m, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(m, P, "MODELLED ANSWER", 0.98, 1.18);
  const mRuns = [
    { text: d.modelAnswer, options: { fontSize: 18, paraSpaceAfter: 18, breakLine: true } },
    { text: "MARKS AWARDED FOR", options: { fontSize: 18, bold: true, color: P.pipe, paraSpaceAfter: 12, breakLine: true } },
    ...d.markPoints.map(p => ({ text: `✓  ${p}`, options: { fontSize: 18, color: P.weDo, paraSpaceAfter: 6, breakLine: true } }))
  ];
  if (d.commonError) mRuns.push({ text: `Common error: ${d.commonError}`, options: { fontSize: 18, italic: true, color: P.exit, breakLine: true } });
  m.addText(mRuns, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  m.addNotes(d.notes);
}

function exitCardSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.exit, `| EXIT CARD (${d.timeMinutes} min)`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, "CHECK", 0.98, 1.18);
  const runs = d.questions.map(q => ({ text: q, options: { fontSize: 24, paraSpaceAfter: 18, breakLine: true, bullet: { type: "number" } } }));
  slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}

function summarySlide(pres, P, d, lisData) {
  const slide = pres.addSlide();
  slide.background = { color: P.accent };
  slide.addShape("rect", { x: 0.80, y: 0.60, w: 11.73, h: 6.30, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" },
    shadow: { type: "outer", blur: 6, offset: 3, angle: 135, opacity: 0.12, color: "000000" } });
  drawPill(slide, P, "YOU SHOULD NOW KNOW", 0.98, 0.84);
  const kk = lisData.keyKnowledge;
  const runs = kk.map(it => ({ text: it, options: { fontSize: 20, paraSpaceAfter: 10, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }));
  slide.addText(runs, { x: 0.98, y: 1.32, w: 11.37, h: 5.40, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}

// ---- portal companion file (§1.16) ----
function buildPortalMarkdown(meta, portalEntries) {
  let md = `# Portal Continuum Tasks — ${meta.topic}\n\n`;
  md += `*${meta.subject}${meta.unit ? " · " + meta.unit : ""}*\n\n`;
  const levelNames = ["Acquiring", "Consolidating", "Refining", "Extending", "Mastering"];
  portalEntries.forEach(e => {
    md += `## ${e.taskName}\n**Time:** ${e.timeMinutes} minutes\n\n`;
    e.continuumLevels.forEach((lvl, i) => {
      const clean = lvl.replace(/^[A-Za-z]+:\s*/, "");
      md += `### ${levelNames[i]}\n${clean}\n\n`;
    });
    md += `---\n\n`;
  });
  return md;
}

// ---- palette resolution ----
function resolvePalette(spec, palettesDir) {
  // Priority: inline spec.palette → load from palettes/<name>.json by spec.meta.palette
  if (spec.palette && typeof spec.palette === "object") return spec.palette;
  const name = spec.meta && spec.meta.palette;
  if (!name) throw new Error(`Spec has no palette: provide either inline 'palette' object or 'meta.palette' string referencing palettes/<name>.json`);
  const paletteFile = path.join(palettesDir, `${name}.json`);
  if (!fs.existsSync(paletteFile)) throw new Error(`Palette file not found: ${paletteFile} (referenced by meta.palette = "${name}")`);
  return JSON.parse(fs.readFileSync(paletteFile, "utf8"));
}

// ---- main build entry ----
async function buildLesson(spec, opts) {
  const { palettesDir, outputDir, baseName } = opts;
  const P = resolvePalette(spec, palettesDir);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = spec.meta && spec.meta.topic ? spec.meta.topic : "APC Lesson";

  const portalEntries = [];
  const lisData = spec.slides.find(s => s.type === "lis");

  for (const s of spec.slides) {
    switch (s.type) {
      case "title":            titleSlide(pres, P, s); break;
      case "doNow":            doNowSlide(pres, P, s); break;
      case "lis":              lisSlide(pres, P, s); break;
      case "iDo":              iDoSlide(pres, P, s); break;
      case "learningActivity": learningActivitySlide(pres, P, s); break;
      case "youDo":            youDoSlide(pres, P, s, portalEntries); break;
      case "stimulus":         stimulusSlide(pres, P, s); break;
      case "examTip":          examTipSlide(pres, P, s); break;
      case "examPractice":     examPracticeSlides(pres, P, s); break;
      case "exitCard":         exitCardSlide(pres, P, s); break;
      case "summary":          summarySlide(pres, P, s, lisData); break;
      default: throw new Error(`Unknown slide type: ${s.type}`);
    }
  }

  const pptxPath = path.join(outputDir, `${baseName}.pptx`);
  await pres.writeFile({ fileName: pptxPath });

  let portalPath = null;
  if (portalEntries.length > 0) {
    portalPath = path.join(outputDir, `${baseName}-portal.md`);
    fs.writeFileSync(portalPath, buildPortalMarkdown(spec.meta || {}, portalEntries));
  }

  return { pptxPath, portalPath, slideCount: spec.slides.length };
}

module.exports = { buildLesson, resolvePalette };
