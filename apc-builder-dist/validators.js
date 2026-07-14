// APC Schema Validators — spec-design enforcement layer
// Runs against a lesson spec BEFORE pptx generation. Throws on any violation.
// This is what makes "correct every time" real: a spec that fails here never builds.
//
// Usage: const { validateLesson } = require('./validators');
//        validateLesson(lesson, P);   // throws Error with actionable message, or returns {warnings:[]}

// ---- field limits (calibrated against 24/18 body sizes) ----
const LIMITS = {
  title:        { topic: 60, unit: 40 },
  doNow: {
    questions:  { item: 130, min: 3, max: 5 },
    discussion: { prompt: 200 },
    riddle:     { riddle: 220, prompt: 80 },
    recall:     { term: 30, min: 4, max: 8, instruction: 100 },
    wouldYouRather: { option: 110, followUp: 140 },
    predict:    { setup: 200, prompt: 130 }
  },
  lis:          { item: 110, minItems: 1, maxItems: 5 },   // hard cap 5 (auto-split dropped)
  iDo:          { headerTitle: 70, concept: 160, bullet: 140, minBullets: 2, maxBullets: 20 },
  learningActivity: { headerTitle: 60, task: 240, scaffold: 140, stimulusRef: 120, minScaffold: 2, maxScaffold: 3, minTime: 5, maxTime: 30 },
  youDo:        { taskName: 60, level: 280, minTime: 10, maxTime: 30 },
  examTip:      { headerTitle: 60, tip: 200, wrongRight: 160, why: 160 },
  examPractice: { headerTitle: 60, question: 280, strategy: 120, model: 700, markPoint: 100, commonError: 160, minStrategy: 2, maxStrategy: 3, minMarkPoints: 2, maxMarkPoints: 6, minTime: 3, maxTime: 15 },
  exitCard:     { question: 160, minQ: 1, maxQ: 3, minTime: 3, maxTime: 8 },
  stimulus:     { headerTitle: 60, caption: 160, dataRow: 120, maxDataRows: 8 }
};

// model answer length guide by marks (soft warning, not hard fail)
const MODEL_LENGTH_GUIDE = { 1:120, 2:200, 3:280, 4:360, 5:450, 6:540, 7:640, 8:720, 9:810, 10:900 };

const CONTINUUM_TERMS = ["Acquiring","Consolidating","Refining","Extending","Mastering"];
const SCAFFOLD_TYPES = ["sentence-starter","key-terms","structure-hint","worked-fragment","checklist"];
const IDO_VARIANTS = ["concept","definition","principle","process","worked-example"];
const DONOW_VARIANTS = ["questions","discussion","riddle","recall","would-you-rather","predict"];

const REQUIRED_PALETTE = ["accent","pipe","bgLight","bgDoNow","doNow","iDo","weDo","youDo","exit","summary","cardKK","cardKS","text","textInverse"];

// ---- helpers ----
function fail(msg) { throw new Error(`SPEC VALIDATION FAILED: ${msg}`); }
function checkLen(val, max, label, warnings) {
  if (typeof val !== "string") fail(`${label} must be a string.`);
  if (val.length > max) fail(`${label} is ${val.length} chars, exceeds ${max}. Shorten it.`);
}
function checkArrayLen(arr, min, max, label) {
  if (!Array.isArray(arr)) fail(`${label} must be an array.`);
  if (arr.length < min) fail(`${label} has ${arr.length} items, needs at least ${min}.`);
  if (arr.length > max) fail(`${label} has ${arr.length} items, maximum is ${max}.`);
}
function checkInt(val, min, max, label) {
  if (!Number.isInteger(val)) fail(`${label} must be an integer.`);
  if (val < min || val > max) fail(`${label} is ${val}, must be between ${min} and ${max}.`);
}
function checkNotes(val, label) {
  if (!val || typeof val !== "string" || val.trim().length === 0) fail(`${label} requires non-empty speaker notes (§1.8).`);
}

// ---- palette validation (§1.10) ----
function validatePalette(P) {
  for (const f of REQUIRED_PALETTE) {
    if (!P[f]) fail(`Palette missing required field: P.${f} (§1.10)`);
    if (!/^[0-9A-Fa-f]{6}$/.test(P[f])) fail(`Palette field P.${f} = "${P[f]}" is not a 6-digit hex colour.`);
  }
}

// ---- per-slide validation ----
function validateSlide(s, idx, warnings) {
  const at = `slide ${idx+1} (${s.type})`;
  switch (s.type) {

    case "title":
      checkLen(s.topic, LIMITS.title.topic, `${at} topic`, warnings);
      checkLen(s.unit, LIMITS.title.unit + 40, `${at} unit`, warnings); // unit allows fuller string
      break;

    case "doNow": {
      if (!DONOW_VARIANTS.includes(s.variant)) fail(`${at} variant "${s.variant}" invalid. One of: ${DONOW_VARIANTS.join(", ")}`);
      const L = LIMITS.doNow;
      if (s.variant === "questions") { checkArrayLen(s.items, L.questions.min, L.questions.max, `${at} items`); s.items.forEach((q,i)=>checkLen(q, L.questions.item, `${at} item ${i+1}`, warnings)); }
      else if (s.variant === "discussion") checkLen(s.prompt, L.discussion.prompt, `${at} prompt`, warnings);
      else if (s.variant === "riddle") { checkLen(s.riddle, L.riddle.riddle, `${at} riddle`, warnings); checkLen(s.prompt, L.riddle.prompt, `${at} prompt`, warnings); }
      else if (s.variant === "recall") { checkArrayLen(s.terms, L.recall.min, L.recall.max, `${at} terms`); s.terms.forEach((t,i)=>checkLen(t, L.recall.term, `${at} term ${i+1}`, warnings)); }
      else if (s.variant === "would-you-rather") { checkLen(s.optionA, L.wouldYouRather.option, `${at} optionA`, warnings); checkLen(s.optionB, L.wouldYouRather.option, `${at} optionB`, warnings); if(s.followUp) checkLen(s.followUp, L.wouldYouRather.followUp, `${at} followUp`, warnings); }
      else if (s.variant === "predict") { checkLen(s.setup, L.predict.setup, `${at} setup`, warnings); checkLen(s.prompt, L.predict.prompt, `${at} prompt`, warnings); }
      checkNotes(s.notes, at);
      break;
    }

    case "lis":
      checkArrayLen(s.keyKnowledge, LIMITS.lis.minItems, LIMITS.lis.maxItems, `${at} keyKnowledge`);
      checkArrayLen(s.keySkills, LIMITS.lis.minItems, LIMITS.lis.maxItems, `${at} keySkills`);
      s.keyKnowledge.forEach((it,i)=>checkLen(it, LIMITS.lis.item, `${at} KK item ${i+1}`, warnings));
      s.keySkills.forEach((it,i)=>checkLen(it, LIMITS.lis.item, `${at} KS item ${i+1}`, warnings));
      checkNotes(s.notes, at);
      break;

    case "iDo": {
      if (!IDO_VARIANTS.includes(s.variant)) fail(`${at} variant "${s.variant}" invalid. One of: ${IDO_VARIANTS.join(", ")}`);
      checkLen(s.headerTitle, LIMITS.iDo.headerTitle, `${at} headerTitle`, warnings);
      checkLen(s.concept, LIMITS.iDo.concept, `${at} concept`, warnings);
      checkArrayLen(s.bullets, LIMITS.iDo.minBullets, LIMITS.iDo.maxBullets, `${at} bullets`);
      s.bullets.forEach((b,i)=>{
        const combined = (b.label ? b.label.length + 2 : 0) + b.text.length;
        if (combined > LIMITS.iDo.bullet) fail(`${at} bullet ${i+1} is ${combined} chars (label+text), exceeds ${LIMITS.iDo.bullet}.`);
        if (b.label && b.label.length > 25) fail(`${at} bullet ${i+1} label exceeds 25 chars.`);
      });
      if (!Array.isArray(s.teaches) || s.teaches.length === 0 || !s.teaches.every(n=>Number.isInteger(n) && n>0)) fail(`${at} must declare 'teaches' as a non-empty array of positive KK indices (§1.12).`);
      checkNotes(s.notes, at);
      break;
    }

    case "learningActivity": {
      const L = LIMITS.learningActivity;
      checkLen(s.headerTitle, L.headerTitle, `${at} headerTitle`, warnings);
      checkInt(s.timeMinutes, L.minTime, L.maxTime, `${at} timeMinutes`);
      checkLen(s.task, L.task, `${at} task`, warnings);
      checkArrayLen(s.scaffolding, L.minScaffold, L.maxScaffold, `${at} scaffolding`);
      const seenTypes = new Set();
      s.scaffolding.forEach((sc,i)=>{
        if (!SCAFFOLD_TYPES.includes(sc.type)) fail(`${at} scaffold ${i+1} type "${sc.type}" invalid.`);
        if (seenTypes.has(sc.type)) fail(`${at} has duplicate scaffold type "${sc.type}" — use varied scaffold types.`);
        seenTypes.add(sc.type);
        checkLen(sc.content, L.scaffold, `${at} scaffold ${i+1} content`, warnings);
      });
      if (s.stimulusReference) checkLen(s.stimulusReference, L.stimulusRef, `${at} stimulusReference`, warnings);
      checkNotes(s.notes, at);
      break;
    }

    case "youDo": {
      const L = LIMITS.youDo;
      checkLen(s.taskName, L.taskName, `${at} taskName`, warnings);
      checkInt(s.timeMinutes, L.minTime, L.maxTime, `${at} timeMinutes`);
      if (!Array.isArray(s.continuumLevels) || s.continuumLevels.length !== 5) fail(`${at} requires exactly 5 continuumLevels (${CONTINUUM_TERMS.join(", ")}). Got ${s.continuumLevels?.length ?? 0}.`);
      s.continuumLevels.forEach((lvl,i)=>checkLen(lvl, L.level, `${at} continuum level ${i+1}`, warnings));
      checkNotes(s.notes, at);
      break;
    }

    case "examTip": {
      const L = LIMITS.examTip;
      checkLen(s.headerTitle, L.headerTitle, `${at} headerTitle`, warnings);
      checkLen(s.tip, L.tip, `${at} tip`, warnings);
      if ((s.wrong && !s.right) || (s.right && !s.wrong)) fail(`${at}: 'wrong' and 'right' must be provided together — never an error without its fix.`);
      if (s.wrong) checkLen(s.wrong, L.wrongRight, `${at} wrong`, warnings);
      if (s.right) checkLen(s.right, L.wrongRight, `${at} right`, warnings);
      if (s.why) checkLen(s.why, L.why, `${at} why`, warnings);
      checkNotes(s.notes, at);
      break;
    }

    case "examPractice": {
      const L = LIMITS.examPractice;
      checkLen(s.headerTitle, L.headerTitle, `${at} headerTitle`, warnings);
      if (!Number.isInteger(s.marks) || s.marks < 1) fail(`${at} marks must be a positive integer.`);
      checkInt(s.attemptMinutes, L.minTime, L.maxTime, `${at} attemptMinutes`);
      checkLen(s.question, L.question, `${at} question`, warnings);
      checkArrayLen(s.strategy, L.minStrategy, L.maxStrategy, `${at} strategy`);
      s.strategy.forEach((st,i)=>checkLen(st, L.strategy, `${at} strategy ${i+1}`, warnings));
      checkLen(s.modelAnswer, L.model, `${at} modelAnswer`, warnings);
      checkArrayLen(s.markPoints, L.minMarkPoints, L.maxMarkPoints, `${at} markPoints`);
      s.markPoints.forEach((mp,i)=>checkLen(mp, L.markPoint, `${at} markPoint ${i+1}`, warnings));
      if (s.commonError) checkLen(s.commonError, L.commonError, `${at} commonError`, warnings);
      // soft warning: model answer length vs marks guide
      const guide = MODEL_LENGTH_GUIDE[s.marks] || 700;
      if (s.modelAnswer.length > guide) warnings.push(`${at}: modelAnswer is ${s.modelAnswer.length} chars for ${s.marks} marks (guide ~${guide}). Check it's at realistic student standard, not over-polished.`);
      checkNotes(s.notes, at);
      break;
    }

    case "exitCard": {
      const L = LIMITS.exitCard;
      checkInt(s.timeMinutes, L.minTime, L.maxTime, `${at} timeMinutes`);
      checkArrayLen(s.questions, L.minQ, L.maxQ, `${at} questions`);
      s.questions.forEach((q,i)=>checkLen(q, L.question, `${at} question ${i+1}`, warnings));
      checkNotes(s.notes, at);
      break;
    }

    case "stimulus": {
      const L = LIMITS.stimulus;
      checkLen(s.headerTitle, L.headerTitle, `${at} headerTitle`, warnings);
      if (!["image-placeholder","data"].includes(s.mode)) fail(`${at} mode must be "image-placeholder" or "data".`);
      if (s.caption) checkLen(s.caption, L.caption, `${at} caption`, warnings);
      if (s.mode === "image-placeholder") {
        if (!s.placeholderText) fail(`${at} image-placeholder mode requires placeholderText (e.g. "Insert Figure 8.6 from textbook").`);
        checkLen(s.placeholderText, L.caption, `${at} placeholderText`, warnings);
      } else { // data
        if (!Array.isArray(s.dataRows) || s.dataRows.length === 0) fail(`${at} data mode requires dataRows array.`);
        if (s.dataRows.length > L.maxDataRows) fail(`${at} has ${s.dataRows.length} data rows, max ${L.maxDataRows}.`);
        s.dataRows.forEach((r,i)=>checkLen(r, L.dataRow, `${at} dataRow ${i+1}`, warnings));
      }
      checkNotes(s.notes, at);
      break;
    }

    case "summary":
      checkNotes(s.notes, at);
      // content auto-pulls from LIS; no own fields to validate beyond notes
      break;

    default:
      fail(`${at}: unknown slide type "${s.type}".`);
  }
}

// ---- deck-level validation ----
function validateDeck(lesson, warnings) {
  const slides = lesson.slides;
  const types = slides.map(s => s.type);

  // meta fields required for filename derivation
  const meta = lesson.meta || {};
  if (!meta.yearCode || typeof meta.yearCode !== "string") fail(`meta.yearCode missing or not a string (e.g. "12"). Required for filename convention <year>_<subject>_<unit>_L<NN>_<topic>.`);
  if (!meta.palette || typeof meta.palette !== "string") fail(`meta.palette missing or not a string (e.g. "HHD"). Required for both palette resolution and filename.`);
  if (!meta.unitCode || typeof meta.unitCode !== "string") fail(`meta.unitCode missing or not a string (e.g. "U4_AOS1"). Required for filename convention.`);
  if (!Number.isInteger(meta.lessonNumber) || meta.lessonNumber < 0) fail(`meta.lessonNumber missing or not a non-negative integer (e.g. 1). Required for filename convention — represents lesson position within the AOS.`);
  if (!meta.topic || typeof meta.topic !== "string") fail(`meta.topic missing or not a string. Required for filename and title slide.`);

  // must have a title
  if (!types.includes("title")) fail("Deck has no Title slide.");
  // must have exactly one LIS (Summary depends on it)
  const lisCount = types.filter(t => t === "lis").length;
  if (lisCount === 0) fail("Deck has no Learning Intentions (LIS) slide — required for lesson goals and Summary auto-pull.");
  if (lisCount > 1) fail("Deck has multiple LIS slides — only one allowed per lesson.");
  // must have at least one I DO
  if (!types.includes("iDo")) fail("Deck has no I DO slide — a lesson must teach something.");

  // Summary must come after LIS if present
  if (types.includes("summary")) {
    if (types.lastIndexOf("lis") > types.indexOf("summary")) fail("Summary slide appears before the LIS slide — Summary auto-pulls KK from LIS and must come after it.");
  }

  // lesson coherence (§1.12): every KK taught by some I DO
  const lis = slides.find(s => s.type === "lis");
  const kkCount = lis.keyKnowledge.length;
  const taught = new Set();
  slides.filter(s => s.type === "iDo").forEach(s => (s.teaches||[]).forEach(n => taught.add(n)));
  for (let k = 1; k <= kkCount; k++) {
    if (!taught.has(k)) fail(`Lesson coherence (§1.12): KK item ${k} ("${lis.keyKnowledge[k-1].slice(0,50)}...") is on the LIS slide but no I DO slide teaches it. Add an I DO with teaches:[${k}], or remove the KK.`);
  }
  // I DO claiming a non-existent KK index
  slides.filter(s => s.type === "iDo").forEach((s,i) => {
    (s.teaches||[]).forEach(n => { if (n > kkCount) fail(`I DO slide teaches KK${n} but the LIS only has ${kkCount} KK items.`); });
  });

  // pedagogical rule: every I DO should eventually have a practice opportunity (warning, not fail)
  const hasPractice = types.includes("learningActivity") || types.includes("examPractice");
  if (types.includes("iDo") && !hasPractice) warnings.push("Deck has I DO slides but no LEARNING ACTIVITY or EXAM PRACTICE — students never practise what's taught. Consider adding a practice task.");

  // band check: senior-only slide types
  const seniorTypes = ["examTip","examPractice"];
  const usedSenior = types.filter(t => seniorTypes.includes(t));
  if (lesson.meta && lesson.meta.band === "junior" && usedSenior.length > 0) {
    warnings.push(`Junior lesson includes senior-only slide types: ${usedSenior.join(", ")}. These assume exam-oriented teaching.`);
  }
}

// ---- main entry ----
function validateLesson(lesson, P) {
  const warnings = [];
  validatePalette(P);
  if (!lesson.slides || !Array.isArray(lesson.slides) || lesson.slides.length === 0) fail("Lesson has no slides.");
  lesson.slides.forEach((s, i) => validateSlide(s, i, warnings));
  validateDeck(lesson, warnings);
  return { ok: true, warnings };
}

module.exports = { validateLesson, LIMITS, CONTINUUM_TERMS };
