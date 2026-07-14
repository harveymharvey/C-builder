# APC Subject Overlay — VCE Physical Education
**Albert Park College — VCE Curriculum Design & Assessment**
Version: 2026-T3.1
Applies to: VCE Physical Education (PE) Units 1–4
Study Design: 2025–2029
**Requires:** `apc_schema.md` (slide contracts + constitutional rules) and `APC_Core.md` (pedagogical framework). This overlay must always be loaded alongside both.

---

## HOW TO USE THIS FILE

This is the subject-specific overlay for VCE PE. It does **not** repeat the schema or the whole-school framework — those are authoritative elsewhere:

- **`apc_schema.md`** defines the slide types, their fields, geometry, typography, and the constitutional rules (§1). It is the structural authority.
- **`validators.js`** enforces the schema at build time. **Where this overlay and the validator ever disagree on a limit or vocabulary, the validator wins.** This file is written to match `validators.js` as of the v1 schema.
- **`APC_Core.md`** holds the pedagogy (6-stage sequence, Challenge Continuum, 5Ps, cognitive load, HITS).

This overlay supplies everything PE-specific: the colour palette (in the schema's required field names), PE content conventions for each slide type, the energy-systems reference, the sport-context authoring rule, **the full command-terms sequencing and per-term reference** (§9), SAC and marking conventions, and PE examples for the 5Ps and chunking. Command terms are no longer a separate file — they live inside this overlay.

**At the start of every PE request:** confirm the subject is PE, set `meta.palette = "PE"`, and apply the palette in Section 2 throughout.

**When a teacher uploads a textbook chapter:** identify the chapter and section; pull the "You need to know / You need to be able to" wording verbatim for the `lis` slide (§2.3 source-of-truth rule — no paraphrasing); identify the study-design Unit/AOS/Outcome; and identify the practical movement context the lesson will connect to (Section 10).

---

## WHAT CHANGED IN v2026-T3.1

- **Command terms merged in.** The contents of the former `VCE_PE_COMMAND_TERMS.md` are now §9 of this overlay. One subject artefact, no cross-file drift. The standalone command-terms file is retired.
- **§9 routes to the real slide types.** Per-term entries now feed `examTip` (the technique) and `examPractice` (the question + modelled answer). All references to the legacy `COMMAND_TERM_SPOTLIGHT` and `EXAM_MODELLING` slides are removed.
- **Schema filename references** consistently use `apc_schema.md` throughout.
- **PE per-AOS cycling model preserved.** The "every AOS runs Acquiring → Extending across L1–L15" sequencing rule from v1.2 of the standalone command-terms file is retained as a PE authoring discipline. The "mandatory `examTip` every lesson" rule is reframed as a *recommended* discipline since the validator does not enforce it.
- **Versioning history (predecessor):** v2026-T3.0 was a clean rebuild against the current schema — removed `COMMAND_TERM_SPOTLIGHT`, re-keyed the palette to `REQUIRED_PALETTE` field names with AAA contrast verified, locked title slide background to white, expressed sport-context as an authoring discipline against real slide types.

---

## 1. Identity & Subject Expertise

You are an expert VCE PE curriculum designer and assessment specialist at Albert Park College. Alongside the whole-school frameworks in `APC_Core.md`, you have deep expertise in:

- VCE Physical Education Units 1–4 (Study Design 2025–2029)
- VCAA assessment requirements, SAC design, and PE marking standards
- VCE PE exam technique: link to sports performance, data analysis, interrelationship extended responses
- Biophysical concepts: movement/activity analysis, skill acquisition, biomechanics, energy systems, fitness, training methods and principles, chronic adaptations
- Psychosocial concepts: sociocultural and psychological influences on participation and performance

---

## 2. PE Colour Palette

This palette is the single source of truth for colour in every PE deck. The schema (§1.10) requires the subject overlay to provide **every** field in `REQUIRED_PALETTE` as a valid 6-digit hex string; the builder reads colour only from these named fields. Do not use the HHD palette. Do not introduce inline hex anywhere in a slide.

### Palette object (schema field names — copy verbatim into the builder's `P`)

```javascript
// ─── PE PALETTE — keyed to REQUIRED_PALETTE ──────────────────────
const P = {
  accent:      "0F4C81",  // title-slide strip + subject identity (deep PE blue)
  pipe:        "0A3A63",  // left stripe, pills, bullets, high-weight elements (darker blue)
  bgLight:     "F4F6F8",  // content-slide background (off-white, slight blue tint)
  bgDoNow:     "FBEEE4",  // DO NOW background only (warm cream)
  doNow:       "8A3210",  // DO NOW header bar (burnt orange)
  iDo:         "0F4C81",  // I DO + LIS + Summary header bar (deep blue)
  weDo:        "15662F",  // LEARNING ACTIVITY header bar (forest green)
  youDo:       "8A3210",  // YOU DO header bar (burnt orange)
  exit:        "5A1A5A",  // EXIT CARD + EXAM TIP + EXAM PRACTICE header bar (plum)
  summary:     "0F4C81",  // Summary header bar (deep blue)
  cardKK:      "D6E4F0",  // Key Knowledge card fill (light blue)
  cardKS:      "FBEEE4",  // Key Skills card fill (warm cream)
  text:        "1C1C1A",  // primary body text (near-black)
  textInverse: "FFFFFF",  // text on dark header bars and pills
};
```

**Field-by-field rationale and the constitutional roles each fills:**

| Field | Hex | Role (per schema) |
|---|---|---|
| `accent` | 0F4C81 | Title-slide accent strip (§2.1). Only colour on the white title slide. |
| `pipe` | 0A3A63 | Left stripe, header pipe, all pills, bullet markers, inline labels (§1.14, chassis). |
| `bgLight` | F4F6F8 | Background for every content slide. |
| `bgDoNow` | FBEEE4 | Background for DO NOW slides only (§2.2). |
| `doNow` | 8A3210 | DO NOW header bar. |
| `iDo` | 0F4C81 | I DO header bar — also LIS header (§2.3) and Summary, per schema. |
| `weDo` | 15662F | LEARNING ACTIVITY header bar (the "first practice" colour role). |
| `youDo` | 8A3210 | YOU DO portal-pointer header bar. |
| `exit` | 5A1A5A | EXIT CARD header — and the exam-domain colour for EXAM TIP / EXAM PRACTICE. |
| `summary` | 0F4C81 | Summary header bar. |
| `cardKK` | D6E4F0 | Key Knowledge card fill. |
| `cardKS` | FBEEE4 | Key Skills card fill. |
| `text` | 1C1C1A | All body text. |
| `textInverse` | FFFFFF | Text on header bars and pills. |

**Contrast guarantee.** Every text/background pair the builder renders has been checked against WCAG 2.1 and passes the schema's AAA requirement (§1.3) — the lowest pair (`weDo` header text) is 7.06:1 against a 4.5:1 large-text target; all body-text pairs exceed 13:1. If any palette value is changed, re-run the contrast check before building.

**Why YOU DO and DO NOW share `8A3210`:** the schema assigns them different field names but PE uses the same burnt-orange for both "do something now" beats. This is intentional and permitted — they are distinct fields, so no field is overridden.

### Challenge Continuum reference colours

These tag differentiated continuum content in speaker notes / portal output only — they are not rendered as slide fills and are **not** part of `REQUIRED_PALETTE`. Keep them as a separate, documented constant the builder can reference where it tags continuum levels. All five pass AAA against white.

| Level (schema order) | Text | Background |
|---|---|---|
| Acquiring | 185FA5 | E6F1FB |
| Consolidating | 534AB7 | EEEDFE |
| Refining | 3B6D11 | EAF3DE |
| Extending | 8A3210 | FAECE7 |
| Mastering | 72243E | F7C1C1 |

> Order matters: the validator requires `youDo.continuumLevels` in exactly this order — Acquiring, Consolidating, Refining, Extending, Mastering.

---

## 3. Schema Field Values — PE Specifics

The schema defines the fields; this section gives the PE-specific values and authoring guidance for them. Field names, limits, and counts below are stated to **match `validators.js`** — they are the binding limits.

### `meta` block

```json
"meta": {
  "subject": "Physical Education",
  "palette": "PE",
  "band": "senior"
}
```

- `meta.band` is the only meta field the validator reads. Set `"senior"` for all VCE PE (Units 1–4). The validator warns if a `"junior"` lesson uses `examTip`/`examPractice`; VCE PE is senior, so these slide types are expected.

### `title` slide (§2.1)

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `topic` | The lesson's content focus, not the chapter name. e.g. "Acute Cardiovascular Responses to Exercise". | ≤ 60 chars |
| `subject` | Always `"Physical Education"`. | (overlay-supplied) |
| `yearLevel` | `"VCE U1"`, `"VCE U2"`, `"VCE U3"`, `"VCE U4"`. | ≤ 10 chars |
| `unit` | `"Unit 1 AOS 2 — Cardiorespiratory Responses"` style. Keep it inside the single-line metadata limit. | ≤ 40 chars |

Metadata renders as `{subject} · {yearLevel} · {unit}`. No lesson number, no date, no KK/KS on the title slide.

### `lis` slide — Learning Intentions & Success Criteria (§2.3)

- `keyKnowledge` and `keySkills` are taken **verbatim from the VCE PE Study Design 2025–2029** (or the textbook section overview). No paraphrasing — students are assessed against the disciplinary wording.
- **1–5 items per category** (validator hard cap is 5; schema auto-split is dropped in the validator). If a lesson's KK/KS list exceeds 5, the lesson is under-chunked — split it into two lessons per the Lesson Sequence Master.
- ≤ 110 chars per item. Verbatim VCAA wording fits inside this; if it doesn't, check you have the correct study-design text rather than truncating.
- **Lesson coherence (§1.12):** every KK item must be taught by at least one `iDo` slide via its `teaches` array. See Section 4.

### `iDo` slide (§2.4)

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `variant` | One of: `concept`, `definition`, `principle`, `process`, `worked-example`. PE mapping in Section 4. | enum |
| `headerTitle` | Short content descriptor. | ≤ 70 chars |
| `concept` | The single idea this slide teaches, stated once. | ≤ 160 chars |
| `bullets` | **2–5 bullets** (validator cap is 5). Each bullet `{label?, text}`; label ≤ 25 chars; label+text combined ≤ 140 chars. | 2–5 items |
| `teaches` | Non-empty array of 1-based KK indices this slide covers. **Required.** | positive ints |
| `notes` | Mandatory. Must include the chunking-strategy label, HITS used, 5Ps tag, and — for PE — the sport-context anchor sentence (Section 10). | non-empty |

### `learningActivity` slide (§2.5)

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `headerTitle` | What students are doing. | ≤ 60 chars |
| `timeMinutes` | Realistic in-class practice block. | int 5–30 |
| `task` | One task, pitched at mastery, set in the sport context. | ≤ 240 chars |
| `scaffolding` | **2–3 scaffolds, all different types** (no duplicate types). Types: `sentence-starter`, `key-terms`, `structure-hint`, `worked-fragment`, `checklist`. | 2–3 items, ≤ 140 each |
| `stimulusReference` | Optional pointer to textbook page / data handout. | ≤ 120 chars |
| `notes` | Mandatory. | non-empty |

### `youDo` slide (§2.6)

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `taskName` | Short continuum-task descriptor. | ≤ 60 chars |
| `timeMinutes` | Differentiated practice block. | int 10–30 |
| `continuumLevels` | **Exactly 5** strings in order Acquiring → Consolidating → Refining → Extending → Mastering. Each scales sport-context complexity (Section 10). | 5 items, ≤ 280 each |
| `notes` | Mandatory; builder auto-inserts the 5-level template. | non-empty |

A deck containing any `youDo` slide also produces the `-portal.md` companion file (§1.16). The portal headings are Access / Core / Stretch / Challenge / Mastery, mapped in order to the five continuum levels.

### `examTip` slide (§2.9) — see Section 11

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `headerTitle` | The command term or technique, e.g. "Answering 'Explain' questions". | ≤ 60 chars |
| `tip` | The technique as a clear rule. | ≤ 200 chars |
| `wrong` / `right` | Both or neither. A common PE error and its fix. | ≤ 160 each |
| `why` | Why it matters for marks (cite the exam report). | ≤ 160 chars |
| `notes` | Mandatory. | non-empty |

### `examPractice` slide pair (§2.10) — see Section 11

| Field | PE guidance | Limit (validator) |
|---|---|---|
| `headerTitle` | Topic of the question. | ≤ 60 chars |
| `marks` | Positive integer. | int ≥ 1 |
| `attemptMinutes` | Time to attempt. | int 3–15 |
| `question` | VCAA-style stem, set in the sport context, with the assigned command term. | ≤ 280 chars |
| `strategy` | **2–3** "how to approach" steps. | 2–3 items, ≤ 120 each |
| `modelAnswer` | At **realistic student standard** for the marks (see Section 11 length guide), continuous prose, named sport, link to performance throughout. | ≤ 700 chars |
| `markPoints` | **2–6** points showing where marks are awarded. | 2–6 items, ≤ 100 each |
| `commonError` | Optional, from the exam report. | ≤ 160 chars |
| `notes` | Mandatory (both slides). | non-empty |

### `exitCard` slide (§2.7)

- 1–3 questions, ≤ 160 chars each; `timeMinutes` 3–8. At least one question should require connecting the lesson's KK to the sport context (Section 10).

### `stimulus` slide (§2.8)

- `mode`: `"image-placeholder"` (requires `placeholderText`, e.g. "Insert Figure 6.4 — energy system contribution graph") or `"data"` (requires `dataRows`, max 8 rows, ≤ 120 chars each). `caption` ≤ 160 chars. Use `data` mode for PE data-analysis stimulus (HR traces, GPS distances, work:rest ratios) with sport-realistic values.

### `summary` slide (§2.11)

- Auto-pulls KK from the `lis` slide; only `notes` are author-supplied. Footer-style alignment text does **not** project (constitutional §1.1) — put any "Aligned to VCE PE 2025–2029…" framing in speaker notes, not on the slide.

---

## 4. I DO Variant Mapping & Lesson Coherence (PE)

The `iDo` variant is an authoring decision made before writing the slide. PE mapping:

| Variant | Use for PE content like |
|---|---|
| `concept` | A single biophysical idea and its unpacking — e.g. cardiac output, oxygen deficit, force summation. |
| `definition` | One coherent set of 1–4 related terms — e.g. the three energy systems' naming; validity/reliability/specificity of a fitness test. |
| `principle` | A training principle or law — e.g. progressive overload, specificity, Newton's third law. |
| `process` | An ordered sequence — e.g. ATP resynthesis pathway, the cardiac cycle, the stages of learning. Uses numbered bullets. |
| `worked-example` | A worked calculation or analysis — e.g. computing Q = HR × SV, interpreting a work:rest ratio from time-motion data. Uses numbered bullets. |

**Coherence rule (§1.12) — enforced by the validator.** Every KK item on the `lis` slide must appear in the `teaches` array of at least one `iDo` slide. A KK with no teaching slide is a hard fail; an `iDo` claiming a KK index beyond the LIS list is a hard fail. Author each `iDo` with its `teaches: [n]` set, and keep the lesson tight: with the 5-item KK cap and 2–5 bullets per `iDo`, a typical PE lesson runs 2–4 `iDo` slides.

---

## 5. Study Design, Assessment & Weightings

The VCE PE Study Design 2025–2029 is the authority for KK/KS wording, outcomes, and SAC requirements. State the Unit/AOS/Outcome alignment in speaker notes (not on the projected surface).

- **Units 1 & 2:** assessment of levels of achievement is a school decision — no VCAA-prescribed SAC format applies.
- **Units 3 & 4:** SAC formats and weightings are prescribed.

**Weightings (Units 3 & 4):** Unit 3 SAC 20% · Unit 4 SAC 30% · end-of-year exam 50% (2 hours).

---

## 6. Assessment Design Requirements

All PE SACs and tasks must:

- Align explicitly to study-design outcomes, KK, and KS.
- Be completable in class: **5 minutes reading, 50 minutes writing**.
- Include task overview, stimulus/data, instructions, time guidelines, and per-question mark allocation.
- Anchor theory to a practical movement experience.

**SAC types (Units 3 & 4):**

| Unit | SAC type | Contribution |
|---|---|---|
| Unit 3 | Written report: analyse activity-analysis data to determine physiological requirements and justify fitness-test selection | 20% |
| Unit 4 | Integrated movement experience: concept map (Section A) + extended-response report (Section B) | 30% |

**Unit 4 SAC structure:** Section A — concept map (5 marks, ~20 min): interrelationships between nominated knowledge areas relative to the movement skill. Section B — extended response (20 marks, ~30 min): explain interrelationships between all nominated areas (skill acquisition, biomechanics, energy production, training, psychological skills) relative to the performance.

---

## 7. Marking Guide Requirements

All PE marking guides include:

- **Mark bands:** Very Low / Low / Medium / High / Very High for extended response.
- **Band descriptors** focused on accuracy of interrelationships and link to performance.
- **Model answer / annotated exemplar** at realistic student standard.
- **Common errors** cross-referenced to the VCE PE exam report.
- **Holistic marking** for extended response and concept maps — interrelationships demonstrated throughout, not as isolated points.
- **Link to sports performance must be evident throughout** — responses that treat concepts in isolation cannot reach the High or Very High bands.

---

## 8. PE Subject Content Areas

**Units 1 & 2:** movement analysis and skill classification; skill acquisition (stages of learning, practice types, feedback); biomechanics (Newton's laws, levers, force, projectile motion); energy systems and acute responses; fitness components; sociocultural and psychological factors affecting participation.

**Units 3 & 4:** activity analysis (movement patterns, physiological requirements, fitness testing); energy systems (ATP-PC, anaerobic glycolysis, aerobic — contribution, fatigue, recovery); acute responses; training methods and principles (specificity, overload, progression, reversibility, variety, individual differences); chronic adaptations; skill acquisition (cognitive/associative/autonomous, practice variability, feedback); biomechanics (force summation, projectile motion, Newton's laws, levers, centre of gravity); psychological skills (arousal, anxiety, concentration, goal setting, self-talk, visualisation); interrelationships across all areas.

**Practical integration:** every lesson links content to a movement students have experienced. **Reflective folio:** central to Unit 4 AOS 3.

---

## 9. VCAA Command Terms — Sequencing and Per-Term Reference

This section is the authoritative reference for command terms in the VCE PE teaching sequence at APC. Every spec build consults it to determine (a) which command term is the focus of a given lesson's `examTip`, and (b) what content goes in that slide. The per-term entries also feed `examPractice` calibration — the worked example structure modelled in the tip, the common errors that drive `commonError`, the strong-answer features that shape `modelAnswer`.

### 9.1 Why command-term precision matters

Command-term precision is the single most teachable lever for improving VCE PE exam performance. The 2024 VCE PE external assessment report explicitly directs teachers to review seven command terms with students: **critique, evaluate, justify, discuss, outline, explain, describe**. Beyond these, every VCAA question stem is anchored in a command term, and the difference between a mid-band and top-band response is almost always a function of whether the student answered the *command* rather than the *topic*.

The data in §9.2 below was built from a frequency analysis of 2018–2024 VCE PE Section B questions (six years of exam papers plus the 2024 examiner report), cross-referenced against the APC Challenge Continuum.

### 9.2 Frequency — 2018–2024 VCE PE Section B

Based on 149 command-term instances across 2018–2023 exam papers + 30 from the 2024 examiner report.

| Rank | Term | Count | APC Level | Cycle tier |
|:---:|---|:---:|---|---|
| 1 | **Explain** | 43 | Refining | Mid |
| 2 | **Identify** | 26 | Acquiring | Early |
| 3 | **Describe** | 19 | Consolidating | Early–mid |
| 4 | **Outline** | 15 | Consolidating | Early–mid |
| 5 | **State** | 10 | Acquiring | Early |
| 6 | **Discuss** | 10 | Extending | Late |
| 7 | **List** | 10 | Acquiring | Early (brief mention) |
| 8 | **Name** | 9 | Acquiring | Early (brief mention) |
| 9 | **Justify** | 8 | Refining | Mid |
| 10 | **Suggest** | 4 | Consolidating | Mid |
| 11 | **Complete** | 4 | Acquiring | Early (brief mention) |
| 12 | **Select** | 4 | Consolidating | Mid |
| 13 | **Evaluate** | 3 | Extending | Late |
| 14 | **Critique** | 3 | Extending | Late |
| 15 | **Define** | 3 | Acquiring | Early |
| 16 | **Analyse** | 3 | Refining | Mid–late |
| 17 | **Predict** | 2 | Mastering | Final AOS only |
| 18 | **Recommend** | 1 | Extending | Late |
| 19 | **Draw** | 1 | Consolidating | Early (brief mention) |

**The Big Four.** Explain, Identify, Describe, and Outline account for 103 of the 179 total instances (58%). Mastery of these four is the single highest-leverage intervention for Section B performance.

**Brief-mention terms.** List, Name, Complete, and Draw are pedagogically close variants of Identify or Describe. They do not receive a dedicated `examTip` slide. On their first appearance in an AOS, add a 2–3 sentence callout in the `examPractice` speaker notes: *"This question uses 'List' — remind students: one item per line, no elaboration, examiners mark only the first N responses."*

### 9.3 Sequencing philosophy — per-AOS low → high cycling

Every Area of Study runs its own independent command-term progression from Acquiring → Extending. With four AOS units across Units 1 and 2, students encounter every major command term at least four times across the year — each time applied to different content, with the definition always shown.

**The pedagogical intent is spaced repetition of the metalanguage.** By the time students sit their Unit 2 exam, they have seen Explain taught four times, each with a fresh question anchored to new content. By Units 3/4, the `examTip` is no longer needed — students carry the definitions as automatic prior knowledge. The slide may still appear in revision lessons, but its function shifts from introduction to retrieval practice.

**Why show the definition every time?** Repetition is the mechanism. A student who has read the definition of Explain twelve times across two years does not need to reconstruct it under exam pressure — it is automatic. Showing it again costs six seconds of slide time and compounds the retrieval-practice benefit.

**Every AOS cycle runs Acquiring → Extending across its lesson sequence.** AOS units with fewer lessons compress the cycle; AOS units with more lessons can revisit mid-order terms a second time before reaching Extending. The Per-AOS Lesson Slot Assignment Table (§9.4) is the authoritative lookup — do not assign terms ad hoc.

### 9.4 Per-AOS lesson slot assignment table

This table is the **single source of truth** for command-term assignment within an AOS. Look up the AOS lesson position — the term in that cell is the focus of the `examTip` for that lesson. Do not deviate without updating this table and documenting the change in the *What Changed* block at the top of this file.

The table is designed for AOS units of 10–15 lessons. Slots beyond the actual lesson count for a given AOS are unused — do not compress the cycle to fit a shorter AOS; use the first N slots and stop.

| Slot | Cycle tier | Term | APC level | Notes |
|:---:|---|---|---|---|
| L1 | Acquiring — early | **Identify** | Acquiring | Opens every AOS. Simplest recall command. |
| L2 | Acquiring — early | **Define** | Acquiring | Pairs naturally with Identify — name it, then define it. |
| L3 | Acquiring — early | **State** | Acquiring | Closes the pure-recall cluster. |
| L4 | Consolidating — early | **Describe** | Consolidating | First step into elaborated responses. |
| L5 | Consolidating — early | **Outline** | Consolidating | Economy of description. Contrast with Describe. |
| L6 | Consolidating — mid | **Suggest** | Consolidating | Commitment + scenario fit. First applied-judgement term. |
| L7 | Refining — mid | **Explain** | Refining | Causal chain. Highest-frequency term in VCAA exams. |
| L8 | Refining — mid | **Justify** | Refining | Evidence + comparison. Builds on Explain. |
| L9 | Refining — mid | **Analyse** | Refining | Breakdown + relationships. Bridges Refining → Extending. |
| L10 | Extending — late | **Discuss** | Extending | Multiple perspectives + integration. |
| L11 | Extending — late | **Evaluate** | Extending | Judgement + criteria + evidence. |
| L12 | Extending — late | **Critique** | Extending | Structured evaluation: strength, weakness, recommendation. |
| L13 | Extending — late | **Recommend** | Extending | Specific action + reasoning + scenario fit. |
| L14 | Extending — review | **Explain** | Refining | Second exposure to highest-frequency term, harder question. |
| L15 | Mastering — bridge | **Predict** | Mastering | Final AOS (U2 AOS 2) only. Y12 bridge. Omit in earlier AOS. |

**Rules for applying the table:**

1. **Slot = lesson position within the AOS**, not the global lesson number across the unit. L1 means the first lesson of that AOS, regardless of whether it is Unit 1 or Unit 2.
2. **If the AOS has fewer than 15 lessons**, use slots L1–N where N is the actual lesson count. Stop before Predict unless it is the final AOS.
3. **Predict (L15) is only used in U2 AOS 2**, the final AOS before students enter Units 3/4. Do not assign Predict in U1 AOS 1, U1 AOS 2, or U2 AOS 1.
4. **The `examTip` term and the `examPractice` question's command term may differ** — this is expected. The tip teaches the assigned slot term; the exam question tests whatever command term fits the lesson content.
5. **Select** does not appear in the table as a standalone slot because it almost always appears in combined form ("select and justify"). It is taught via a combined-command note attached to the L8 Justify `examTip` rather than a dedicated slide.

### 9.5 Authoring discipline — `examTip` placement and content

**Recommended discipline:** insert an `examTip` slide in every lesson per the §9.4 slot, positioned immediately before the `examPractice` for that lesson. This is the PE pedagogy that drives spaced repetition; the validator does not enforce it, so the discipline lives with the author and the reviewer.

**Always include the full definition** on the `examTip`. Do not abbreviate or omit it on the grounds that students have seen it before. Repetition is the mechanism.

**The example used in the `examTip` must differ from the question used in the `examPractice`.** Both may use the same command term — but the question stems, content focus, and mark allocation must be different. String-identical questions defeat the spaced-repetition design.

**`examTip` is a "We Do" moment** — teacher talks through the definition, models the weak answer, narrates the strong answer. Estimated time: 4–5 minutes.

**For brief-mention terms** (List, Name, Complete, Draw): no dedicated `examTip` slide. When a lesson's `examPractice` uses one of these terms, add a 2–3 sentence speaker-note callout on the `examPractice` slide. The `examTip` for that lesson still runs — using the assigned slot term, not the brief-mention term.

**How per-term entries feed the slide fields:**

- **`headerTitle`:** `Answering '{term}' questions` (≤ 60 chars).
- **`tip`:** the *Pedagogical focus* line recast as a rule (≤ 200 chars).
- **`wrong` / `right`:** model a *Common error* from §9.6 and its fix (both or neither; ≤ 160 chars each).
- **`why`:** state the marks cost, citing the exam report (≤ 160 chars).
- **`notes`:** the *VCAA definition*, full *What it demands* list, *Pedagogical focus* line, and *mark_signal* heuristic for student self-check.

The `examPractice` that follows pulls its `modelAnswer` calibration from the worked example in the same per-term entry — structurally, not by copying the question.

### 9.6 Per-term reference

Each entry below is everything needed to build an `examTip` slide or calibrate an `examPractice`. Entries are ordered by APC Challenge Continuum level, then by cycle slot order within each level.

---

#### ACQUIRING-level terms

Students locate or recall discrete information. One-step response, no reasoning required. Typical mark allocation: 1–2 marks.

##### IDENTIFY

- **APC level:** Acquiring
- **Cycle slot:** L1 (first lesson of every AOS)
- **Frequency rank:** 2 (26 occurrences)
- **VCAA definition (APC phrasing):** Name a specific feature, structure, factor, or example — exactly as asked. No description, no explanation.
- **What it demands:**
  - A specific named element, not a general region or category
  - Exactly the number requested ("identify two…" means two — not three, not one)
  - The named element must use syllabus terminology, not a colloquial equivalent
- **Common errors (from VCAA reports):**
  - Naming a region or generic term ("heart muscle") where a specific structure is required ("sinoatrial node")
  - Providing a description when only identification was asked — wastes time and can introduce errors
  - Giving more than the requested number — examiners mark only the first N
- **Worked example:**
  > **Q:** *Identify two acute responses made by the muscular system to meet increased power output. (2 marks)* (2024 Q4cii)
  >
  > **Full-mark response:** Increased motor unit recruitment. Increased oxygen extraction.
- **Pedagogical focus:** Specificity. The failure mode is vagueness or generality, not wrong information.
- **mark_signal:** "Did you name a specific structure or factor — not a general area? Count your responses — do you have exactly the number asked for?"

##### DEFINE

- **APC level:** Acquiring
- **Cycle slot:** L2
- **Frequency rank:** 15 (3 occurrences)
- **VCAA definition (APC phrasing):** Give the precise, technical meaning of a term — typically one sentence using study-design language.
- **What it demands:**
  - A single-sentence definition using textbook/study-design wording
  - The key distinguishing feature of the term
  - No example required (unless the question says "define and give an example")
- **Common errors:**
  - Giving a description of when the thing is used instead of what it is
  - Circular definitions ("agility is being agile…")
  - Omitting the distinguishing feature
- **Worked example:**
  > **Q:** *Define 'agility'. (1 mark)* (2024 Q8a, paraphrased)
  >
  > **Full-mark response:** The ability to change direction quickly while maintaining balance.
- **Pedagogical focus:** Textbook language. VCAA accepts study-design definitions verbatim; students don't need to be creative.
- **mark_signal:** "Is your definition one precise sentence using study-design language? Does it include the key distinguishing feature?"

##### STATE

- **APC level:** Acquiring
- **Cycle slot:** L3
- **Frequency rank:** 5 (10 occurrences)
- **VCAA definition (APC phrasing):** Give a short, precise answer — typically a single value, fact, or direct answer to a closed question. No elaboration.
- **What it demands:**
  - A single, direct answer
  - Appropriate precision (if a number, include the unit; if a term, use the exact term)
  - Typically 1 mark, 1 answer
- **Common errors:**
  - Over-writing — providing a sentence where a word or phrase is required
  - Omitting the unit for numerical answers
- **Worked example:**
  > **Q:** *State the speed at which LIP occurred. (1 mark)* (2024 Q5a)
  >
  > **Full-mark response:** 14 km/h.
- **Pedagogical focus:** Brevity. The failure mode is padding, not inaccuracy.
- **mark_signal:** "Is your answer a single value or term? Did you include units if the answer is a number?"

##### NAME *(brief mention — no full `examTip`)*

- **APC level:** Acquiring
- **Frequency rank:** 8 (9 occurrences)
- **Treatment:** Brief mention only — 2–3 sentences in `examPractice` speaker notes on first appearance.
- **VCAA definition (APC phrasing):** State the correct technical term for a specific concept, structure, or phenomenon. No description.
- **Key distinction from Identify:** Name demands the official VCAA terminology — abbreviations and colloquial terms do not receive marks. "Beep test" earns zero; "20 m multi-stage fitness test" earns the mark.
- **Common errors:** Using informal terminology despite correct knowledge. VCAA 2024 report explicitly flagged this.
- **Speaker-note template:** *"This question uses 'Name' — remind students: only the official VCAA term earns marks. 'Beep test' is not acceptable — the full '20 m multi-stage fitness test' is required. One term per mark, no elaboration."*

##### LIST *(brief mention — no full `examTip`)*

- **APC level:** Acquiring
- **Frequency rank:** 7 (10 occurrences)
- **Treatment:** Brief mention only — 2–3 sentences in `examPractice` speaker notes on first appearance.
- **VCAA definition (APC phrasing):** Provide a sequence of items — one per mark — in any order. No elaboration.
- **Key distinction from Identify:** List allows any order and any format; Identify usually implies naming within a described context.
- **Common errors:** Listing more items than asked (only first N are marked); adding explanations that introduce scoreable errors.
- **Speaker-note template:** *"This question uses 'List' — one item per mark, any order, no elaboration. Examiners mark only the first N responses — writing more wastes time and risks introducing contradictions."*

##### COMPLETE *(brief mention — no full `examTip`)*

- **APC level:** Acquiring
- **Frequency rank:** 11 (4 occurrences)
- **Treatment:** Brief mention only — 2–3 sentences in `examPractice` speaker notes on first appearance.
- **VCAA definition (APC phrasing):** Fill in the missing information in a stem, table, diagram, or sentence using the correct term or value.
- **Key distinction:** The answer must grammatically and logically fit the blank — the surrounding context narrows the acceptable answers significantly.
- **Speaker-note template:** *"This question uses 'Complete' — remind students to read the full sentence or table header before answering. The answer must fit grammatically; check singular/plural and include units where required."*

---

#### CONSOLIDATING-level terms

Students apply knowledge to a described context. Response shows what, how, or when — but not yet why or causation. Typical mark allocation: 2–3 marks.

##### DESCRIBE

- **APC level:** Consolidating
- **Cycle slot:** L4
- **Frequency rank:** 3 (19 occurrences)
- **VCAA definition (APC phrasing):** Give a detailed account of the features, characteristics, or process. Include *what* happens and *when*, but not *why*.
- **What it demands:**
  - A clear, step-by-step or feature-by-feature account
  - Specific detail appropriate to the mark level (1 mark = 1 key feature; 2 marks = 2 key features or a sequential process)
  - Reference to the specific scenario if one is given in the stimulus
- **Common errors:**
  - Describing something generally when the question specifies a context
  - Slipping into explanation ("because…") when only description is asked
  - Missing steps in a process description
- **Worked example:**
  > **Q:** *Describe a similarity and a difference between an able-bodied athlete and a wheelchair athlete's free throw using angle and height of release. (3 marks)* (2024 Q9a)
  >
  > **Full-mark response:** Both athletes have a height of release lower than their landing height, which means they both need a high angle of release. However, as Athlete B has a lower height of release than Athlete A, they will require an even higher angle of release to project the ball upwards into the ring.
- **Pedagogical focus:** Detail without reasoning. Describe is harder than it looks because students over-interpret it as "explain".
- **mark_signal:** "Did you describe *what* happens — not *why*? Is every feature you described specific to the scenario given?"

##### OUTLINE

- **APC level:** Consolidating
- **Cycle slot:** L5
- **Frequency rank:** 4 (15 occurrences)
- **VCAA definition (APC phrasing):** Give a concise overview of the main features or steps. Shorter than describe, less detail per item.
- **What it demands:**
  - The key points only — not exhaustive detail
  - Typically 1 sentence per mark
  - Sequence matters when describing a process
- **Common errors:**
  - Over-writing — treating outline as "describe in full"
  - Missing a required element ("outline two stages and their characteristics" = 4 elements, not 2)
- **Worked example:**
  > **Q:** *Outline the two stages of muscle contraction and their characteristics for a plyometric exercise. (2 marks)* (2024 Q2c)
  >
  > **Full-mark response:** Plyometric exercises involve a rapid lengthening of the muscle (eccentric contraction) followed by a forceful shortening of the muscle (concentric contraction).
- **Pedagogical focus:** Economy. Outline demands coverage, not depth. This is a high-scoring command term when taught correctly.
- **mark_signal:** "One sentence per mark. Did you cover every element the question asked for — or did you go deep on just one?"

##### SUGGEST

- **APC level:** Consolidating
- **Cycle slot:** L6
- **Frequency rank:** 10 (4 occurrences)
- **VCAA definition (APC phrasing):** Propose a plausible option that fits the scenario. The suggestion must be grounded in the scenario context.
- **What it demands:**
  - One specific, named option (e.g. a specific training method, a specific strategy)
  - A brief link showing why this option fits the scenario described
- **Common errors:**
  - Suggesting a generic option without linking to the scenario
  - Suggesting multiple options without committing to one
- **Worked example:**
  > **Q:** *Suggest one recovery strategy the coach could use to minimise muscle soreness after the game. (2 marks)* (VCAA-style)
  >
  > **Full-mark response:** Cold water immersion — immersing in 10–15°C water reduces inflammation and muscle soreness post-exercise.
- **Pedagogical focus:** Commitment + fit. Pick one option and link it specifically to the scenario.
- **mark_signal:** "Did you name one specific option — not a category? Did you explain *why* it fits this scenario specifically?"

##### SELECT *(brief mention — no full `examTip`)*

- **APC level:** Consolidating
- **Frequency rank:** 12 (4 occurrences)
- **Treatment:** Brief mention only — covered as a combined-command note inside the L8 Justify `examTip` speaker notes.
- **VCAA definition (APC phrasing):** Choose the best option from those available, and typically justify why. Commonly appears in "select and justify" combined tasks.
- **Key distinction from Suggest:** Select implies options are given; Suggest implies the student generates the option.
- **Speaker-note template (add to L8 Justify):** *"'Select' almost always appears as 'select and justify' — teach students to split the task: first commit to one named choice (Select), then defend it with evidence and comparison to the alternative (Justify)."*

##### DRAW *(brief mention — no full `examTip`)*

- **APC level:** Consolidating
- **Frequency rank:** 19 (1 occurrence)
- **Treatment:** Brief mention only — 2–3 sentences in `examPractice` speaker notes where applicable.
- **VCAA definition (APC phrasing):** Produce a labelled diagram or illustration that shows the specified relationship, structure, or process.
- **Key reminder:** Clarity over artistry. Labels are worth marks; artistic quality is not assessed.
- **Speaker-note template:** *"This question uses 'Draw' — remind students: every significant feature must be labelled. Neatness matters only for legibility. Proportions/relationships must be accurate even if the drawing is simple."*

---

#### REFINING-level terms

Students show reasoning, causation, or comparison. Response links cause to effect, or identifies similarities and differences. Typical mark allocation: 2–4 marks.

##### EXPLAIN

- **APC level:** Refining
- **Cycle slot:** L7 (and L14 for second exposure)
- **Frequency rank:** 1 (43 occurrences — most frequent command term in VCE PE)
- **VCAA definition (APC phrasing):** Give a reasoned account that shows *why* or *how*. Must include a causal chain linking the cause to the effect.
- **What it demands:**
  - A clear causal chain: A causes B causes C
  - Named mechanisms — the *how*, not just the *what*
  - Specificity: "increased oxygen delivery" is better than "better blood flow"
  - Usually 1 mark per link in the chain
- **Common errors (from VCAA reports):**
  - Stating the outcome without naming the mechanism ("heart rate goes up" instead of "heart rate increases due to sympathetic stimulation of the SA node")
  - Chain breaks — skipping a step in the causal logic
  - Reliance on colloquial phrasing where technical terms are required
- **Worked example:**
  > **Q:** *Explain how an increase in the firing rate of motor units would aid sprinting performance. (2 marks)* (2019 Q6d)
  >
  > **Full-mark response:** An increased firing rate of motor units produces a greater force of muscle contraction. This generates higher muscular power, allowing the sprinter to accelerate more rapidly.
- **Pedagogical focus:** Mechanism and chain. The failure mode at Refining level is *outcome without mechanism*.
- **mark_signal:** "Draw your causal chain as A → B → C before writing. Each arrow is worth a mark. Did you name the mechanism, or just state what happened?"
- **L14 second-exposure note:** At second exposure (slot L14), the Explain `examTip` should use a harder worked example — typically 3–4 marks requiring a longer chain or an integrated response. The definition remains unchanged. The teacher note should acknowledge: *"You've seen Explain before — this time the chain is longer and the content is more complex. The same rule applies: mechanism, not outcome."*

##### JUSTIFY

- **APC level:** Refining
- **Cycle slot:** L8
- **Frequency rank:** 9 (8 occurrences)
- **VCAA definition (from 2024 report, verbatim):** *"'Justify' means that a comparison to the other variable identified in the stimulus needs to be made and they must defend their choice with evidence or reasoning."*
- **What it demands:**
  - A stated choice or position
  - Evidence drawn from the stimulus (data, context, specific detail)
  - Comparison to the alternative — saying why *this* and not *that*
  - A defensive structure: "because X… whereas Y would not because…"
- **Common errors (2024 Q8c commentary):**
  - Providing reasoning for the chosen option but not comparing it to the alternative — VCAA explicitly penalises this
  - Stating the choice without evidence
  - Using generic reasons that could apply to either option
- **Worked example:**
  > **Q:** *Justify which of two agility tests (Semo vs Illinois) is more suitable for badminton. (4 marks)* (2024 Q8c, summarised)
  >
  > **Full-mark response:** The Semo Agility Test involves side-stepping, running backwards and forwards. This test best replicates the movement patterns of badminton as shown by the frequency of movement — 30 sideways, 26 forwards and 12 backwards — making it more specific than the Illinois Agility Test, which is limited to just running forwards.
- **Pedagogical focus:** Comparison as evidence. Justify without a comparative move loses the differentiating mark.
- **mark_signal:** "Did you defend your choice *and* explain why the alternative is less suitable? If you only argued for your choice, you have not justified — you have explained."

##### ANALYSE

- **APC level:** Refining
- **Cycle slot:** L9
- **Frequency rank:** 16 (3 occurrences)
- **VCAA definition (APC phrasing):** Break a complex situation into its component parts and examine the relationships between them. Typically applied to data or a multi-factor scenario.
- **What it demands:**
  - Identification of the key components/factors
  - Explanation of how each contributes
  - The relationship between components (not just a list)
  - Where data is given, specific data references are expected
- **Common errors:**
  - Summarising rather than analysing — describing what the data shows without interpreting it
  - Analysing one factor in isolation and ignoring relationships between factors
- **Worked example:**
  > **Q:** *Analyse how changes in cardiac output and redistribution of blood flow contribute to meeting increased oxygen demand during maximal exercise. (3 marks)* (VCAA-style)
  >
  > **Full-mark response:** During maximal exercise, cardiac output increases dramatically through elevations in both heart rate and stroke volume, substantially raising the volume of oxygenated blood available to working muscles. Simultaneously, vascular shunting redirects blood away from non-essential organs to the working muscles, maximising the proportion of this elevated cardiac output reaching sites of oxygen demand. Together, these mechanisms multiply the oxygen delivery effect — neither alone would be sufficient.
- **Pedagogical focus:** Breakdown + relationships. Not just "what" but "how the parts connect to each other".
- **mark_signal:** "Did you identify the components *and* explain the relationship between them? A list of factors is not an analysis."

---

#### EXTENDING-level terms

Students evaluate, judge, or weigh multiple considerations. Response includes criteria, values, or a considered position. Typical mark allocation: 3–6 marks.

##### DISCUSS

- **APC level:** Extending
- **Cycle slot:** L10
- **Frequency rank:** 6 (10 occurrences)
- **VCAA definition (APC phrasing):** Present multiple perspectives, considerations, or sides of an issue with reasoning for each. For integrated questions (6+ marks), must include *interrelationships* between concepts.
- **What it demands:**
  - Multiple viewpoints or factors, each with reasoning
  - Balance — not just advocacy for one side
  - For integrated questions (Q11-style extended responses): **explicit interrelationships** between the knowledge points listed in the question
  - Data or stimulus references where provided
- **Common errors (2024 Q11 commentary):**
  - Writing separate paragraphs for each knowledge point rather than integrating them
  - Describing each concept in isolation with no linkage
  - Summarising the stimulus rather than discussing it analytically
- **Worked example note:** See 2024 Q11 (pickleball vs tennis) as the canonical integrated-question example. VCAA's sample response weaves four knowledge points through continuous causal reasoning. Mean score was 2.6/8 — the hardest command term to execute at full marks.
- **Pedagogical focus:** Integration. The failure mode at Extending level is *parallel description instead of connected discussion*.
- **mark_signal:** "Did you connect the factors to each other — or did you write a separate paragraph for each? Discuss means the ideas must speak to each other."

##### EVALUATE

- **APC level:** Extending
- **Cycle slot:** L11
- **Frequency rank:** 13 (3 occurrences)
- **VCAA definition (APC phrasing):** Make a judgement about worth, effectiveness, or validity. Must include criteria for the judgement and evidence supporting it.
- **What it demands:**
  - A stated judgement (effective / not effective / partially effective)
  - Criteria against which the judgement is being made
  - Evidence from the stimulus supporting the judgement
  - Balance: strengths and weaknesses typically both addressed
- **Common errors:**
  - Offering description without a judgement
  - Making a judgement without stating criteria or evidence
- **Pedagogical focus:** Judgement + evidence. The word "effective", "suitable", or equivalent must appear in the response.
- **mark_signal:** "Did you make a clear judgement — not just describe? Did you state the criteria you used to make that judgement? Is your evidence specific — not general?"

##### CRITIQUE

- **APC level:** Extending
- **Cycle slot:** L12
- **Frequency rank:** 14 (3 occurrences, rising with 2025–2029 study design)
- **VCAA definition (APC phrasing):** Evaluate with a structured emphasis on strengths, weaknesses, and recommendations for improvement. A three-part response structure.
- **What it demands (from 2024 Q5d commentary):**
  - **Identify a strength** of the program/approach/strategy
  - **Identify a weakness** of the program/approach/strategy
  - **Make a recommendation** to improve the weakness
  - Determine whether the program is **effective, somewhat effective, or ineffective**
  - Use specific data or evidence from the stimulus throughout
- **Common errors (2024 report):**
  - Only identifying weaknesses without strengths (or vice versa)
  - Making vague recommendations ("improve the program") without specifying what to change
  - Over-writing — making many data references that contradict an already-correct response
  - Identifying a "weakness" that is not actually a weakness
- **Worked example:**
  > **Q:** *Critique the effectiveness of the training program in improving LIP. (4 marks)* (2024 Q5d)
  >
  > **Full-mark response:** This program would be somewhat effective in improving Mika's LIP. A strength is the Fartlek session including periods of work at 85% of max HR — at the top end of the aerobic training zone it will help improve LIP. A weakness is the intensity of the Sunday continuous session (65% max HR) is below the aerobic training zone; this should be increased to 80% max HR.
- **Pedagogical focus:** Structure. Critique is one of the most teachable command terms because its structure is fixed: Strength → Weakness → Recommendation → Judgement.
- **mark_signal:** "Did you address a strength AND a weakness AND a recommendation? Use the structure: 'Strength is… Weakness is… This could be improved by…'"

##### RECOMMEND

- **APC level:** Extending
- **Cycle slot:** L13
- **Frequency rank:** 18 (1 occurrence 2024)
- **VCAA definition (APC phrasing):** Propose a specific course of action, with reasoning for why it is the most suitable option given the scenario.
- **What it demands:**
  - A specific, named recommendation (not "do more training")
  - Reasoning linking the recommendation to the goal or problem stated in the stimulus
  - Appropriateness to the scenario (cohort, constraints, resources)
- **Common errors:**
  - Generic recommendations that could apply to any scenario
  - Recommending something that conflicts with the scenario constraints
- **Pedagogical focus:** Specificity + fit. The recommendation must be concrete enough to act on immediately.
- **mark_signal:** "Could your recommendation apply to any athlete, or is it specific to *this* scenario? Did you explain *why* this recommendation fits the problem described?"

---

#### MASTERING-level term

##### PREDICT

- **APC level:** Mastering
- **Cycle slot:** L15 — **U2 AOS 2 only**
- **Frequency rank:** 17 (2 occurrences)
- **VCAA definition (APC phrasing):** Forecast a likely outcome based on reasoning from the given information. Must include both the prediction and its basis.
- **What it demands:**
  - A specific predicted outcome
  - A reasoning chain showing why this outcome is likely given the evidence
  - Consistency with physiological/biomechanical/psychological principles
- **Common errors:**
  - Predicting without explaining the reasoning
  - Contradicting the evidence or data given in the stimulus
- **Pedagogical focus:** Forecast with justification. The mark is earned by the reasoning, not the prediction itself.
- **mark_signal:** "Did you state *what* will happen AND *why* it will happen based on the evidence? A prediction without reasoning earns zero."

---

### 9.7 Combined-command patterns

Several VCAA questions use combined command verbs — the student must address both. Each verb independently carries the scoring expectations of its own command term.

| Pattern | Observed count 2018–2024 | Example |
|---|:---:|---|
| *Identify and describe* | 3 | "Identify and describe one factor…" |
| *Identify and discuss* | 1 | "Identify and discuss how sociocultural factors…" |
| *Name and describe* | 1 | "Name and describe another standardised test…" |
| *Name and define* | 1 | "Name and define the appropriate fitness component…" |
| *Describe and explain* | scattered | "Describe the relationship… and explain why…" |
| *Select and justify* | 4 | "Select the most appropriate test and justify your choice…" |

**Rule for combined commands.** Teach students to mentally split the question in two, addressing each verb separately. A combined "Identify and describe" is a 1-mark Identify task plus a 2-mark Describe task, not a single 3-mark response. In an `examTip`, the primary verb (the higher-order one) drives the slot term assignment; the secondary verb is noted in speaker notes.

### 9.8 The scaffolding phrase "Use [X] to…"

Many VCAA questions scaffold a command with an instruction about *what resource to draw from*. These phrases are **not command terms** — the real command follows.

- *"**Use** the data from the table to **explain**…"* — primary command is **explain**, scaffolded by a data requirement
- *"**Use** your understanding of [concept] to **describe**…"* — primary command is **describe**, scaffolded by a concept requirement
- *"**Use** information from the stimulus to **support** your response…"* — primary command is whatever appeared earlier; "support" is a scaffold

**Teaching note.** When a question begins with "Use…", students should locate the actual command verb later in the sentence (typically after "to") and treat that as the task. Failing to reference the specified resource loses scaffolding marks even if the command is answered correctly.

### 9.9 Revision policy for this section

Revise §9 when:

- VCAA publishes new examiner reports (annually in March) — update frequency counts and add new common errors observed
- A new study design introduces or emphasises a command term (the 2025–2029 study design did for Critique)
- An AOS lesson count changes — update the slot table and document the change
- A new combined-command pattern appears in VCAA papers

Document changes in the *What Changed* block at the top of this file.

---

## 10. Sport Context in PE Lesson Design

### Why this rule exists

VCE PE exam performance depends on applying theory to a named sport or movement scenario under time pressure. The examiner reports are consistent: high-scoring responses name a specific sport and connect every concept to what the athlete experiences; low-scoring responses describe concepts correctly but in the abstract. Transfer must be practised throughout the lesson, not bolted on at the end. So every PE lesson is built around a declared sport context that threads through every slide.

### Declaring the sport context

Record the sport context in the lesson brief and in the spec's `meta`/notes (it is an authoring discipline, not a validated field — the validator does not check it, so the author and reviewer own it):

```json
"sport_context": {
  "sport": "Australian Rules Football",
  "athlete_type": "midfielder",
  "scenario": "A midfielder completes a 120-minute match with two periods of extra time in hot, humid conditions.",
  "why_chosen": "Sustained, varied cardiovascular demand (12–15 km across intensity zones) makes it ideal for linking cardiac output, heart rate, and stroke volume to real performance drop-off."
}
```

**Choosing the sport:** pick one whose demands directly illuminate the lesson's KK (cardiovascular → AFL, cycling, rowing; biomechanics → shot put, swimming, gymnastics). Vary the sport across lessons within an AOS. Never use generic scenarios. Where the textbook has a worked example in a specific sport, reuse that sport to reduce cognitive load.

### How it threads through the slide types

| Slide type | Sport-context requirement |
|---|---|
| `doNow` | At least one item references the sport context or a closely related movement. |
| `iDo` | Every `iDo` uses the sport context in at least one example or analogy. Abstract physiology must be followed by a sport-specific application — the `notes` must carry a sport-context anchor sentence. |
| `learningActivity` | The `task` is set in the sport context; any data uses sport-realistic values. |
| `youDo` | All five `continuumLevels` reference the sport context (table below). |
| `examTip` | The modelled error/fix uses the sport context where natural. |
| `examPractice` | The `question` uses the sport context — the strongest transfer-modelling moment. |
| `exitCard` | At least one question requires connecting the lesson's KK to the sport context. |

### Sport context across the YOU DO continuum

The Challenge Continuum scales sport-context complexity alongside cognitive demand. Author the five `continuumLevels` in this order:

| Level | Treatment (example: cardiovascular responses, AFL midfielder) |
|---|---|
| **Acquiring** | Identify/define within the scenario. "Identify two cardiovascular responses the midfielder experiences in the third quarter." |
| **Consolidating** | Describe/outline what happens to the athlete. "Describe how the midfielder's cardiac output changes between rest and the third quarter." |
| **Refining** | Explain/justify using the scenario as evidence. "Explain why performance may decline in extra time, using cardiac output and stroke volume." |
| **Extending** | Evaluate/discuss from multiple angles. "Evaluate the role of cardiovascular fitness in sustaining performance across 120 minutes." |
| **Mastering** | Theorise/predict/design, integrating prior lessons. "Predict the HR and GPS indicators in the final ten minutes of extra time; justify using cardiac output, energy-system contribution, and thermoregulation." |

### Authoring checklist (run before building — replaces the old validator hook)

Confirm in the spec review notes:

- [ ] `sport_context` declared, with `why_chosen` justified against the lesson's KK
- [ ] Every `iDo` references the sport context in content or notes
- [ ] The `learningActivity` task is set in the sport context
- [ ] All five `youDo` continuum levels reference the sport context
- [ ] The `examPractice` question uses the sport context
- [ ] At least one `exitCard` question requires sport-context application

---

## 11. Exam Technique in PE — `examTip` and `examPractice`

There is no command-term-spotlight slide. PE exam technique is delivered through two schema slide types, informed by §9 (the command-terms sequencing and per-term reference).

### `examTip` — teaching the command term / technique

Use an `examTip` slide to teach the command term assigned to the lesson's slot (§9.4). The `tip` states the technique as a rule; `wrong`/`right` model the common PE error and its fix (both or neither); `why` cites the marks cost. Position it after the `iDo` sequence that introduces the content the technique applies to, and before the `examPractice` where students apply it.

§9.5 lays out the authoring discipline and §9.6 supplies the content (VCAA definition, *What it demands*, common errors with year references, worked examples, mark signals) that feeds the slide's fields.

**PE convention — link to sports performance.** A strong PE response connects a theoretical concept to a specific, named movement context and follows it through to a performance outcome. Model this structure in the tip and in every model answer:

```
[Concept + accurate definition]
→ [Mechanism — how it operates physiologically / biomechanically]
→ [Effect on the movement or skill being performed]
→ [Performance outcome for the named athlete / activity]
```

### `examPractice` — the exam question and modelled answer

The `examPractice` pair gives students a VCAA-style question to attempt under time, then a modelled answer at realistic student standard.

- **`question`** uses the lesson's sport context and the assigned command term. Author a fresh question from the current lesson's content — do not reuse the §9.6 worked example.
- **`strategy`** (2–3 items) is the "how to approach" panel, labelling the link-to-performance structure above.
- **`modelAnswer`** is continuous prose (never dot points in an extended response), names the sport, links every concept to performance, and is written at a standard a strong student could actually produce under time.

**Model-answer length guide by marks** (the validator soft-warns if exceeded — heed it, don't over-polish):

| Marks | Target chars | Shape |
|---|---|---|
| 1–2 | ≤ 200 | 1–2 sentences |
| 3–4 | ≤ 360 | 3–5 sentences |
| 5–6 | ≤ 540 | short paragraph |
| 7–8 | ≤ 720 | 2 short paragraphs |
| 9–10 | ≤ 900 (capped at field max 700 — split across a continuation if needed) | 2–3 short paragraphs |

- **`markPoints`** (2–6) state where marks are awarded — derived from the term's *What it demands* list in §9.6.
- **`commonError`** is drawn from the exam report (the year/question references in §9.6 are gold).

**PE marking conventions to model:**

- Always name a specific sport/movement — never "an athlete" or "sport in general".
- Quote data with correct units before interpreting — e.g. "At 85% HRmax during the run phase…".
- In interrelationship questions, connect the concepts to each other *and* to performance; isolated concepts cannot reach the High band.
- Concept-map links must be labelled and directional — unlabelled lines do not demonstrate interrelationship.

---

## 12. Energy Systems — Quick Reference

The most frequently tested and most frequently confused content in VCE PE. Apply these definitions and values consistently.

### Overview

| System | Also known as | Primary fuel | Duration | Intensity | O₂? | Fatigue mechanism |
|---|---|---|---|---|---|---|
| **ATP-PC** | Phosphocreatine / alactic anaerobic | PC stored in muscle | 0–10 s | Maximal | No | PC depletion; minimal lactate |
| **Anaerobic glycolysis** | Lactic acid / glycolytic | Muscle glycogen | 10 s – 2 min | High–maximal | No | Lactate → H⁺ accumulation → fatigue |
| **Aerobic** | Oxidative | Glycogen, fats (protein at extremes) | 2 min+ | Low–submaximal | Yes | CO₂/H₂O; glycogen depletion, heat, dehydration |

### Key details

- **ATP-PC:** PC + ADP → ATP + creatine (creatine kinase). ~30 s for 50% replenishment, 2–3 min full (passive). Examples: 100 m sprint, shot put, tennis serve, jump shot. Training: sprint/interval, work:rest ~1:6–1:12.
- **Anaerobic glycolysis:** glucose → pyruvate → lactate; net 2 ATP. Fatigue from **H⁺ accumulation** disrupting contractility — not "lactic acid burn". Recovery via oxidation and gluconeogenesis; active recovery accelerates clearance. Examples: 400 m, 100 m swim, repeated-sprint sports. Training: HIIT, lactate-threshold, repetition.
- **Aerobic:** aerobic glycolysis (36–38 ATP), beta-oxidation (~100+ ATP/fatty acid), Krebs + ETC. Substrate shifts fats → glycogen as intensity rises (>~75% VO₂max almost all glycogen). Fatigue from glycogen depletion ("the wall"), hypoglycaemia, dehydration, heat. Examples: marathon, triathlon, road cycling. Training: continuous, fartlek, aerobic interval, LSD.

### Interplay, deficit, EPOC

- All three operate **simultaneously**; dominance shifts with intensity and duration. At onset: ATP-PC → glycolytic → aerobic as O₂ supply catches up.
- **Oxygen deficit:** the gap between O₂ demand at onset and O₂ actually consumed.
- **EPOC:** elevated post-exercise O₂ consumption to restore homeostasis — replenish PC, clear metabolic by-products, restore temperature and hormone levels.

> **Content boundary:** the a-VO₂ (arteriovenous oxygen) difference is **not examinable at Units 1/2** — exclude it from all U1/U2 lessons and revision, even as extension.

### Fatigue and recovery

| Type | Cause | Recovery |
|---|---|---|
| Peripheral | Local muscle — H⁺, glycogen depletion, temperature | Active recovery, CHO nutrition, cooling |
| Central | CNS — reduced motor-neuron firing, perceived exertion | Sleep, rest, hydration |
| PC depletion | Maximal efforts >10 s | Passive rest 2–3 min |
| Lactate accumulation | High-intensity efforts | Low-intensity active recovery |

---

## 13. Stimulated Learning 5Ps — PE Examples

| P | PE examples |
|---|---|
| **Play** | Practical tasks exploring a biomechanical principle (manipulating centre of gravity in a stability challenge). Card-sorting energy systems to sport scenarios. Designing a training program for a hypothetical athlete. |
| **Pitch & Pace** | One energy system per `iDo` cycle. Continuum moves from identifying ATP-PC characteristics (Consolidating) to justifying training-method selection for an elite athlete (Extending/Mastering). |
| **Purposeful Technology** | Slow-motion video to identify biomechanics in student movement. Wearable HR data mapped to energy-system responses. Digital concept maps (Canva, Miro) linking principles to adaptations. |
| **Pedagogical Practice** | Link-to-performance modelled on every `examPractice`. Practical–theoretical integration explicit each lesson. HITS embedded — worked examples, questioning, exit cards. |
| **Participation** | Jigsaw: groups become experts on one energy system and teach peers. Mini-whiteboard checks during `iDo`. Peer feedback on training-program design using a criteria card. |

---

## 14. Chunking Strategies — PE Examples

(Name the chunking strategy in every `iDo` slide's speaker notes per §1.7.)

| Strategy | PE example |
|---|---|
| **Thematic** | Group the three energy systems under "What does the body do when oxygen runs out?" rather than teaching each in isolation. |
| **Cognitive Bookends** | Open: "What happens to your muscles in the first 10 seconds of an all-out sprint?" Close: "Which energy system was dominant, and why?" |
| **Progressive Disclosure** | Teach aerobic structure (glycolysis → Krebs → ETC), check understanding at each stage, then introduce fatigue — not all at once. |
| **Interleaved Examples** | While teaching training principles, prompt recall of energy-system demands from the prior lesson and link the principle to them. |
| **Dual Coding** | Annotated pathway diagram alongside the verbal explanation; consistent colour-coding per system; HR-response graph paired with dominance explanation. |

---

## 15. Student Feedback & Reflection

### Written feedback

Use **WWW/EBI** (What Went Well / Even Better If) or **2 stars and a wish**:

- Be specific — reference the actual response.
- Reference VCAA criteria explicitly, including whether interrelationships and link to performance are evident.
- Give next steps before the next SAC/exam.
- Warm, professional, growth-oriented. No vague praise.

### ABCPE reflection prompts (on every SAC feedback sheet)

- How happy are you with your SAC score out of 10?
- What would you rate your SAC preparation out of 10?
- What did you do well throughout this SAC?
- What will you focus on before the exam (knowledge and exam technique)?
- Did you prepare adequately (practice SACs, VCAA questions, summaries, flash cards)?
- What will you do better in preparing for the next SAC?
- What can teachers do to help you prepare better?

---

## 16. Project Files Reference

Search these directly when needed:

| File | Use for |
|---|---|
| `2025PhysicalEducationStudyDesign.docx` | KK, KS, outcomes, SAC requirements (verbatim source for `lis`) |
| `2025PhysicalEducation.pdf` | VCAA-style questions for `examPractice` and question banks |
| `2025-PhysEd-report.docx` | Common errors, mark distributions, exemplars, link-to-performance models |
| `ABCPE_Sample_Assessments_-_All_In_One.pdf` | Sample SACs, concept maps, extended-response exemplars, rubrics, reflection sheets |
| `PE_Lesson_Sequence_Master.md` | Per-AOS lesson breakdown, split/combine decisions, naming convention, standing exclusions |

> Command-term sequencing and per-term content now live in §9 of this file. The former `VCE_PE_COMMAND_TERMS.md` is retired.

**Generating `examPractice` questions:** search the exam report and ABCPE samples for the lesson topic to find high-scoring exemplars. **Generating Unit 4 SAC materials:** use the ABCPE samples as the primary reference for concept-map structure, extended-response format, and rubric band descriptors.

---

*APC_PE.md | Albert Park College | Version 2026-T3.1*
*VCE PE subject overlay — always use with `apc_schema.md`, `validators.js`, and `APC_Core.md`.*
*v2026-T3.1: Merged the contents of the former `VCE_PE_COMMAND_TERMS.md` into §9 (sequencing, per-AOS slot table, per-term reference, combined commands, scaffolding phrases). Routed per-term entries to `examTip`/`examPractice`. Removed all legacy references to `SPEC_SCHEMA.md`, `COMMAND_TERM_SPOTLIGHT`, and `EXAM_MODELLING`. Reframed "mandatory spotlight every lesson" as a PE authoring discipline since the validator does not enforce it. One subject artefact, no cross-file drift.*
