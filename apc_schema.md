# APC Slide Schema
**Albert Park College — Lesson Slide Constitutional Rules & Slide Type Specifications**
Version: v1 (draft, §1 only)
Status: Working draft for review with David
Companion files: APC_Core.md (pedagogical framework), subject overlay (palette + content)

---

## §1. Constitutional Rules

These rules are the schema's non-negotiables. Every slide type defined in §2+ must respect them. The PptxGenJS builder validates each rule at build time. **A deck that violates any of these rules does not build** — it fails with a specific error pointing the author at the offending slide and field.

The intent: a senior leader walking past a TV in a classroom can see APC's pedagogical frameworks at a glance, and no student squints from the back row.

---

### 1.1 Typography Floor

| Element category | Min size | Notes |
|---|---|---|
| **Projected reading text** (anything a student reads from the TV) | **16pt** | Body text in cards, KK/KS items, DO NOW questions, Exit Card questions, header bar titles, sub-headings |
| **Navigation pills** (small tag in card corner identifying card type) | **12pt** | Bold white only, on sufficiently dark accent colour. Labelled exception — not body content, reinforced by colour coding. |
| **Title slide hero text** | **52pt** | Unchanged from existing system |
| **Title slide accent text** (unit/year/duration line, school name) | **16pt** | Was 13pt in existing system — raised to floor |

**Removed entirely from projected slides:**
- Footers / footer alignment lines
- Image placeholder captions
- Italic hints below questions
- Speaker-only notes printed on slide

If a slide currently displays any of the above, the schema relocates them to **speaker notes** or removes them. Teacher-reference content lives in notes, not on the projected surface.

**Font family:** Calibri throughout. No exceptions.

---

### 1.2 Content Limits (Auto-Split Rule)

Every text field in every slide type has a hard `maxChars` limit, calculated from card geometry × font size × AAA-compliant line spacing × a 10% safety margin. The limits per field are defined in each slide type's spec (§2+).

**Overflow handling:**

| Field type | Behaviour on overflow |
|---|---|
| Body text inside a card | **Auto-split**: builder generates a continuation slide with the same header + " (cont.)" appended, copies the card structure, flows remainder. |
| Header bar title | **Hard fail.** Build refuses. Author shortens the title. |
| Slide sub-heading | **Hard fail.** Build refuses. |
| Card label (pill text) | **Hard fail.** Pill text is fixed-vocabulary (KEY KNOWLEDGE / DEFINITION / etc.) and cannot overflow by design. |
| Navigation pill | N/A — fixed vocabulary |

**Auto-split ceiling:** A maximum of **one continuation slide per source slide**. If content would require a third slide, the build fails with the message:

> "Slide [N] content exceeds two-slide capacity. This indicates the content is not properly chunked. Split the concept upstream into two separate ideas — one idea per slide is a constitutional rule (§1.5)."

This protects cognitive load.

---

### 1.3 Colour Contrast (AAA)

All text/background colour pairs on projected surfaces must meet **WCAG 2.1 AAA contrast**:

| Text type | Minimum ratio |
|---|---|
| Normal text (under 16pt, or 16pt non-bold) | **7:1** |
| Large text (16pt bold, or 18pt+ regular) | **4.5:1** |

**Build-time validation:** Every deck build calls `validatePalette(P)` before the first slide is rendered. The function tests every text/background combination defined in the subject overlay palette and the continuum colours against the AAA ratio. If any pair fails, the build refuses with:

> "Palette failure: [colour A] on [colour B] = [actual ratio]:1, requires [target]:1. Adjust the subject overlay palette before building."

**Why AAA, not AA:** TV displays in classrooms have glare, side-angle viewing from far seats, and ambient overhead lighting. AAA is the standard required for those conditions. AA is web-default and assumes better viewing conditions than a classroom provides.

---

### 1.4 Layout Geometry (Locked)

| Dimension | Value | Why locked |
|---|---|---|
| Slide size | 13.333" × 7.500" (LAYOUT_WIDE) | PptxGenJS standard for 16:9 TV |
| Margin (all edges) | 0.14" | Print-safe, consistent across slide types |
| Header bar height | 0.56" | Accommodates 16pt+ bold text with vertical padding |
| Left pipe accent width | 0.06" | Subject palette identity marker, full height below header |
| Card gap (between stacked cards) | 0.12" | Visual separation without wasted space |
| Card internal padding | 0.18" | Text breathing room from card edge |
| Card shadow | outer, blur 4, offset 2, angle 135°, opacity 0.08 | Subtle depth, no visual noise |

**Usable content area** (defined for every slide type):
```
contentX      = D.margin + D.pipeW          // 0.20"
contentY      = D.headerH + D.margin        // 0.70"
contentW      = D.slideW - contentX - D.margin   // 12.99"
contentH      = D.slideH - contentY - D.margin   // 6.66"
```

All cards, text boxes, and shapes must fit inside the `(contentX, contentY, contentW, contentH)` rectangle. The builder asserts this for every shape before adding it to the slide. **A shape that crosses the boundary fails the build.**

---

### 1.5 One Idea Per Slide (Cognitive Load)

A slide may introduce **one new concept, definition set, worked example, or question set only**. This is a constitutional rule, not a guideline.

**"One idea" means one coherent learning unit, not literally one fact.** A `definition` slide that defines three closely-related terms forming a single conceptual set (e.g. GNI, GDP, PPP — all measures of national income for comparing countries) is *one idea*: "how we measure and compare income." Splitting it across three slides would fragment a unit students should hold together. The test is conceptual coherence: do these items belong to one mental model the student is building? If yes, one slide. If they're genuinely separate concepts (the classification system vs the characteristics), separate slides.

The schema enforces this structurally:

| Slide type | Maximum new-information units |
|---|---|
| I DO (concept/principle) | One concept + its unpacking |
| I DO (definition) | One coherent definition set (1–4 related terms) |
| I DO (process/worked-example) | One process or one example |
| LEARNING ACTIVITY | One task |
| Exit Card | Up to three short questions, all checking the *same* learning goal |
| DO NOW | One activation activity (questions all target prior knowledge) |

The guard against abuse: if an author puts two *unrelated* definitions on one slide (e.g. "PPP" and "the Ottawa Charter"), that's two ideas — split them. Related set, one slide; unrelated items, separate slides. Authoring judgement, guided by conceptual coherence.

---

### 1.6 Dynamic Card Height

Card heights are **calculated**, never hardcoded. The builder computes:

```
cardH = cardPad×2 + (fontSize × lineHeightMultiplier × lineCount) + labelPillH
```

Where `lineCount` is derived from the actual text length and card width. If the calculated `cardH` plus existing slide content exceeds the usable content area height, the auto-split rule (§1.2) triggers.

**No card may have a hardcoded height literal anywhere in the codebase.** A linter check enforces this.

---

### 1.7 Framework Visibility

Every lesson deck must make the APC pedagogical frameworks visible to a senior leader scanning the deck. This means:

- **APC six-stage sequence** is visible via slide-type headers: a deck must include slides labelled DO NOW, I DO, WE DO, YOU DO (portal-pointer), and EXIT in that order
- **Challenge Continuum** is referenced on the YOU DO slide (pointing to portal) and tagged in speaker notes for differentiated I DO/WE DO content where applicable
- **5Ps** — at least two of Play / Pitch & Pace / Purposeful Technology / Pedagogical Practice / Participation are tagged in speaker notes of relevant slides
- **HITS** — the specific HITS strategies used in each I DO sequence are tagged in speaker notes
- **Chunking strategy** — every I DO slide names its chunking strategy in speaker notes (Thematic / Cognitive Bookends / Progressive Disclosure / Interleaved Examples / Dual Coding)

The builder generates a **deck audit report** at build time showing which frameworks appear where. If a required framework element is missing, the build warns (not fails) — author can override with a comment if the omission is deliberate.

---

### 1.8 Speaker Notes Are Mandatory

Every projected slide must have speaker notes. Notes carry:

- DO NOW answers (never on slide)
- YOU DO five-level continuum task text (the portal version is the source of truth; notes mirror it for teacher reference during the lesson)
- Chunking strategy label for I DO slides
- HITS strategies used
- 5Ps tags
- Modelled-response sample answers where applicable
- Cold-call instructions and teaching tips

A slide with empty speaker notes fails the build for I DO, WE DO, YOU DO, DO NOW, and Exit Card slide types. (Title slide and Summary slide may have empty notes.)

---

### 1.9 No Decoration

The following are prohibited from all projected slides:

- Gradients (solid fills only)
- Underlines under titles or headings (use weight + colour + size for hierarchy)
- Decorative shapes that do not carry information
- Large section numerals
- Drop caps
- Stock illustrations used as backgrounds
- More than three colours from the subject palette visible on one slide

Emojis are permitted as **information-carrying visual anchors only**: ✅ ❌ 💡 ⚠️ 📖 ▸. Decorative emojis are prohibited.

---

### 1.10 Palette Consistency

The subject overlay is the **single source of truth** for all colour in a deck. Every slide type reads colour from the same palette object `P`, using the same named fields. No slide type defines colours inline. No slide type overrides a palette field.

**Required palette fields (subject overlay must provide all):**

| Field | Purpose |
|---|---|
| `P.accent` | Primary subject identity colour (used in title slide strip, pipe accents, navigation pills) |
| `P.pipe` | Darker variant of accent, used for left stripe and high-weight elements (headings, numbers) |
| `P.bgLight` | Tinted background for content slides |
| `P.bgDoNow` | Warm background variant for DO NOW slides only |
| `P.doNow` | Header bar colour for DO NOW slides |
| `P.iDo` | Header bar colour for I DO slides |
| `P.weDo` | Header bar colour for WE DO slides |
| `P.youDo` | Header bar colour for YOU DO portal slides |
| `P.exit` | Header bar colour for Exit Card slides |
| `P.summary` | Header bar colour for Summary slides |
| `P.cardKK` | Background colour for Key Knowledge cards |
| `P.cardKS` | Background colour for Key Skills cards |
| `P.cardDef` | Background colour for Definition cards |
| `P.cardExample` | Background colour for Worked Example cards |
| `P.text` | Primary text colour (typically `1C1C1A`) |
| `P.textInverse` | Text colour for use on dark backgrounds (typically `FFFFFF`) |

**Enforcement:**

- The builder calls `validatePaletteComplete(P)` at deck start. Any missing field → hard fail with `"Subject overlay missing required palette field: P.{name}"`.
- No slide-type function may contain a hex colour literal. A linter check enforces this — any string matching `/[0-9A-F]{6}/i` outside the palette definition file fails the build.
- Subject overlays may not redefine palette fields mid-deck. Palette is loaded once at deck start, frozen, and read-only thereafter.
- Continuum colours (for differentiated content tagging in speaker notes) are also part of `P` — `P.continuumAccess`, `P.continuumCore`, `P.continuumExpert` etc.

**Why this matters:** Inconsistency in palette is the single most visible sign of a sloppy deck. A teacher building a slide deck across multiple sittings shouldn't end up with two slightly different shades of "Geography blue." The schema makes that impossible by structurally preventing inline colour.

---

### 1.11 Editable Text Boxes for Lists

Any list content (bulleted, numbered, or multi-line items grouped under a single heading or pill label) must render as **a single PowerPoint text box** with native list formatting, not as individually positioned text elements per item.

**Why:** Teachers edit decks in PowerPoint after the builder runs — adding items, fixing typos, adapting to class needs. Lists made of separate positioned text boxes are uneditable in practice: adding a sixth item means manually creating a new text box, positioning it, matching the bullet style, and adjusting all items below. Lists in a single text box are editable in three seconds with no formatting drift.

**Implementation rules:**

- Use PptxGenJS array syntax: `addText([{text: "item 1"}, {text: "item 2"}], { ... })`
- **Each list item (and each distinct paragraph) MUST set `breakLine: true` in its options**, or PptxGenJS treats consecutive array entries as runs within a single paragraph — collapsing a multi-item list into one line with all text concatenated.
- **The bullet config MUST be on each item's options object, NOT on the text-box-level options.** This is critical: a box-level `bullet: { type: 'number' }` applies auto-numbering to the *first* paragraph only and emits `<a:buNone/>` for every subsequent paragraph — producing "1." on item one and no marker on items two onward. Putting `bullet: {...}` on each item's options emits a proper `<a:buAutoNum>` (or `<a:buChar>`) per paragraph, so every item is numbered/bulleted. Verified at the OOXML level.
- For items composed of multiple runs (e.g. a bold label followed by regular body text in the same bullet), the bullet config and `breakLine` go on the run that *starts* the line; intermediate runs carry neither, so they stay on the same line.
- Custom bullet characters (e.g. `■` Unicode 25A0) set via `bullet: { code: '25A0', color: P.pipe }` — again, per item.
- Line spacing and inter-item spacing handled by PowerPoint's native paragraph rules (`paraSpaceAfter`), not by calculated y-offsets between separate elements
- Numbered lists use `bullet: { type: 'number' }` not manually-typed "1.", "2.", "3." prefixes (manual numbering breaks if items are re-ordered in edit mode)

**Exception:** Layouts where each item is structurally distinct from the others (e.g. the DO NOW `would-you-rather` two-option layout, where Option A and Option B are separate cards) remain separate elements — they're not a list, they're parallel structures with their own visual identity.

**Builder enforcement:** A linter check on slide-type functions flags any pattern that loops `addText` calls with incrementing y-coordinates for items that share a label. Such patterns indicate per-item text boxes and must be rewritten as a single bulleted text box.

---

### 1.12 Lesson Coherence

Every Key Knowledge (KK) item listed on the Learning Intentions & Success Criteria slide must be explicitly taught by at least one I DO slide in the same deck.

**Why this matters.** A lesson that promises content it doesn't deliver is incoherent. The LIS slide says "today we'll learn X, Y, Z"; the Summary slide says "you should now know X, Y, Z"; both depend on the lesson body actually teaching X, Y, and Z. Without enforcement, a deck can promise three KK items on slide 3 and only teach two of them in the I DO sequence — a coherence gap students will experience as "we never covered that."

**Enforcement mechanism.**

- Every I DO slide carries a required field `teaches: number[]` — a list of KK indices (1-based, matching the LIS slide's KK array order) that this slide covers.
- The builder runs `validateLessonCoverage(deck)` after all slides are specified: for every KK item in the LIS slide, at least one I DO slide must include that index in its `teaches` array.
- A KK item not claimed by any I DO slide → hard fail with message: `"KK item {N} ('{first 50 chars of KK text}...') is listed on the Learning Intentions slide but not taught by any I DO slide. Either add an I DO slide that teaches this KK, or remove it from the Learning Intentions."`
- An I DO slide claiming a `teaches` index that doesn't exist in the LIS array → hard fail with: `"I DO slide {N} claims to teach KK{X}, but the Learning Intentions slide only has {Y} KK items."`

**Why I DO only (not LEARNING ACTIVITY).** LEARNING ACTIVITY slides give students practice with content already taught; they don't introduce new KK. If a teacher is using a LEARNING ACTIVITY to introduce content, that's a pedagogical anti-pattern — practice without prior instruction — and the schema shouldn't accommodate it. Coverage = I DO coverage.

**Why this is enforced not advised.** Author discipline can't be trusted across multiple decks built across multiple weeks. The validator catches incoherence at build time, when the cost of fixing it is small. Without the validator, the cost would land on students mid-lesson — when fixing it is impossible.

**Author workflow.** When writing an I DO slide, the author specifies which KK items it teaches:

```javascript
{
  type: 'iDo',
  variant: 'concept',
  headerTitle: 'Factors influencing population distribution',
  teaches: [2],   // this I DO covers KK item 2 from the LIS
  concept: '...',
  bullets: [...],
  notes: '...'
}
```

This makes the lesson architecture self-documenting — anyone reading the deck source can trace which slides deliver which KK.

---

### 1.14 Pill Width Sizing

Pill labels are the small coloured rectangles containing white bold text that appear in the top-left of cards (e.g. "KEY CONCEPT", "TASK", "CHECK", "YOU SHOULD NOW KNOW"). Their widths must be **calculated from the label text**, never hardcoded as guesses.

**Why this matters.** A pill width that's too narrow forces the text inside to wrap onto two lines, which looks broken. "KEY CONCEPT" at 12pt bold in a 0.85" pill wraps because "KEY CONCEPT" needs ~0.97" to render as a single line. Hardcoding pill widths means every label vocabulary change risks regression.

**Calculation rule:**

```
pillW = max(0.90, charCount × 0.11 + 0.30)
```

Where:
- `charCount` is the character count of the pill label text
- `0.11"` is the empirically-derived average character width for 12pt bold uppercase Calibri (measured, not estimated — bold uppercase is wider than mixed-case body text)
- `0.30"` is the internal horizontal padding (0.15" each side)
- `0.90"` is the minimum pill width for visual presence

**Fixed vocabulary widths** (recomputed with the corrected formula):

| Label | Chars | Computed width |
|---|---|---|
| TASK | 4 | 0.90" (floor) |
| CHECK | 5 | 0.90" (floor) |
| PROCESS | 7 | 1.07" |
| PRINCIPLE | 9 | 1.29" |
| KEY SKILLS | 10 | 1.40" |
| DEFINITION | 10 | 1.40" |
| KEY CONCEPT | 11 | 1.51" |
| KEY KNOWLEDGE | 13 | 1.73" |
| WORKED EXAMPLE | 14 | 1.84" |
| YOU SHOULD NOW KNOW | 19 | 2.39" |
| SCAFFOLDING — USE WHAT YOU NEED | 31 | (not a pill — inline header inside text box) |

**Pill height is locked at 0.32".** Single-line only — pill labels never wrap. If a custom label would exceed the slide width even at 0.32" tall, the schema rejects it as a label and requires a shorter alternative.

**Builder enforcement.** The `drawPill(slide, text, position, P)` helper computes the pill width from the text length using the formula above. No call site may pass a `w` parameter manually. The validator checks all `drawPill` invocations for hardcoded `w` arguments and fails the build.

---

### 1.16 Portal Companion File Output

When a deck contains one or more YOU DO slides (§2.6), the builder produces **two output files**, not one:

1. The PPTX file (the lesson deck)
2. A markdown companion file with suffix `-portal.md`, at the same path

The companion file contains all YOU DO slides' Challenge Continuum data formatted for upload to the school portal. The author writes continuum content once in the deck data; the builder delivers it to both lesson and portal.

**Format of the companion file:**

```markdown
# Portal Continuum Tasks — {lesson title or deck filename}

## {Task 1 name}
**Time:** {N} minutes

### Access
{continuumLevels[0]}

### Core
{continuumLevels[1]}

### Stretch
{continuumLevels[2]}

### Challenge
{continuumLevels[3]}

### Mastery
{continuumLevels[4]}

---

## {Task 2 name}
... (if the lesson contains multiple YOU DO slides)
```

**Why this matters.** Without the companion file, the continuum content has to be retyped or copy-pasted from speaker notes into the portal — slow, error-prone, and risks the deck and portal drifting out of sync. With it, the deck remains the single source of truth for continuum content; the portal is downstream.

**Builder enforcement.** A deck with at least one YOU DO slide must produce the companion file. If file write fails, the build fails — the PPTX is not saved either. Atomic output: both files succeed or neither.

A deck with zero YOU DO slides does not produce a companion file.

---

### 1.17 Build-Time Validation Checklist

Before a deck renders, the builder runs:

1. `validatePaletteComplete(P)` — all required palette fields present (§1.10)
2. `validatePaletteContrast(P)` — AAA contrast on all colour pairs (§1.3)
3. `validateGeometry()` — every shape inside content area (§1.4)
4. `validateContent()` — every text field within maxChars, auto-split where applicable (§1.2)
5. `validateChunking()` — one idea per slide (§1.5)
6. `validateFrameworks()` — framework visibility audit (§1.7)
7. `validateNotes()` — speaker notes present where required (§1.8)
8. `validateFontFloor()` — no font size below floor in projected text (§1.1)
9. `validateNoInlineColour()` — no hex literals outside palette file (§1.10)
10. `validateListsSingleTextbox()` — list items render as single bulleted text box (§1.11)
11. `validateLessonCoverage()` — every KK on LIS is taught by at least one I DO slide (§1.12)
12. `validatePillWidths()` — pill widths computed from label text, no hardcoded `w` args to `drawPill` (§1.14)
13. `validatePortalCompanion()` — if any YOU DO slides exist, companion file writes successfully (§1.16)

Any failure produces a specific, actionable error with slide number and field name. No silent overflow, no silent contrast failure, no silent geometry violation. The principle: **the build either produces a correct deck or refuses to produce one at all.**

---

## §2. Slide Type Specifications

Each slide type is specified as a complete contract: purpose, fields, geometry, typography, validation rules, and speaker-notes requirements. The builder reads these specs directly — no field, dimension, or colour is implicit.

---

### §2.0 Lesson Meta Fields

Every lesson spec carries a top-level `meta` object. These fields don't render on slides — they configure the build (which palette to use, what filename to produce) and document the lesson's position in the curriculum.

**Required fields** (validator-enforced; spec refuses to build if any are missing):

| Field | Type | Purpose | Example |
|---|---|---|---|
| `yearCode` | string | Year level as a short code, used in filename | `"12"`, `"11"`, `"9"` |
| `palette` | string | Subject identifier; resolves to `palettes/<name>.json` and appears in filename | `"HHD"`, `"PE"`, `"Geo"` |
| `unitCode` | string | Unit and AOS short code, used in filename | `"U4_AOS1"`, `"U3_AOS2"` |
| `lessonNumber` | integer (≥ 0) | Lesson position within the AOS sequence (1-indexed; 0 reserved for test/placeholder) | `1`, `5`, `12` |
| `topic` | string | Lesson topic; renders on the Title slide and forms the filename slug | `"Economic Characteristics of Income Groups"` |

**Optional fields** (for documentation; not validator-enforced):

| Field | Type | Purpose |
|---|---|---|
| `subject` | string | Full subject name (renders on Title slide alongside `unit`) |
| `yearLevel` | string | Full year level text (e.g. `"Year 12"`, renders on Title slide) |
| `unit` | string | Full unit description (renders on Title slide) |
| `outcome` | string | VCAA outcome reference, for author notes |
| `studyDesign` | string | Study design reference, for author notes |

**Filename convention** — the builder derives the output filename from the required fields:

```
<yearCode>_<palette>_<unitCode>_L<NN>_<topic_in_Title_Case>.pptx
```

Where:
- `<NN>` is `lessonNumber` zero-padded to 2 digits
- `<topic_in_Title_Case>` is `topic` with hyphens normalised to word breaks, punctuation stripped, words Title-Cased, joined by underscores

Example: `topic: "Economic Characteristics of Low-, Middle- and High-Income Countries"`, `yearCode: "12"`, `palette: "HHD"`, `unitCode: "U4_AOS1"`, `lessonNumber: 1` →

`12_HHD_U4_AOS1_L01_Economic_Characteristics_Of_Low_Middle_And_High_Income_Countries.pptx`

The portal companion file (where the lesson contains YOU DO slides) uses the same base name with `-portal.md` appended.

**Why required not optional.** The filename is how teachers identify decks in their filesystem. Missing meta fields silently degrade filenames to placeholders like `XX_GEN_U0_AOS0_L00_...`, which is exactly the silent failure the validator exists to prevent. Authoring discipline — every lesson knows where it sits in the curriculum — is a small ask and a real benefit downstream.

---

### §2.1 Title Slide

**Purpose.** Orient the student to what this lesson is. One job, one slide, no decoration. The title slide is visually distinct from all content slides (white background vs tinted) to mark a clear "lesson start" beat.

**Position in deck.** Always slide 1 if no DO NOW precedes it, or slide 2 after the DO NOW. The current core file has DO NOW as slide 1 — that ordering is retained.

#### Fields

| Field | Required | Source | maxChars |
|---|---|---|---|
| `topic` | yes | author | 60 |
| `subject` | yes | subject overlay | 20 |
| `yearLevel` | yes | author | 10 (e.g. "Year 11", "VCE U4") |
| `unit` | yes | author | 40 (e.g. "Unit 4 AOS 1 — Global Population") |

No other fields. No subtitle, no preview, no hook line, no date, no school name, no lesson number, no KK/KS.

#### Geometry

```
Background:          solid white (FFFFFF)
Accent strip:        x=0, y=0, w=0.40", h=7.500"
                     fill: P.accent (subject overlay)
                     no line
Topic block:         x=0.80", y=2.60", w=11.93", h=2.20"
                     vertical-align: middle
                     horizontal-align: left
Metadata block:      x=0.80", y=5.10", w=11.93", h=0.40"
                     vertical-align: top
                     horizontal-align: left
```

The accent strip is the only colour on the slide. Everything else is white background with dark text.

#### Typography

| Element | Size | Weight | Colour | Notes |
|---|---|---|---|---|
| Topic | 52pt | bold | 1C1C1A (near-black) | Two-line ceiling enforced |
| Metadata line | 16pt | regular | 1C1C1A | Single line, format: `{subject} · {yearLevel} · {unit}` |

The middle dot separator (`·`, U+00B7) is part of the spec. No commas, no hyphens, no pipes.

#### Validation rules (additional to §1)

- **Topic must fit two lines maximum.** Builder pre-computes line count at 52pt over 11.93" width. If `topic` would wrap to a third line → hard fail with message: `"Title slide topic too long: requires N lines, max 2. Shorten to ≤60 chars."`
- **Metadata single line.** Builder computes width of `{subject} · {yearLevel} · {unit}` at 16pt. If it would wrap → hard fail with: `"Title slide metadata exceeds one line. Shorten unit name (currently N chars, max 40)."`
- **Accent strip colour must be defined in subject overlay.** If `P.accent` is missing → hard fail.
- **Background is locked white.** Subject overlays cannot override it. (This is unusual — every other slide type uses the subject's `bgLight`. The title slide is the exception.)

#### Speaker notes

**Optional** for title slide only. If present, recommended content: lesson sequence position ("Lesson 3 of 8"), prior-lesson recap one-liner, teacher's framing intent for this lesson. None of this projects.

#### Why this design

- **White background** gives the topic 21:1 contrast, well above AAA, and visually marks the lesson start as distinct from content slides.
- **Single accent strip** is the only subject-identity marker — sufficient for a senior leader walking past to identify the subject, without dominating the slide.
- **No KK/KS preview** — slide 3 is the dedicated Learning Intentions slide. Duplicating it on slide 2 violates §1.5 (one idea per slide) and forces the topic text smaller.
- **No lesson number** — sequence position is unit-plan territory, not slide territory. Students don't need it; teachers reference the unit plan separately.
- **Metadata at 16pt not 13pt** — the existing system used 13pt for this line. Floor (§1.1) lifts it to 16pt. The unit field's 40-char ceiling exists so the metadata line still fits.

#### Builder function signature

```javascript
function titleSlide(pres, slide, { topic, subject, yearLevel, unit }, P) {
  // Validate
  assertField(topic, 60, "title.topic");
  assertField(unit,  40, "title.unit");
  assertWhitelistedAccent(P);

  // Background — locked white, ignore P.bgLight
  slide.background = { color: "FFFFFF" };

  // Accent strip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.40, h: D.slideH,
    fill: { color: P.accent }, line: { color: P.accent }
  });

  // Topic
  slide.addText(topic, {
    x: 0.80, y: 2.60, w: 11.93, h: 2.20,
    fontSize: 52, bold: true, color: "1C1C1A",
    fontFace: "Calibri", valign: "middle", align: "left", margin: 0
  });

  // Metadata
  slide.addText(`${subject} · ${yearLevel} · ${unit}`, {
    x: 0.80, y: 5.10, w: 11.93, h: 0.40,
    fontSize: D.fzMeta, color: "1C1C1A",
    fontFace: "Calibri", valign: "top", align: "left", margin: 0
  });

  // Speaker notes — optional, no enforcement
  if (notes) slide.addNotes(notes);
}
```

`D.fzMeta` is a new constant: `16`. Add to the `D` object.

---

### §2.2 DO NOW Slide

**Purpose.** Bridge from corridor to lesson. Students arrive, sit down, and are immediately doing something — activating prior knowledge, committing to a prediction, taking a position, or being provoked into curiosity. Five-minute task. Silent and independent (or paired for `discussion` variant). Teacher does not talk through it.

**Position in deck.** Slide 1 (precedes the title slide).

**Pedagogical alignment.** Maps to e5 *Engage* phase. HITS: *Setting Goals, Multiple Exposures* (retrieval practice variants). 5Ps: *Participation* (every variant requires a student action within seconds of entry).

#### Variants — author picks one per slide

Each variant has its own field structure and layout. All variants share the same chassis: header bar with `"| DO NOW — complete on entry, individually and silently (5 min)"` (or `"in pairs"` for `discussion`), white-on-subject-palette `doNow` colour, content area below.

**Author's relevance test (not enforced by schema):** every DO NOW must connect to the lesson's content or prior knowledge of it. The schema validates *structure*; content relevance is the author's call.

| Variant | When to use | Cognitive job | Engagement profile |
|---|---|---|---|
| `questions` | Reviewing prior lessons (any unit, not just yesterday) | Retrieval practice | Steady — fluency-building |
| `discussion` | Activating opinion or experience related to lesson topic | Social cognition | High — voice/peer interaction |
| `riddle` | Hooking curiosity before reveal of lesson concept | Curiosity gap | High — playful tension |
| `recall` | Mass retrieval of key terms from prior unit | Spaced retrieval | Steady — memory consolidation |
| `would-you-rather` | Forcing a pre-lesson position on a contested concept | Commitment + curiosity | High — physical/visible response |
| `predict` | Pre-testing — guess before lesson teaches answer | Prediction + activation | High — creates curiosity gap |

#### Common fields (all variants)

| Field | Required | Source | maxChars |
|---|---|---|---|
| `variant` | yes | author | enum: questions / discussion / riddle / recall / would-you-rather / predict |
| `headerSuffix` | no | builder | auto-set per variant (e.g. "in pairs" for discussion) |

#### Variant-specific fields

**`questions`** — 3–5 numbered questions
```
items: string[]   // 3–5 items, each maxChars: 130
```

**`discussion`** — single think-pair-share prompt
```
prompt: string    // maxChars: 200
pairTime: number  // optional, default 90 (seconds for "think" phase)
```

**`riddle`** — hook + reveal-prompt
```
riddle: string    // maxChars: 220, the riddle text itself
prompt: string    // maxChars: 80, "What's the connection to today's lesson?" or similar
```

**`recall`** — retrieval grid
```
terms: string[]   // 4–8 terms, each maxChars: 30
instruction: string  // default: "Define each term from memory. No notes."
                     // maxChars: 100, can be overridden by author
```

**`would-you-rather`** — binary choice
```
optionA: string   // maxChars: 110
optionB: string   // maxChars: 110
followUp: string  // maxChars: 140, e.g. "Be ready to justify your choice using prior knowledge"
```

**`predict`** — predict the answer
```
setup: string     // maxChars: 200, context for the prediction
prompt: string    // maxChars: 130, the prediction question itself
```

#### Geometry — all variants

```
Background:          P.bgDoNow (subject overlay — warm/cream tone)
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.doNow
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe
Header text:         "| DO NOW — complete on entry, {modeText} (5 min)"
                     where modeText defaults to "individually and silently"
                     or "in pairs" for discussion variant
```

**Content area** (`contentX=0.20, contentY=0.70, contentW=12.99, contentH=6.66`) is then divided per variant — full layouts below.

#### Per-variant layouts

##### `questions` layout

Single numbered text box containing all questions. Per §1.11 (Editable Text Boxes for Lists), the question list renders as **one PptxGenJS text box with native numbered list formatting**, not as per-question elements.

```
Text box: x=contentX (0.20), y=0.85, w=contentW (12.99), h=6.30
          fontSize: 16, regular, color: P.text
          bullet: { type: 'number' } — numbers render in P.pipe colour
          paraSpaceAfter: 20pt — substantial gap between questions for readability
          valign: 'top'
```

The single text box approach means a teacher editing the deck can add or remove a question with Enter/Backspace — PowerPoint renumbers automatically. The old per-item-text-box pattern (number drawn separately, question drawn separately, both at calculated y-positions) is forbidden by §1.11 and removed from the schema.

##### `discussion` layout

Single large card centred vertically. Card is white with coloured border in `P.doNow` (2pt). Prompt text fills the card at 24pt — deliberately large to give it gravity. Instructional choreography sits below the card, not inside it, at 16pt.

```
Card: x=2.00, y=1.40, w=9.33, h=4.00
      fill: FFFFFF, line: P.doNow 2pt
Prompt text: centred inside card, 24pt regular, 1C1C1A
Choreography line: x=contentX, y=5.70, w=contentW, h=0.60
      "Think individually (90s) → share with partner → ready to share with class"
      16pt regular, P.pipe colour, centred
```

##### `riddle` layout

Two stacked elements. Riddle text in a card; reveal-prompt sits below the card without a card around it.

```
Riddle card: x=1.50, y=1.20, w=10.33, h=3.80
      fill: FFFFFF, line: P.doNow 2pt
      Riddle text: centred, 22pt regular, 1C1C1A
Prompt text: x=1.50, y=5.40, w=10.33, h=1.20
      18pt bold italic, P.pipe colour, centred
```

##### `recall` layout

Grid of term cards. Each term in a small tinted card. Grid columns = `ceil(sqrt(N))` to keep it roughly square; rows adjust to fit. Instruction sits above the grid.

```
Instruction: x=contentX, y=0.85, w=contentW, h=0.40
      16pt regular, 1C1C1A
Grid: starts y=1.45, ends y=contentY+contentH
      cards: P.bgLight fill, P.doNow border 1pt, radius implied (PptxGenJS default)
      term text: centred in card, 18pt bold, 1C1C1A
```

##### `would-you-rather` layout

Two side-by-side option cards with "OR" divider. Equal weight — neither option visually favoured.

```
Option A card: x=0.60, y=1.40, w=5.80, h=4.20
      fill: FFFFFF, line: P.doNow 2pt
      Letter "A": top-left of card, 36pt bold, P.pipe
      Option text: below A, 18pt regular, 1C1C1A
"OR" divider: x=6.40, y=3.30, w=0.53, h=0.40
      18pt bold, P.pipe, centred
Option B card: x=6.93, y=1.40, w=5.80, h=4.20
      mirror of A
Follow-up text: x=contentX, y=5.85, w=contentW, h=0.60
      16pt regular, 1C1C1A, centred
```

##### `predict` layout

Setup paragraph above, prediction prompt below in larger type.

```
Setup: x=contentX, y=1.10, w=contentW, h=2.20
      18pt regular, 1C1C1A, vertically centred
Prediction prompt card: x=1.50, y=3.80, w=10.33, h=2.80
      fill: P.bgLight, line: P.doNow 2pt
      Text: centred, 26pt bold, 1C1C1A
```

#### Typography (all variants — bound to §1.1 floor)

All projected text ≥ 16pt. Where larger sizes appear above (18, 20, 22, 24, 26, 28, 36) they are *deliberate* hierarchy choices for engagement weight, not arbitrary. No exceptions — anything that would need to be smaller belongs in speaker notes.

#### Validation rules (additional to §1)

- **Variant enum:** `variant` must be one of the six listed strings. Else hard fail.
- **`questions` count:** length(items) must be 3, 4, or 5. Else hard fail with message specifying allowed range.
- **`recall` count:** length(terms) must be 4–8. Else hard fail.
- **Per-field maxChars:** each field validated against its limit. Auto-split (§1.2) does NOT apply to DO NOW — overflow on any DO NOW field is hard fail. Rationale: DO NOW is read in 5 seconds on entry, splitting it across slides defeats the purpose.
- **Background colour:** `P.bgDoNow` must exist in subject overlay. Else hard fail.
- **Header mode text:** auto-set by builder — author cannot override. (Prevents "in pairs (5 min)" appearing on a `questions` variant.)

#### Speaker notes — mandatory

Per §1.8, DO NOW speaker notes are required. Variant-specific content:

| Variant | Required in speaker notes |
|---|---|
| `questions` | Answer for every question. Sample responses where multiple are valid. |
| `discussion` | 3–5 sample positions students might take; 2–3 follow-up probes; cold-call list (which students to call on, in what order) |
| `riddle` | The answer to the riddle + the link to today's lesson content (explicit) |
| `recall` | Definition for every term. Note which terms students "should know cold" vs which are stretch. |
| `would-you-rather` | Expected positions for each option; the disciplinary "right answer" if there is one; how this connects to today's lesson |
| `predict` | The actual answer (revealed later in lesson) + a teaching note: at what point in the lesson to refer back to predictions |

Empty speaker notes on DO NOW → hard fail.

#### Builder function signature

```javascript
function doNowSlide(pres, slide, data, P) {
  // Validate variant + dispatch
  const { variant } = data;
  assertEnum(variant, ['questions','discussion','riddle','recall','would-you-rather','predict']);
  assertPaletteField(P, 'bgDoNow');
  assertPaletteField(P, 'doNow');
  assertPaletteField(P, 'pipe');
  assertNotes(data.notes, "DO NOW");

  // Chassis (shared)
  slide.background = { color: P.bgDoNow };
  drawHeaderBar(slide, P, headerTextFor(variant), { mode: 'doNow' });
  drawLeftStripe(slide, P);

  // Dispatch to variant layout
  const layouts = {
    'questions':        layoutQuestions,
    'discussion':       layoutDiscussion,
    'riddle':           layoutRiddle,
    'recall':           layoutRecall,
    'would-you-rather': layoutWouldYouRather,
    'predict':          layoutPredict,
  };
  layouts[variant](slide, data, P);

  // Speaker notes
  slide.addNotes(data.notes);
}
```

#### Why this design

- **Six variants, not one** — engagement profiles vary by cognitive job. Forcing a discussion prompt into a numbered-list layout would suppress the very thing that makes it engaging.
- **No images** — kept to author's choice for now (no image-prompt variant). All six variants work with text alone, removing image-sourcing burden.
- **No timer** — header text states the time budget; classroom clock runs the countdown. Reasoning detailed in earlier conversation.
- **Hard fail on overflow** — DO NOW is read in 5 seconds. Splitting it defeats the bridge-from-corridor purpose.
- **Mandatory speaker notes** — every DO NOW carries answers and follow-up probes. Teacher walks into the lesson with everything needed to run the variant well.
- **Variety over time** — six variants × a school year means students experience pedagogical range. The schema enables this without enforcing it. The teacher's professional judgement remains primary.

---

### §2.3 Learning Intentions & Success Criteria

**Purpose.** Tell students what they're learning and how they'll know they've learned it. This is the slide that makes the lesson's intent transparent. Senior leader scanning the deck sees this and knows the lesson has explicit goals.

**Position in deck.** Slide 3 (after DO NOW and Title).

**Pedagogical alignment.** Maps to e5 *Explore* phase setup. HITS: *Setting Goals* (this is HITS strategy #1, directly). 5Ps: *Purpose* (the entire slide is purpose articulation).

#### Fields

| Field | Required | Source | maxChars per item |
|---|---|---|---|
| `keyKnowledge` | yes | VCAA / textbook verbatim | 110 per item |
| `keySkills` | yes | VCAA / textbook verbatim | 110 per item |

**Item counts:**
- 1–5 items per category triggers single-slide layout
- 6+ items in either category triggers auto-split (continuation slide)
- 11+ items in either category hard-fails (one slide of overflow is acceptable; two suggests the lesson isn't chunked properly)

**Source-of-truth rule:** Key Knowledge and Key Skills must be taken verbatim from the VCAA study design or the school textbook's chapter section overview. No paraphrasing. No "student-friendly" rewrites. Students need to see the actual disciplinary language because that's what they'll be assessed against.

The builder cannot enforce verbatim sourcing (no way to validate against external documents), but the schema documents the rule so colleagues using the system know the standard.

#### Geometry

```
Background:          P.bgLight
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.iDo  (Learning Intentions uses I DO header colour
                                   because it's the "I'm telling you what we're learning" beat)
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Header text:         "| LEARNING INTENTIONS & SUCCESS CRITERIA"
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe

Two side-by-side cards (corrected to fit inside the right margin):
  Slide width:        13.333"
  Left margin:        0.20" (matches contentX)
  Right margin:       0.14"
  Card gap:           0.30"
  Total card width:   (13.333 - 0.20 - 0.14 - 0.30) / 2 = 6.347"

KK card:             x=0.20, y=contentY (0.70), w=6.347, h=dynamic
                     fill: P.cardKK
                     line: 1pt P.pipe at 30% opacity (soft border)
KS card:             x=0.20 + 6.347 + 0.30 = 6.847, y=0.70, w=6.347, h=dynamic
                     KS right edge: 6.847 + 6.347 = 13.194  ✓ inside 13.333 - 0.14 = 13.193
                     fill: P.cardKS
                     line: 1pt P.pipe at 30% opacity

Pill labels (top-left of each card, widths from §1.14):
  KK pill: x=cardX + 0.10, y=contentY + 0.10, w=pillWidth("KEY KNOWLEDGE")=1.22, h=0.32
           fill: P.pipe, text "KEY KNOWLEDGE" 12pt bold white
  KS pill: x=cardX + 0.10, y=contentY + 0.10, w=pillWidth("KEY SKILLS")=0.99, h=0.32
           fill: P.pipe, text "KEY SKILLS" 12pt bold white

Card body text starts: y = contentY + 0.10 + 0.32 + 0.18 = contentY + 0.60
```

#### Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| Header bar text | 16pt | medium | P.textInverse (white) |
| Pill labels ("KEY KNOWLEDGE" / "KEY SKILLS") | 12pt | bold | P.textInverse — labelled exception per §1.1 |
| KK/KS list items | 16pt | regular | P.text |
| Item bullet marker | 16pt | bold | P.pipe |

**Implementation — single bulleted text box per card.** Items render as a native PowerPoint bulleted list inside one text box per card, not as individually positioned text elements. This means:

- A teacher editing the deck in PowerPoint clicks once into the text box and edits items naturally (Enter for new line creates a new bullet automatically)
- Text reflows correctly when items are added or edited
- Bullet character is set to filled square `■` (Unicode 25A0) in `P.pipe` colour via PptxGenJS bullet config:
  ```javascript
  bullet: { code: '25A0', color: P.pipe }
  ```
- Line spacing handled by PowerPoint's native paragraph spacing rules (set to 1.15 line height + 8pt after-paragraph spacing via `paraSpaceAfter: 8`)

**Text box geometry per card:**
```
textbox: x = cardX + 0.18, y = contentY + 0.10 + 0.32 + 0.18 = contentY + 0.60
         w = cardW - 0.36
         h = cardH - 0.78  (card height minus pill area minus bottom padding)
```

The text box fills the card below the pill label with even padding on all sides. The `cardH` is dynamic per §1.6 — calculated from the number of items and their character lengths.

#### Auto-split behaviour

When `keyKnowledge` or `keySkills` exceeds 5 items, builder generates a continuation slide:

- Header bar reads `"| LEARNING INTENTIONS & SUCCESS CRITERIA (cont.)"`
- Cards retain the same labels and structure
- Items 6+ flow into the continuation card
- The **non-overflowing category** remains visible on slide 1 only — the continuation slide shows only the overflowing category's continuation, with the other card replaced by a small reference text: `"Key Skills shown on previous slide"` (or vice versa)

If both categories overflow, both continue onto the continuation slide.

#### Validation rules (additional to §1)

- **Both categories required:** missing `keyKnowledge` or `keySkills` → hard fail.
- **Item count floor:** at least 1 item in each category → hard fail if either is empty.
- **Item maxChars:** 110 per item. Auto-truncation does not apply — verbatim sourcing rule means truncating would falsify the VCAA text. Items >110 chars → hard fail with message: `"KK/KS item {N} is {X} chars — exceeds 110. Verbatim VCAA text should fit; if it doesn't, check you have the right study-design wording. Do not paraphrase."`
- **No more than 10 items per category total** (across slide 1 + continuation). 11+ → hard fail.

#### Speaker notes — required

Per §1.8, notes mandatory for this slide. Required content:

- **Plain-English translation** of each KK/KS item — what does this actually mean in classroom language? The verbatim VCAA text projects to students; the plain-English version is for the teacher to explain.
- **Which items this lesson covers vs which are unit-level** — not every lesson covers every KK/KS, but the slide shows the whole set for context. Notes flag which 1–3 items today's lesson actively addresses.
- **Expected misconceptions** — common student confusions about the terminology.

Empty notes → hard fail.

#### Why this design

- **Side-by-side cards** save vertical space and let students see both KK and KS simultaneously — important because the connection between knowledge and skill is the actual point.
- **I DO header colour** because this slide is the teacher articulating purpose — same speech act as the I DO sequence.
- **Pill labels in pipe colour, not card colour** — the pipe is the highest-contrast palette element, makes the labels unambiguous and matches the §1.1 pill exception spec.
- **Verbatim VCAA text** because the assessment regime uses that exact language. Students who learn the VCAA wording outperform students who learn paraphrased versions on exam command-term tasks.
- **Auto-split rather than cramming** — better to spread KK/KS across two slides than shrink the text below the 16pt floor.

#### Builder function signature

```javascript
function lisCriteriaSlide(pres, slide, data, P) {
  const { keyKnowledge, keySkills, notes } = data;

  // Validate
  assertArrayMinMax(keyKnowledge, 1, 10, "keyKnowledge");
  assertArrayMinMax(keySkills, 1, 10, "keySkills");
  keyKnowledge.forEach((item, i) => assertField(item, 110, `keyKnowledge[${i}]`));
  keySkills.forEach((item, i) => assertField(item, 110, `keySkills[${i}]`));
  assertNotes(notes, "Learning Intentions");

  // Chassis
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, "| LEARNING INTENTIONS & SUCCESS CRITERIA", { mode: 'iDo' });
  drawLeftStripe(slide, P);

  // Split if needed
  const kkPrimary = keyKnowledge.slice(0, 5);
  const ksPrimary = keySkills.slice(0, 5);
  const kkOverflow = keyKnowledge.slice(5);
  const ksOverflow = keySkills.slice(5);

  // Draw primary cards
  drawCategoryCard(slide, 'KEY KNOWLEDGE', kkPrimary, { side: 'left' }, P);
  drawCategoryCard(slide, 'KEY SKILLS',    ksPrimary, { side: 'right' }, P);

  slide.addNotes(notes);

  // Continuation slide if overflow
  if (kkOverflow.length || ksOverflow.length) {
    const contSlide = pres.addSlide();
    drawHeaderBar(contSlide, P, "| LEARNING INTENTIONS & SUCCESS CRITERIA (cont.)", { mode: 'iDo' });
    drawLeftStripe(contSlide, P);
    if (kkOverflow.length) drawCategoryCard(contSlide, 'KEY KNOWLEDGE', kkOverflow, { side: 'left' }, P);
    else drawCategoryReference(contSlide, 'KEY KNOWLEDGE', { side: 'left' }, P);
    if (ksOverflow.length) drawCategoryCard(contSlide, 'KEY SKILLS', ksOverflow, { side: 'right' }, P);
    else drawCategoryReference(contSlide, 'KEY SKILLS', { side: 'right' }, P);
  }
}
```

---

### §2.4 I DO Slide

**Purpose.** The teacher introduces new content — a concept, definition, principle, process, or worked example. This is the workhorse slide of the lesson; most lessons have 2–4 I DO slides. Direct instruction phase: teacher talks, students listen and take notes.

**Position in deck.** After Learning Intentions, before the first WE DO. Multiple I DO slides may sequence consecutively if the teacher is building a chain of related ideas (one idea per slide per §1.5).

**Pedagogical alignment.** Maps to e5 *Explain* phase. HITS: *Explicit Teaching, Worked Examples, Multiple Exposures*. 5Ps: *Pedagogical Practice* (chunking, modelling, scaffolding). 

#### Variants — author picks one per slide

The author chooses a content type, which sets the pill label and signals the cognitive job of the slide:

| Variant | Pill label | Use when | Concept statement guides |
|---|---|---|---|
| `concept` | KEY CONCEPT | Introducing a new disciplinary idea | A claim or statement that names the concept |
| `definition` | DEFINITION | Unpacking a term students must know precisely | The term being defined |
| `principle` | PRINCIPLE | Stating a rule, law, or generalisation | The principle phrased as a statement |
| `process` | PROCESS | Walking through a sequence of steps | What the process is + its purpose |
| `worked-example` | WORKED EXAMPLE | Modelling a problem solution end-to-end | The problem statement |

All five variants use the **same single-card chassis** — only the pill label vocabulary changes. Bullet content style differs by variant (e.g. `process` uses numbered bullets, others use the `■` square).

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `variant` | yes | author | enum: concept / definition / principle / process / worked-example |
| `headerTitle` | yes | author | maxChars: 70 — the lesson concept being taught (header bar text after the pipe) |
| `teaches` | yes | author | array of integers — 1-based indices of KK items from LIS slide that this I DO teaches (per §1.12) |
| `concept` | yes | author | maxChars: 160 — the headline statement at 20pt |
| `bullets` | yes | author | array, 2–5 items, each maxChars: 140 (see structure below) |
| `notes` | yes | author | mandatory per §1.8 |

**Bullet structure** — each bullet is an object with two parts:
```javascript
{ label: "Physical",    // optional, bold pipe-colour category label
  text: "climate, topography, water availability, soil fertility" }
```

If `label` is omitted, the bullet renders without a category prefix. This handles both parallel-structure lists (with labels) and simple lists (without).

**Item count:**
- 2–5 bullets fits cleanly inside the card
- 6+ bullets triggers auto-split (continuation slide with same header + "(cont.)")
- 11+ bullets hard-fails — indicates content not properly chunked

#### Geometry

```
Background:          P.bgLight
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.iDo
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Header text:         "| I DO — {headerTitle}"
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe

Main card:           x=0.80, y=1.00, w=11.73, h=5.90
                     fill: FFFFFF
                     line: none
                     shadow: outer, blur 4, offset 2, angle 135°, opacity 0.08

Pill label:          x=0.98, y=1.18, w=auto (per variant), h=0.32
                     fill: P.pipe
                     text: 12pt bold white (per §1.1 labelled exception)
                     position: top-left inside card

Content text box:    x=0.98, y=1.66, w=11.37, h=4.84
                     single text box containing concept + bullets
                     paragraph-internal hierarchy via size and weight
```

The pill label is a separate shape (it's a coloured rectangle, can't be inside a text box). The concept statement and bullets are all in one text box.

#### Typography (single text box internal hierarchy)

| Paragraph | Size | Weight | Colour | Spacing |
|---|---|---|---|---|
| Concept statement | 20pt | bold | P.text | paraSpaceAfter: 14pt |
| Bullets — category label | 16pt | bold | P.pipe | inline with bullet text |
| Bullets — body text | 16pt | regular | P.text | paraSpaceAfter: 8pt |

Bullet character: `■` Unicode 25A0 in `P.pipe` colour, via `bullet: { code: '25A0', color: P.pipe }`.

**Exception:** `process` variant uses numbered bullets — `bullet: { type: 'number' }`. The numbers render in `P.pipe` colour, bold, by PowerPoint default — no per-bullet styling needed.

#### Per-variant defaults

The variant influences the **bullet style** and **author guidance**, but the chassis is identical:

**`concept`** — bullets are unpacking dimensions of the concept (use `■` square). Author guidance: each bullet should be a *dimension*, *aspect*, or *example* of the concept named in the statement.

**`definition`** — bullets are components of the definition (use `■` square). Author guidance: bullet 1 typically names the genus (the broader category), bullet 2+ name the differentia (what distinguishes this term from others in that category).

**`principle`** — bullets are conditions, applications, or implications of the principle (use `■` square). Author guidance: keep bullets generalisable, not example-specific (examples belong on a separate I DO slide or in WE DO).

**`process`** — bullets are sequential steps (use numbered bullets). Author guidance: each bullet is a verb-led action; the order matters and is enforced by numbering.

**`worked-example`** — bullets are solution steps (use numbered bullets). Author guidance: show the *thinking* not just the answer; bullet 1 typically restates the question, bullets 2+ work through the solution, final bullet states the answer.

#### Validation rules (additional to §1)

- **Variant enum:** must be one of the five listed strings. Else hard fail.
- **`teaches` field:** must be a non-empty array of positive integers. Each integer must correspond to a valid KK index in the deck's LIS slide (per §1.12). If empty or invalid → hard fail.
- **Bullet count:** 2–10 total (with auto-split at 6+). Less than 2 → hard fail (a single-bullet I DO is just a concept statement; rewrite as a no-bullet variant or merge with adjacent slide).
- **Concept maxChars:** 160. Else hard fail (concept that long should be split into a concept slide + a follow-on slide).
- **Bullet maxChars:** 140 per bullet (label + text combined). Else hard fail.
- **No empty labels:** if `label` is provided in any bullet, it must be 1–25 chars and end without punctuation. Builder appends a colon and space automatically.
- **Mixed bullet types in one slide forbidden:** all bullets in a `process` or `worked-example` slide use numbers; all bullets in other variants use squares. The schema does not allow mixing within one slide.

#### Auto-split behaviour

When `bullets` exceeds 5 items, builder generates a continuation slide:

- Header bar: `"| I DO — {headerTitle} (cont.)"`
- Same chassis, same pill label
- Concept statement repeats on continuation (so students re-orienting to the slide see the headline)
- Bullets 6+ flow into the continuation card

#### Speaker notes — required

Required content for every I DO slide:

- **Plain-English elaboration** of the concept statement (what to say while showing the slide)
- **Chunking strategy tag** — one of: Thematic / Cognitive Bookends / Progressive Disclosure / Interleaved Examples / Dual Coding (per §1.7)
- **HITS strategies used** — flag the HITS strategies this slide enacts (e.g. Explicit Teaching, Worked Example, Multiple Exposures)
- **5Ps tag** — which of the 5Ps this slide is enacting (typically Pedagogical Practice)
- **Anticipated misconceptions** — common confusions students have about this content
- **Cold-call points** — moments during the I DO where a teacher might pose a quick question to check attention/understanding before continuing (e.g. "After bullet 2, ask: which of these factors do you think matters most in Australia?")

Empty notes → hard fail.

#### Why this design

- **Single card** matches the LIS visual pattern — deck consistency.
- **Single text box** with internal paragraph hierarchy minimises overflow risk. PowerPoint handles reflow within one box; multiple boxes cannot reflow into each other.
- **Pill label vocabulary forces content-type clarity** — the teacher decides "this is a concept" or "this is a definition" before writing the slide, which improves the pedagogical structure.
- **Bold pipe-colour category labels** inside bullets let students pre-attentively see parallel structure (Physical / Economic / Social / Political) without reading the bodies first.
- **Process and worked-example use numbered bullets** because order matters in those cases — students need to see "step 1 → step 2 → step 3" not "an unordered list of equally-weighted points."
- **Mandatory chunking strategy in notes** makes §1.7 framework visibility automatic for I DO slides.

#### Builder function signature

```javascript
function iDoSlide(pres, slide, data, P) {
  const { variant, headerTitle, concept, bullets, notes } = data;

  // Validate
  assertEnum(variant, ['concept','definition','principle','process','worked-example']);
  assertField(headerTitle, 70, 'iDo.headerTitle');
  assertField(concept, 160, 'iDo.concept');
  assertArrayMinMax(bullets, 2, 10, 'iDo.bullets');
  bullets.forEach((b, i) => {
    if (b.label) assertField(b.label, 25, `iDo.bullets[${i}].label`);
    const combined = (b.label ? b.label.length + 2 : 0) + b.text.length;
    if (combined > 140) hardFail(`iDo.bullets[${i}] combined length ${combined} > 140`);
  });
  assertNotes(notes, "I DO");

  // Chassis
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, `| I DO — ${headerTitle}`, { mode: 'iDo' });
  drawLeftStripe(slide, P);

  // Main card
  drawCard(slide, { x: 0.80, y: 1.00, w: 11.73, h: 5.90 }, P);

  // Pill label
  const pillText = PILL_VOCAB[variant];  // 'KEY CONCEPT', 'DEFINITION', etc.
  drawPill(slide, pillText, { x: 0.98, y: 1.18 }, P);

  // Content text box — single addText with array
  const useNumbered = (variant === 'process' || variant === 'worked-example');
  const content = [
    { text: concept, options: { fontSize: 20, bold: true, paraSpaceAfter: 14 } },
    ...bullets.flatMap(b => buildBulletRuns(b, P, useNumbered))
  ];
  slide.addText(content, {
    x: 0.98, y: 1.66, w: 11.37, h: 4.84,
    fontFace: 'Calibri', color: P.text,
    bullet: useNumbered ? { type: 'number' } : { code: '25A0', color: P.pipe },
    paraSpaceAfter: 8,
    valign: 'top'
  });

  slide.addNotes(notes);

  // Auto-split if overflow
  if (bullets.length > 5) {
    // ... create continuation slide with same chassis, bullets[5..]
  }
}
```

---

### §2.5 LEARNING ACTIVITY Slide

**Purpose.** First independent practice block — the slide where students apply what they've just been taught. The Gradual Release "we do" moment happens *within* the I DO sequence (teacher questioning, partial worked examples, cold-calls during direct instruction); this slide is the first opportunity for students to do the cognitive work themselves.

**Position in deck.** After the I DO sequence ends, before the next I DO sequence (if the lesson has multiple I DO → LEARNING ACTIVITY cycles) or before the Exit Card / Summary slides.

**Pedagogical alignment.** Maps to e5 *Elaborate* phase. HITS: *Multiple Exposures, Questioning, Differentiated Teaching* (via scaffolding). 5Ps: *Participation* (every student doing cognitive work), *Pedagogical Practice* (scaffolded mastery).

#### Core design principle — scaffolded mastery

The task is pitched at the **Mastery level** of the Challenge Continuum. The scaffolding makes that mastery-level task accessible to all students. Higher-ability students may ignore the scaffolding; lower-ability students use it as footholds. Everyone reaches the same destination.

This is a significantly more elegant differentiation strategy than "three different tasks for three ability levels." There is one task. Scaffolding is universally available, students self-select usage.

**Implication:** Scaffolding is information-carrying, not decoration. It must have real visual weight on the slide — it is the bridge to mastery for many students, not a small footnote.

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `headerTitle` | yes | author | maxChars: 60 — short descriptor of what students are doing |
| `timeMinutes` | yes | author | integer 5–30 — appears in header text |
| `task` | yes | author | maxChars: 240 — the task statement, pitched at mastery |
| `scaffolding` | yes | author | array, minimum 2 items, maximum 3 (see structure below) |
| `stimulusReference` | no | author | maxChars: 120 — pointer to textbook page, handout, or external source if task requires one |
| `notes` | yes | author | mandatory per §1.8 |

**Scaffolding structure** — each scaffold is an object with a type and content:
```javascript
{ type: "sentence-starter" | "key-terms" | "structure-hint" | "worked-fragment" | "checklist",
  content: "..." }   // maxChars: 140 per scaffold
```

The five scaffold types cover the full range of universally-useful supports:

| Type | Pill text | Purpose | Example |
|---|---|---|---|
| `sentence-starter` | START WITH | Give the opening words of a written response | "One factor that influences population distribution is..." |
| `key-terms` | USE THESE TERMS | List vocabulary the response should include | "natural increase, push factors, pull factors, dependency ratio" |
| `structure-hint` | STRUCTURE | Tell students the response shape | "Statement → evidence → explanation → link to question" |
| `worked-fragment` | WORKED START | Show the first step of the working | "Q = HR × SV, so Q = 72 × 70 = ..." |
| `checklist` | CHECK YOU HAVE | Success criteria as a checklist | "✓ Defined the term ✓ Given an example ✓ Linked to the case study" |

**Scaffold count:**
- 2 scaffolds minimum (forces at least two access points)
- 3 scaffolds maximum (more than 3 starts to do the task *for* students rather than scaffolding it, and risks overflow on slide)

#### Geometry

```
Background:          P.bgLight
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.weDo
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Header text:         "| LEARNING ACTIVITY — {headerTitle} ({timeMinutes} min)"
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe

Main card:           x=0.80, y=1.00, w=11.73, h=5.90
                     fill: FFFFFF
                     line: none
                     shadow: outer, blur 4, offset 2, angle 135°, opacity 0.08

Pill label (TASK):   x=0.98, y=1.18, w=0.85, h=0.32, P.pipe fill, 12pt bold white

Content text box:    x=0.98, y=1.66, w=11.37, h=5.10
                     single text box containing:
                       — task statement (20pt regular)
                       — stimulus reference (16pt italic, only if present)
                       — scaffolding section header (12pt bold uppercase, P.pipe)
                       — bulleted scaffolds (16pt with bold-pipe labels)
```

**Three elements total**: card, pill, text box. No divider lines, no separate scaffolding card, no shadow layers. Visual hierarchy comes from typography and spacing within the single text box.

#### Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| Header bar text | 16pt | medium | P.textInverse |
| Pill label (TASK) | 12pt | bold | P.textInverse (labelled exception per §1.1) |
| Task statement | 20pt | bold | P.text |
| Stimulus reference | 16pt | italic | P.pipe |
| Scaffolding section header ("SCAFFOLDING — USE WHAT YOU NEED") | 16pt | bold uppercase | P.pipe |
| Scaffold type label (e.g. "Worked start:") | 16pt | bold | P.pipe |
| Scaffold content | 16pt | regular | P.text |

**Single text box internal structure** — paragraphs in order:

```
[paragraph 1: task statement, 20pt bold, paraSpaceAfter 14pt]

[paragraph 2: 📖 stimulus reference, 16pt italic P.pipe, paraSpaceAfter 24pt]
   (omitted entirely if no stimulus reference)

[paragraph 3: SCAFFOLDING — USE WHAT YOU NEED, 16pt bold uppercase P.pipe, paraSpaceAfter 12pt]

[paragraphs 4–6: bulleted scaffolds, 16pt with bold pipe-colour inline labels]
```

Bullet character for scaffolds: `■` Unicode 25A0 in `P.pipe` colour, via `bullet: { code: '25A0', color: P.pipe }`.

The 24pt paragraph gap after the stimulus reference (or after the task statement, if no stimulus) is what separates the task region from the scaffolding region. **No divider line, no second card** — the spacing and the uppercase section header do the separating work. Per §1.9, decorative shapes that don't carry information are prohibited; a divider line here would be redundant with the section header.

#### Validation rules (additional to §1)

- **Required fields:** missing `task`, `scaffolding`, `timeMinutes`, or `headerTitle` → hard fail.
- **Scaffold count:** 2–3 items. Less than 2 → hard fail with message: `"LEARNING ACTIVITY requires minimum 2 scaffolds — scaffolded mastery requires multiple access points."` More than 3 → hard fail with message: `"LEARNING ACTIVITY allows maximum 3 scaffolds. If you need more support, the task itself is pitched too high; reconsider the task or move scaffolding to the portal."`
- **Scaffold type enum:** each scaffold's `type` must be one of the five listed strings. Else hard fail.
- **No duplicate scaffold types:** an author cannot use two `sentence-starter` scaffolds on the same slide (forces variety in scaffolding type).
- **Time range:** `timeMinutes` must be 5–30. Less than 5 = too short to be a real practice block; more than 30 = should be split into two slides or moved to homework.
- **Task maxChars:** 240. Overflow → hard fail with message: `"Task statement exceeds 240 chars. A mastery-pitched task should be statable concisely; if it isn't, the task is doing too much."`

#### Speaker notes — required

Required content:

- **Mastery-level success criteria** — what a top-band response looks like (this is what students aim for; not shown on slide because the task already implies it)
- **Common scaffolding-use patterns observed** — e.g. "expect lower-ability students to lean on START WITH; higher-ability students often skip scaffolding and produce the structure intuitively"
- **Likely misconceptions** — what wrong answers to expect, and what they indicate
- **Cold-call plan** — which students to call on for which scaffolds, in what order, to make the scaffolding visible to the class without singling anyone out
- **Stretch prompt** — what to give to early finishers ("Extend: which of the four factors is most determinative in your case study country?")
- **Time-check signal** — at what minute to do a time-check ("3 minutes left — finish your current sentence")

Empty notes → hard fail.

#### Why this design

- **Single variant** because all the forms a teacher uses (practice questions, writing, applying methods, think-pair-share) share the same structure: task + scaffolding. Form variation lives in the *content* of the task, not the slide structure.
- **No image annotation, no embedded case study** — author adds annotation images manually after build; case studies live in the textbook with a `stimulusReference` pointer. This keeps the slide clean and the schema simple.
- **Task pitched at mastery + scaffolding for access** matches the Challenge Continuum: one task, multiple ways in. This is structurally superior to "differentiated tasks per ability level" because it preserves common destination.
- **Single card, single text box** — minimises overflow risk and edit fragility. Hierarchy comes from typography (size, weight, colour) and spacing (paragraph gaps), not from separate shapes. Per §1.9, decorative elements that don't carry information are prohibited; a separator line between task and scaffolding would be redundant with the section header.
- **Maximum 3 scaffolds** forces restraint. If a task needs more than 3 access points, the task itself is pitched too high or too broad — that's an authoring signal, not a layout problem.
- **Mandatory 2-scaffold minimum** forces the pedagogy. A colleague using the schema cannot accidentally omit scaffolding — the system insists on it.
- **Header colour `P.weDo`** retains the existing palette role even though the slide is renamed. The colour identity for "first practice block" persists from the prior system; the *label* changes to reflect what's actually happening.

#### Builder function signature

```javascript
function learningActivitySlide(pres, slide, data, P) {
  const { headerTitle, timeMinutes, task, scaffolding, stimulusReference, notes } = data;

  // Validate
  assertField(headerTitle, 60, 'learningActivity.headerTitle');
  assertIntRange(timeMinutes, 5, 30, 'learningActivity.timeMinutes');
  assertField(task, 240, 'learningActivity.task');
  assertArrayMinMax(scaffolding, 2, 3, 'learningActivity.scaffolding');
  assertNoDuplicateScaffoldTypes(scaffolding);
  scaffolding.forEach((s, i) => {
    assertEnum(s.type, ['sentence-starter','key-terms','structure-hint','worked-fragment','checklist']);
    assertField(s.content, 140, `learningActivity.scaffolding[${i}].content`);
  });
  if (stimulusReference) assertField(stimulusReference, 120, 'learningActivity.stimulusReference');
  assertNotes(notes, "LEARNING ACTIVITY");

  // Chassis
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, `| LEARNING ACTIVITY — ${headerTitle} (${timeMinutes} min)`, { mode: 'weDo' });
  drawLeftStripe(slide, P);

  // Single card
  drawCard(slide, { x: 0.80, y: 1.00, w: 11.73, h: 5.90 }, P);
  drawPill(slide, 'TASK', { x: 0.98, y: 1.18 }, P);

  // Build single text box content — task + (optional stimulus ref) + scaffolds
  const content = [
    { text: task, options: { fontSize: 20, bold: true, paraSpaceAfter: stimulusReference ? 14 : 24 } }
  ];

  if (stimulusReference) {
    content.push({
      text: `📖 ${stimulusReference}`,
      options: { fontSize: 16, italic: true, color: P.pipe, paraSpaceAfter: 24 }
    });
  }

  content.push({
    text: 'SCAFFOLDING — USE WHAT YOU NEED',
    options: { fontSize: 16, bold: true, color: P.pipe, paraSpaceAfter: 12 }
  });

  scaffolding.forEach(s => {
    content.push(
      { text: SCAFFOLD_LABELS[s.type] + ': ', options: { fontSize: 16, bold: true, color: P.pipe, bullet: { code: '25A0', color: P.pipe } } },
      { text: s.content, options: { fontSize: 16, color: P.text, paraSpaceAfter: 8 } }
    );
  });

  slide.addText(content, {
    x: 0.98, y: 1.66, w: 11.37, h: 5.10,
    fontFace: 'Calibri', valign: 'top'
  });

  slide.addNotes(notes);
}
```

**Element count: 4 shapes total** — card, pill, header bar, left stripe, plus one text box. No divider lines, no second card, no second pill. The simplest layout that respects the pedagogical hierarchy.

---

### §2.6 YOU DO Slide

**Purpose.** Points students to the Challenge Continuum task on the school portal. The Challenge Continuum is the differentiation engine of APC pedagogy — five levels of task difficulty from Access through Mastery, with students self-selecting their entry point. Those levels are content-rich and would not fit on a projected slide at the 16pt floor. So the slide is a *pointer*; the portal is the *destination*.

**Position in deck.** After LEARNING ACTIVITY, before Exit Card.

**Pedagogical alignment.** Maps to e5 *Elaborate* + *Extend*. HITS: *Differentiated Teaching, Setting Goals* (students choose their challenge level). 5Ps: *Participation* (every student doing differentiated cognitive work).

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `taskName` | yes | author | maxChars: 60 — short descriptor of the continuum task |
| `timeMinutes` | yes | author | integer 10–30 — appears on slide |
| `continuumLevels` | yes | author | array of exactly 5 strings (Acquiring / Consolidating / Refining / Extending / Mastering descriptions (APC Challenge Continuum terms — non-negotiable)) — does NOT render on slide, used for speaker notes and portal companion file (§1.16) |
| `notes` | yes | author | mandatory per §1.8 |

The author writes the 5 continuum levels once. The schema sends them to two destinations: the speaker notes (for teacher reference during lesson) and a separate portal companion markdown file (so the author can copy-paste into the portal without retyping).

#### Geometry

```
Background:          P.bgLight
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.youDo
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Header text:         "| YOU DO — {taskName} ({timeMinutes} min)"
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe

Main card:           x=0.80, y=1.20, w=11.73, h=5.50
                     fill: FFFFFF
                     line: none
                     shadow: outer, blur 4, offset 2, angle 135°, opacity 0.08

Content text box:    x=0.98, y=1.40, w=11.37, h=5.10
                     single text box containing:
                       — "Open the Challenge Continuum task on the portal"
                       — task name (repeated for visibility)
                       — time allocation
                     centred both horizontally and vertically
```

**No pill label.** This slide is minimal by design — a destination pointer, not content. The header bar already states YOU DO and the task name; a pill inside the card would be redundant.

#### Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| Header bar text | 16pt | medium | P.textInverse |
| Main pointer line ("Open the Challenge Continuum...") | 28pt | bold | P.text |
| Task name (in card) | 20pt | regular | P.pipe |
| Time line | 18pt | regular italic | P.text |

Internal text box layout (single text box, three paragraphs):

```
[paragraph 1: "Open the Challenge Continuum task on the portal", 28pt bold,
              paraSpaceAfter 18pt, align centre]

[paragraph 2: "{taskName}", 20pt regular, P.pipe colour,
              paraSpaceAfter 18pt, align centre]

[paragraph 3: "{timeMinutes} minutes", 18pt italic, paraSpaceAfter 0, align centre]
```

All three paragraphs centre vertically inside the card via `valign: 'middle'` on the text box.

#### Validation rules (additional to §1)

- **Required fields:** missing `taskName`, `timeMinutes`, `continuumLevels`, or `notes` → hard fail.
- **`continuumLevels` count:** must be exactly 5 (one per APC Challenge Continuum level: Acquiring, Consolidating, Refining, Extending, Mastering). Less or more → hard fail with: `"YOU DO requires exactly 5 continuum levels (Acquiring, Consolidating, Refining, Extending, Mastering). Provided: {N}."`
- **Per-level maxChars:** 280 per level (continuum descriptions are detailed task statements, more verbose than slide content because they appear on the portal where space is generous).
- **Time range:** 10–30 minutes. Less = too short for differentiated practice; more = should be split across multiple slides or moved to homework.
- **Task name maxChars:** 60.

#### Speaker notes — required

Required content (auto-generated structure, author fills the variables):

```
Continuum task: {taskName}

ACQUIRING:     {continuumLevels[0]}
CONSOLIDATING: {continuumLevels[1]}
REFINING:      {continuumLevels[2]}
EXTENDING:     {continuumLevels[3]}
MASTERING:     {continuumLevels[4]}

Teacher prompts during lesson:
- After 5 min: check no one stuck on level selection
- After half time: prompt early finishers to attempt the next level up
- Final 5 min: students photograph or screenshot their work for evidence

(Author adds any class-specific teaching notes below this template.)
```

Empty notes → hard fail. The 5-level template is auto-inserted by the builder; the author cannot omit it.

#### Portal companion file (§1.16)

When the builder produces the PPTX, it also produces a markdown file at the same path with suffix `-portal.md`. This file contains every YOU DO slide's continuum data formatted for portal upload:

```markdown
# Portal Continuum Tasks — {lesson title} — {date}

## {YOU DO slide 1 task name}
**Time:** {N} minutes

### Access
{continuumLevels[0]}

### Core
{continuumLevels[1]}

### Stretch
{continuumLevels[2]}

### Challenge
{continuumLevels[3]}

### Mastery
{continuumLevels[4]}

---

## {YOU DO slide 2 task name (if multiple YOU DO slides in lesson)}
...
```

This means the author writes the continuum once in the deck data, and the schema delivers it to both the lesson (via speaker notes) and the portal (via the companion file). No copy-paste, no risk of drift between sources.

#### Why this design

- **Pointer slide, not content slide** — five continuum levels at 280 chars each = ~1400 chars total per task. No way to fit that at 16pt floor. The portal is the natural home; the slide gestures at it.
- **No pill label** — minimalism. The header bar already identifies the slide type and task name.
- **Three-paragraph centred layout** — feels like a "go here now" sign. Big bold instruction, task name reminder, time. Read in 5 seconds, then students leave the slide for the portal.
- **Auto-generated speaker notes template** — guarantees every YOU DO has the five-level reference for the teacher, formatted identically across all decks.
- **Portal companion file** — single authoring source for two destinations. Stops the schema's coherence guarantees from collapsing at the portal boundary.

#### Builder function signature

```javascript
function youDoSlide(pres, slide, data, P) {
  const { taskName, timeMinutes, continuumLevels, notes } = data;

  // Validate
  assertField(taskName, 60, 'youDo.taskName');
  assertIntRange(timeMinutes, 10, 30, 'youDo.timeMinutes');
  if (!Array.isArray(continuumLevels) || continuumLevels.length !== 5) {
    hardFail(`YOU DO requires exactly 5 continuum levels. Provided: ${continuumLevels?.length ?? 0}`);
  }
  continuumLevels.forEach((lvl, i) => assertField(lvl, 280, `youDo.continuumLevels[${i}]`));
  assertNotes(notes, "YOU DO");

  // Chassis
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, `| YOU DO — ${taskName} (${timeMinutes} min)`, { mode: 'youDo' });
  drawLeftStripe(slide, P);

  // Main card
  drawCard(slide, { x: 0.80, y: 1.20, w: 11.73, h: 5.50 }, P);

  // Single text box, three centred paragraphs
  const content = [
    { text: "Open the Challenge Continuum task on the portal",
      options: { fontSize: 28, bold: true, paraSpaceAfter: 18, align: 'center' } },
    { text: taskName,
      options: { fontSize: 20, color: P.pipe, paraSpaceAfter: 18, align: 'center' } },
    { text: `${timeMinutes} minutes`,
      options: { fontSize: 18, italic: true, paraSpaceAfter: 0, align: 'center' } }
  ];
  slide.addText(content, {
    x: 0.98, y: 1.40, w: 11.37, h: 5.10,
    fontFace: 'Calibri', color: P.text, valign: 'middle'
  });

  // Auto-generated speaker notes with continuum template + author notes
  const generatedNotes = buildYouDoNotes(taskName, continuumLevels, notes);
  slide.addNotes(generatedNotes);

  // Register this slide's continuum data for the portal companion file
  deck.portalEntries.push({ taskName, timeMinutes, continuumLevels });
}
```

---

### §2.7 EXIT CARD Slide

**Purpose.** End-of-lesson check for understanding. Students answer 1–3 short questions that test whether the lesson's intended learning has actually landed. The teacher reads responses between classes to identify who's struggling and what to reteach.

**Position in deck.** Last slide of the lesson, or second-last if a Summary slide follows. Always after every LEARNING ACTIVITY.

**Pedagogical alignment.** Maps to e5 *Evaluate* phase. HITS: *Questioning, Feedback* (the responses *are* the feedback to the teacher). 5Ps: *Participation* (every student responds, no opt-out).

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `timeMinutes` | yes | author | integer 3–8 — appears in header text |
| `questions` | yes | author | array, 1–3 items, each maxChars: 160 |
| `notes` | yes | author | mandatory per §1.8 |

**No submission-method field.** Submission method lives in classroom routine, not on the slide. A class trained on "Exit Cards are on paper, hand up as you leave" doesn't need a slide reminder; a class doing it for the first time gets a verbal instruction from the teacher.

**No on-slide KK/KS link.** The mapping between Exit Card questions and the lesson's Key Knowledge/Key Skills lives in speaker notes only. The questions themselves should obviously enact the KK/KS — if they don't, the questions are poorly written.

#### Geometry

```
Background:          P.bgLight
Header bar:          x=0, y=0, w=13.333, h=0.56
                     fill: P.exit
Header pipe:         x=0, y=0, w=0.06, h=0.56
                     fill: P.pipe
Header text:         "| EXIT CARD ({timeMinutes} min)"
Left stripe:         x=0, y=0.56, w=0.06, h=6.94
                     fill: P.pipe

Main card:           x=0.80, y=1.00, w=11.73, h=5.90
                     fill: FFFFFF
                     line: none
                     shadow: outer, blur 4, offset 2, angle 135°, opacity 0.08

Pill label (CHECK):  x=0.98, y=1.18, w=0.95, h=0.32, P.pipe fill, 12pt bold white

Content text box:    x=0.98, y=1.66, w=11.37, h=5.10
                     single text box, numbered list of questions
```

**Three elements total**: card, pill, text box. Same chassis as I DO and LEARNING ACTIVITY — deck consistency.

#### Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| Header bar text | 16pt | medium | P.textInverse |
| Pill label (CHECK) | 12pt | bold | P.textInverse (labelled exception per §1.1) |
| Question number | 20pt | bold | P.pipe (rendered by PowerPoint's numbered bullet) |
| Question text | 20pt | regular | P.text |

**Single text box internal structure** — questions rendered as a numbered list via native PowerPoint numbering:

```
1. [Question 1 text, 20pt regular, paraSpaceAfter 18pt]

2. [Question 2 text, 20pt regular, paraSpaceAfter 18pt]

3. [Question 3 text, 20pt regular, paraSpaceAfter 18pt]
```

Bullet config: `bullet: { type: 'number' }`. Numbers render in `P.pipe` colour via PptxGenJS bullet styling.

**Question text at 20pt** — larger than the 16pt floor because Exit Card questions are read once, answered, and submitted. They need to be unmissable. Three 20pt questions with 18pt paragraph gaps comfortably fill the card height (5.10" available, ~1.5" per question at 20pt with spacing).

#### Validation rules (additional to §1)

- **Required fields:** missing `timeMinutes`, `questions`, or `notes` → hard fail.
- **Question count:** 1–3 items. Less than 1 → hard fail (slide has no purpose). More than 3 → hard fail with message: `"Exit Card limited to 3 questions. Teachers cannot realistically read 25 students' responses to 4+ questions between classes."`
- **Question maxChars:** 160 per question. Else hard fail with message: `"Exit Card question {N} too long. Exit Card questions should be answerable in 60–90 seconds; if it doesn't fit in 160 chars, it's too complex for an Exit Card and belongs in a LEARNING ACTIVITY."`
- **Time range:** `timeMinutes` must be 3–8. Less than 3 = students can't answer thoughtfully; more than 8 = it's a LEARNING ACTIVITY, not an Exit Card.

#### Speaker notes — required

Required content:

- **KK/KS mapping** — explicit list of which Key Knowledge and Key Skills items each question is checking. Format: `"Q1 checks KK2; Q2 checks KS1 + KS3."`
- **Expected response patterns** — what a strong response looks like for each question, what a partial response looks like, what a weak response indicates
- **Common misconceptions** — what wrong answers to expect, and what they signal about understanding
- **Reteach triggers** — if X% of the class gets question Y wrong, what to reteach in next lesson
- **Collection method** — submission method as a teacher note (paper, Forms, portal, oral) — not on slide
- **Time-to-mark estimate** — realistic teacher-time estimate for reading 25 responses

Empty notes → hard fail.

#### Why this design

- **Same chassis as I DO and LEARNING ACTIVITY** — consistency across the deck. A student who has read three I DO slides and a LEARNING ACTIVITY immediately recognises the Exit Card as the same visual grammar with a new pill label.
- **No submission method on slide** — classroom routine is the carrier. One less text element, one less thing to maintain across decks.
- **No on-slide KK/KS link** — well-written questions obviously enact the KK/KS. Adding a tag would be belt-and-braces. The teacher needs the mapping for marking; that's in notes.
- **3-question maximum** — pedagogical, not aesthetic. The teacher's marking time is the binding constraint. Exit Cards that take 15 minutes to read aren't done.
- **20pt questions** — larger than the floor because these questions are *the* point of the slide. Hierarchy isn't pill-then-concept-then-bullets like I DO; it's just questions, full focus.
- **Numbered bullets via native PowerPoint** — if a teacher edits the deck to remove question 2, PowerPoint renumbers automatically. Manual "1.", "2.", "3." prefixes would break.

#### Builder function signature

```javascript
function exitCardSlide(pres, slide, data, P) {
  const { timeMinutes, questions, notes } = data;

  // Validate
  assertIntRange(timeMinutes, 3, 8, 'exitCard.timeMinutes');
  assertArrayMinMax(questions, 1, 3, 'exitCard.questions');
  questions.forEach((q, i) => assertField(q, 160, `exitCard.questions[${i}]`));
  assertNotes(notes, "EXIT CARD");

  // Chassis
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, `| EXIT CARD (${timeMinutes} min)`, { mode: 'exit' });
  drawLeftStripe(slide, P);

  // Card + pill
  drawCard(slide, { x: 0.80, y: 1.00, w: 11.73, h: 5.90 }, P);
  drawPill(slide, 'CHECK', { x: 0.98, y: 1.18 }, P);

  // Questions as native numbered list
  const content = questions.map(q => ({
    text: q,
    options: { fontSize: 20, paraSpaceAfter: 18 }
  }));

  slide.addText(content, {
    x: 0.98, y: 1.66, w: 11.37, h: 5.10,
    fontFace: 'Calibri', color: P.text,
    bullet: { type: 'number' },
    valign: 'top'
  });

  slide.addNotes(notes);
}
```

---

### §2.8 SUMMARY Slide

**Purpose.** The lesson's closing beat. Recaps what students should now know — same Key Knowledge items the LIS slide promised, now framed as a declarative claim. Together with the Title slide (which opens the lesson), the Summary slide creates a visible bookend structure: lesson starts white-on-colour-strip, lesson ends white-card-on-colour.

**Position in deck.** Last or second-last slide of the deck (Exit Card may follow if the teacher wants final assessment after the recap, or the Summary may follow Exit Card for a clean closing beat — author's choice).

**Pedagogical alignment.** Maps to e5 *Evaluate* phase closing. HITS: *Multiple Exposures* (each KK item is now seen for the third time — LIS, I DO, Summary), *Setting Goals* (closing the goal loop the LIS opened). 5Ps: *Purpose* (making the lesson's intent visible at the end as well as the start).

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `notes` | yes | author | mandatory per §1.8 |

**That's the entire field list.** All content auto-pulls from the LIS slide's `keyKnowledge` array via the deck-level reference. The author does not re-state the KK items; the builder copies them across.

**Auto-pull mechanism.** The builder looks up the deck's LIS slide, reads its `keyKnowledge` array (the full array, including items that auto-split onto a continuation slide on the LIS itself), and renders each item as a bullet on the Summary slide. The Summary slide does not need to know about LIS auto-splitting — it always pulls the complete KK list.

**KK count constraints.** With up to 10 KK items possible (§2.3 cap), the Summary may need to handle 1–10 bullets. At 6+, the Summary auto-splits onto a continuation slide using the same bookend chassis with `(cont.)` appended to the pill label.

#### Geometry — bookend chassis

```
Background:          P.accent  (full slide background in subject accent colour)
                     This is the inverse of the Title slide:
                     Title slide = white background + accent strip
                     Summary slide = accent background + white card

No header bar.       The accent-colour background is itself the visual signature.
No left stripe.      Same reason.

Main card:           x=0.80, y=0.60, w=11.73, h=6.30
                     fill: FFFFFF
                     line: none
                     radius: 0.10" (slightly larger than content cards)
                     shadow: outer, blur 6, offset 3, angle 135°, opacity 0.12
                     (heavier shadow than content cards — the card feels elevated
                      above the accent background)

Pill label:          x=0.98, y=0.84, w=2.40, h=0.32
                     fill: P.pipe
                     text: "YOU SHOULD NOW KNOW" 12pt bold white

Content text box:    x=0.98, y=1.32, w=11.37, h=5.40
                     single text box, bulleted KK list at 18pt
```

**Element count: 2 shapes + 1 text box.** Card, pill, content. No header bar, no stripe, no decoration. The coloured background does the heavy visual lifting; the white card is the canvas.

#### Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| Pill label ("YOU SHOULD NOW KNOW") | 12pt | bold | P.textInverse (labelled exception per §1.1) |
| KK bullets | 18pt | regular | P.text |
| Bullet character | 18pt | bold | P.pipe |

**KK bullets at 18pt** — slightly larger than the I DO body (16pt) because this is the closing claim, not in-context elaboration. Each bullet states a known thing, declaratively. Slightly larger size matches the declarative weight.

Bullet character: `■` Unicode 25A0 in `P.pipe`, via `bullet: { code: '25A0', color: P.pipe }`. Native PowerPoint bulleting, single text box (per §1.11).

Inter-bullet spacing: `paraSpaceAfter: 10pt` — gives each KK item visual breathing room appropriate to its weight as a closing claim.

#### Validation rules (additional to §1)

- **LIS slide must exist in deck.** If the deck has no LIS slide, the Summary slide cannot build. Hard fail with: `"SUMMARY slide cannot auto-pull KK because the deck has no Learning Intentions slide. Add an LIS slide before the Summary."`
- **KK array must be non-empty.** If the LIS slide has zero KK items (which would already fail LIS validation, but defensively), Summary hard-fails with: `"SUMMARY slide has no content to display — the LIS slide's keyKnowledge array is empty."`
- **Auto-split:** if KK count > 5, builder generates a continuation slide. Same bookend chassis, pill label becomes `"YOU SHOULD NOW KNOW (cont.)"`.
- **Speaker notes required** per §1.8 — even though the slide auto-builds.

#### Speaker notes — required

Required content:

- **Closing script** — one or two sentences the teacher says when this slide goes up. Example: "By next lesson, you should be able to define each of these concepts without notes."
- **Connection to next lesson** — one sentence linking today's KK to tomorrow's learning, if applicable
- **Reteach flags** — which KK items the teacher noted students struggling with during today's lesson (filled in mentally during class, written into notes for next-lesson planning)

Empty notes → hard fail.

#### Why this design

- **Coloured background, white card** — visceral inverse of the Title slide. A senior leader flipping through the deck sees the structure immediately: colour on white at start, white on colour at end. Lesson bookend made visual.
- **No header bar, no stripe** — these are *content slide* signifiers. The Summary is not a content slide; it's a closing claim. Removing them strengthens the bookend distinction.
- **Auto-pull from LIS** — zero re-authoring, structurally enforced coherence (per §1.12, every KK has been taught in the body of the lesson). The closing claim cannot drift from the opening promise.
- **18pt bullets** — slightly larger than I DO body text. The closing claims read with more weight than mid-lesson explanation.
- **"YOU SHOULD NOW KNOW" declarative pill** — owns the claim. Not "today's key knowledge" (descriptive) but "you should now know" (assertive). The pedagogical move is: I taught you, you should now know it. The pill makes that move explicit.
- **Heavier shadow on the card** — separates it visually from the coloured background. The card feels like an object lifted off the surface, which matches "this is what you take with you from this lesson."

#### Builder function signature

```javascript
function summarySlide(pres, slide, deck, P) {
  // Auto-pull KK from LIS slide in the same deck
  const lisSlide = deck.slides.find(s => s.type === 'lis');
  if (!lisSlide) {
    hardFail("SUMMARY slide cannot auto-pull KK because the deck has no Learning Intentions slide.");
  }
  const kk = lisSlide.data.keyKnowledge;
  if (!kk || kk.length === 0) {
    hardFail("SUMMARY slide has no content to display — LIS keyKnowledge is empty.");
  }

  const notes = slide.data.notes;
  assertNotes(notes, "SUMMARY");

  // Bookend chassis — coloured background, white card
  slide.background = { color: P.accent };

  // Main card
  drawCard(slide, {
    x: 0.80, y: 0.60, w: 11.73, h: 6.30,
    radius: 0.10,
    shadow: { type: 'outer', blur: 6, offset: 3, angle: 135, opacity: 0.12 }
  }, P);

  // Pill
  drawPill(slide, 'YOU SHOULD NOW KNOW', { x: 0.98, y: 0.84, w: 2.40 }, P);

  // Auto-split if KK > 5
  const kkPrimary = kk.slice(0, 5);
  const kkOverflow = kk.slice(5);

  // Render bullets
  const content = kkPrimary.map(item => ({
    text: item,
    options: { fontSize: 18, paraSpaceAfter: 10 }
  }));

  slide.addText(content, {
    x: 0.98, y: 1.32, w: 11.37, h: 5.40,
    fontFace: 'Calibri', color: P.text,
    bullet: { code: '25A0', color: P.pipe },
    valign: 'top'
  });

  slide.addNotes(notes);

  // Continuation slide if needed
  if (kkOverflow.length) {
    const contSlide = pres.addSlide();
    contSlide.background = { color: P.accent };
    drawCard(contSlide, { x: 0.80, y: 0.60, w: 11.73, h: 6.30, radius: 0.10,
      shadow: { type: 'outer', blur: 6, offset: 3, angle: 135, opacity: 0.12 }
    }, P);
    drawPill(contSlide, 'YOU SHOULD NOW KNOW (cont.)', { x: 0.98, y: 0.84, w: 3.20 }, P);
    const contContent = kkOverflow.map(item => ({
      text: item,
      options: { fontSize: 18, paraSpaceAfter: 10 }
    }));
    contSlide.addText(contContent, {
      x: 0.98, y: 1.32, w: 11.37, h: 5.40,
      fontFace: 'Calibri', color: P.text,
      bullet: { code: '25A0', color: P.pipe },
      valign: 'top'
    });
  }
}
```

---

---

### §2.9 EXAM TIP Slide

**Purpose.** Surfaces high-value exam technique as visible student-facing content. Exam technique (how to phrase a comparison, the structure of a chain of reasoning, a common error to avoid) is *teaching content students should internalise*, not a teacher aside. Previously this lived in speaker notes; this slide type makes it explicit.

**Universality.** This is a **core** slide type — every VCE/senior subject has exam technique worth teaching. The *structure* is defined here in core; the *content conventions* (HHD chain of reasoning, PE command-term sequencing, Geography case-study specificity) come from the subject overlay.

**Position in deck.** Flexible. Typically after the I DO that introduces the content the tip applies to, or immediately before an EXAM PRACTICE or LEARNING ACTIVITY where students apply it. Optional.

**Pedagogical alignment.** HITS: *Explicit Teaching, Worked Examples*. 5Ps: *Pedagogical Practice*.

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `headerTitle` | yes | author | maxChars: 60 |
| `tip` | yes | author | maxChars: 200 — the technique stated as a clear rule |
| `wrong` | no | author | maxChars: 160 — example of the common error |
| `right` | no | author | maxChars: 160 — the corrected version |
| `why` | no | author | maxChars: 160 — why it matters for marks |
| `notes` | yes | author | mandatory per §1.8 |

`wrong`/`right` is optional but if either is present, both must be (never show an error without its fix).

#### Geometry & Typography

White card on `P.bgLight`, header bar in `P.exit` (exam-domain colour), "EXAM TIP" pill. Single text box: tip statement (20pt bold) → optional ✗ wrong line (16pt, `P.exit`) and ✓ right line (16pt, `P.weDo`) → optional "Why it matters:" line (16pt italic). The ✗/✓ are information-carrying anchors per §1.9; plum/green colour reinforces the contrast.

#### Validation (additional to §1)

- Required: `headerTitle`, `tip`, `notes`.
- `wrong`/`right` pairing enforced — both or neither.
- maxChars: tip 200, wrong/right 160, why 160.

#### Speaker notes — required

Source of the tip (e.g. exam report reference), how often the error appears / marks it costs, optional second example.

#### Builder signature

```javascript
function examTipSlide(pres, P, d) {
  const slide = pres.addSlide();
  slide.background = { color: P.bgLight };
  drawHeaderBar(slide, P, P.exit, `| EXAM TIP — ${d.headerTitle}`);
  drawLeftStripe(slide, P);
  drawCard(slide, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(slide, P, "EXAM TIP", 0.98, 1.18);
  const runs = [{ text: d.tip, options: { fontSize: 20, bold: true, paraSpaceAfter: 18, breakLine: true } }];
  if (d.wrong && d.right) {
    runs.push({ text: `✗  ${d.wrong}`, options: { fontSize: 16, color: P.exit, paraSpaceAfter: 8, breakLine: true } });
    runs.push({ text: `✓  ${d.right}`, options: { fontSize: 16, color: P.weDo, paraSpaceAfter: 18, breakLine: true } });
  }
  if (d.why) runs.push({ text: `Why it matters: ${d.why}`, options: { fontSize: 16, italic: true, breakLine: true } });
  slide.addText(runs, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  slide.addNotes(d.notes);
}
```

---

### §2.10 EXAM PRACTICE Slide Pair

**Purpose.** Real exam practice — students attempt a mastery-level exam question under time, then study a modelled answer at *realistic student standard*. A **two-slide pair**: slide 1 = question + scaffolding + attempt time; slide 2 = modelled answer + mark annotations.

**Universality.** Core slide type. Structure defined here; the subject overlay supplies answer conventions (HHD chain of reasoning, PE command-term structure, Geography case-study specificity).

**Position in deck.** After the content the question draws on, typically before the Exit Card. Optional.

#### CRITICAL authoring rule — model answers at student standard

The modelled answer **must be written at realistic student standard — the length and complexity a strong student could actually produce under exam time pressure.** Not an AI-perfect, exhaustive response. A model students cannot replicate teaches nothing achievable. Stated explicitly because an automated spec-builder defaults to over-polished answers.

**Length guide by marks:** 1–2 marks → 1–2 sentences. 3–4 marks → 3–5 sentences. 5–6 marks → short paragraph. 8–10 marks → 2–3 short paragraphs. Exceeding this is wrong even if correct.

#### Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| `headerTitle` | yes | author | maxChars: 60 |
| `marks` | yes | author | integer |
| `attemptMinutes` | yes | author | integer 3–15 |
| `question` | yes | author | maxChars: 280 |
| `strategy` | yes | author | array 2–3, each maxChars: 120 (overlay-informed) |
| `modelAnswer` | yes | author | maxChars: 700 — student standard (see guide) |
| `markPoints` | yes | author | array 2–6, each maxChars: 100 |
| `commonError` | no | author | maxChars: 160 |
| `notes` | yes | author | mandatory |

#### Geometry & Typography

**Slide 1 (question):** header `P.exit` "| EXAM PRACTICE — {headerTitle} ({marks} marks, {attemptMinutes} min)", "QUESTION" pill, single box: question stem (20pt bold) → "HOW TO APPROACH" sub-header (16pt bold uppercase `P.pipe`) → strategy items (16pt, ■ bullets).

**Slide 2 (model):** header `P.exit` "| EXAM PRACTICE — Modelled Answer ({marks} marks)", "MODELLED ANSWER" pill, single box: model answer prose (16pt **regular** — reads as student prose, not bold) → "MARKS AWARDED FOR" sub-header → markPoints (16pt, ✓ green) → optional "Common error:" (16pt italic `P.exit`).

#### Validation (additional to §1)

- Required: all except `commonError`. Strategy 2–3 items, markPoints 2–6.
- **Model length soft-check:** builder warns if `modelAnswer` exceeds the marks-based guide, prompting an over-polish check (soft, not hard).
- maxChars: question 280, strategy 120, modelAnswer 700, markPoints 100, commonError 160.
- Two slides always generated atomically — never the question without the model.

#### Speaker notes — required (both slides)

Slide 1: attempt time, individual/pairs, what to circulate for. Slide 2: how to run the reveal, mark scheme detail, exam-report source for the common error, reteach trigger.

#### Builder signature

```javascript
function examPracticeSlides(pres, P, d) {
  // SLIDE 1 — question
  const q = pres.addSlide();
  q.background = { color: P.bgLight };
  drawHeaderBar(q, P, P.exit, `| EXAM PRACTICE — ${d.headerTitle} (${d.marks} marks, ${d.attemptMinutes} min)`);
  drawLeftStripe(q, P);
  drawCard(q, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(q, P, "QUESTION", 0.98, 1.18);
  const qRuns = [
    { text: d.question, options: { fontSize: 20, bold: true, paraSpaceAfter: 24, breakLine: true } },
    { text: "HOW TO APPROACH", options: { fontSize: 16, bold: true, color: P.pipe, paraSpaceAfter: 12, breakLine: true } },
    ...d.strategy.map(s => ({ text: s, options: { fontSize: 16, paraSpaceAfter: 8, breakLine: true, bullet: { code: "25A0", color: P.pipe } } }))
  ];
  q.addText(qRuns, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  q.addNotes(d.notes);

  // SLIDE 2 — modelled answer
  const m = pres.addSlide();
  m.background = { color: P.bgLight };
  drawHeaderBar(m, P, P.exit, `| EXAM PRACTICE — Modelled Answer (${d.marks} marks)`);
  drawLeftStripe(m, P);
  drawCard(m, P, 0.80, 1.00, 11.73, 5.90);
  drawPill(m, P, "MODELLED ANSWER", 0.98, 1.18);
  const mRuns = [
    { text: d.modelAnswer, options: { fontSize: 16, paraSpaceAfter: 18, breakLine: true } },
    { text: "MARKS AWARDED FOR", options: { fontSize: 16, bold: true, color: P.pipe, paraSpaceAfter: 12, breakLine: true } },
    ...d.markPoints.map(p => ({ text: `✓  ${p}`, options: { fontSize: 16, color: P.weDo, paraSpaceAfter: 6, breakLine: true } }))
  ];
  if (d.commonError) mRuns.push({ text: `Common error: ${d.commonError}`, options: { fontSize: 16, italic: true, color: P.exit, breakLine: true } });
  m.addText(mRuns, { x: 0.98, y: 1.66, w: 11.37, h: 5.10, fontFace: "Calibri", color: P.text, valign: "top" });
  m.addNotes(d.notes);
}
```

---

*apc_schema.md v1 | Ten slide types (Title, DO NOW, LIS, I DO, LEARNING ACTIVITY, YOU DO, EXIT CARD, SUMMARY, EXAM TIP, EXAM PRACTICE) | Core defines structure; subject overlays supply conventions*
