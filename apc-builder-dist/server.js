// APC Lesson Builder — Local Server
// Single Express server that serves a UI for uploading JSON specs and building PPTX.
// Workflow: validate first → show warnings → require "Build anyway" → produce PPTX.

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { validateLesson } = require("./validators.js");
const { buildLesson } = require("./builder.js");

const PORT = 4173;
const ROOT = __dirname;
const PALETTES_DIR = path.join(ROOT, "palettes");
const OUTPUT_DIR = path.join(ROOT, "output");
const UPLOAD_DIR = path.join(os.tmpdir(), "apc-builder-uploads");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(ROOT, "public")));

// ---- helpers ----
function loadPalette(spec) {
  if (spec.palette && typeof spec.palette === "object") return spec.palette;
  const name = spec.meta && spec.meta.palette;
  if (!name) throw new Error("Spec has no palette: provide inline 'palette' object or 'meta.palette' string");
  const file = path.join(PALETTES_DIR, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`Palette file not found: palettes/${name}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function validateSpec(spec) {
  const P = loadPalette(spec);
  const lesson = { meta: spec.meta, slides: spec.slides };
  return validateLesson(lesson, P);
}

function deriveBaseName(spec, fallback) {
  // Convention: <yearCode>_<palette>_<unitCode>_L<NN>_<Topic_Title_Case>
  // Example: 12_HHD_U4_AOS1_L01_Economic_Characteristics_Of_Income_Groups
  const m = spec.meta || {};
  if (m.yearCode && m.palette && m.unitCode && m.lessonNumber != null && m.topic) {
    const lesson = String(m.lessonNumber).padStart(2, "0");
    const topicSlug = m.topic
      .replace(/-/g, " ")                       // treat hyphens as word separators (High-Income → High Income)
      .replace(/[^A-Za-z0-9 ]+/g, "")           // strip remaining punctuation
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("_");
    return `${m.yearCode}_${m.palette}_${m.unitCode}_L${lesson}_${topicSlug}`;
  }
  // Fallback only used if validator hasn't enforced the fields (e.g. legacy specs)
  const topic = m.topic;
  if (topic) return topic.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return fallback.replace(/\.json$/i, "");
}

// ---- POST /api/validate ----
// Body: { spec: <parsed JSON spec> }
// Returns: { ok: true, warnings: [...] } or { ok: false, error: "..." }
app.post("/api/validate", (req, res) => {
  try {
    const { spec } = req.body;
    if (!spec) return res.json({ ok: false, error: "No spec provided" });
    const result = validateSpec(spec);
    res.json({ ok: true, warnings: result.warnings });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ---- POST /api/build ----
// Body: { spec: <parsed JSON>, baseName?: string }
// Returns: { ok: true, pptxName, portalName? } or { ok: false, error }
app.post("/api/build", async (req, res) => {
  try {
    const { spec, baseName: providedName } = req.body;
    if (!spec) return res.json({ ok: false, error: "No spec provided" });
    // re-validate before building (defense in depth)
    validateSpec(spec);
    const baseName = providedName || deriveBaseName(spec, "lesson");
    const result = await buildLesson(spec, { palettesDir: PALETTES_DIR, outputDir: OUTPUT_DIR, baseName });
    res.json({
      ok: true,
      pptxName: path.basename(result.pptxPath),
      portalName: result.portalPath ? path.basename(result.portalPath) : null,
      slideCount: result.slideCount,
      outputDir: OUTPUT_DIR
    });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ---- POST /api/build-batch ----
// Body: { folder: "<absolute path>" }
// Returns: { ok: true, results: [{file, status, message}] }
app.post("/api/build-batch", async (req, res) => {
  try {
    const { folder } = req.body;
    if (!folder || !fs.existsSync(folder)) return res.json({ ok: false, error: `Folder not found: ${folder}` });
    const files = fs.readdirSync(folder).filter(f => f.endsWith(".json"));
    if (files.length === 0) return res.json({ ok: false, error: "No .json files found in folder" });
    const results = [];
    for (const f of files) {
      const fullPath = path.join(folder, f);
      try {
        const spec = JSON.parse(fs.readFileSync(fullPath, "utf8"));
        const v = validateSpec(spec);
        const baseName = deriveBaseName(spec, f);
        const built = await buildLesson(spec, { palettesDir: PALETTES_DIR, outputDir: OUTPUT_DIR, baseName });
        results.push({
          file: f, status: "ok",
          warnings: v.warnings,
          pptxName: path.basename(built.pptxPath),
          portalName: built.portalPath ? path.basename(built.portalPath) : null
        });
      } catch (e) {
        results.push({ file: f, status: "fail", message: e.message });
      }
    }
    res.json({ ok: true, results, outputDir: OUTPUT_DIR });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ---- GET /api/output/:filename ----
app.get("/api/output/:filename", (req, res) => {
  const file = path.join(OUTPUT_DIR, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).send("Not found");
  res.download(file);
});

// ---- GET /api/output-folder ----
app.get("/api/output-folder", (_req, res) => res.json({ path: OUTPUT_DIR }));

app.listen(PORT, () => {
  console.log(`\n  APC Lesson Builder running at http://localhost:${PORT}`);
  console.log(`  Output folder: ${OUTPUT_DIR}\n`);
});
