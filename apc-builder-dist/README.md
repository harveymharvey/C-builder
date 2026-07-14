# APC Lesson Builder

Local tool that turns a validated JSON lesson spec into an APC-schema-conforming `.pptx`.

The builder is the **only** thing that should produce `.pptx` files in this workflow. A spec-authoring chat session writes JSON; you run it through this tool.

## What's in this folder

```
builder/
├── Start_Builder.command   ← Double-click this to run (macOS)
├── server.js               Local Express server + UI
├── builder.js              Renders JSON specs to PPTX (schema-canonical)
├── validators.js           Spec-validation layer (refuses bad specs)
├── package.json
├── public/
│   └── index.html          Browser UI
├── palettes/
│   ├── PE.json             VCE Physical Education palette
│   └── HHD.json            VCE Health & Human Development palette
└── output/                 Built .pptx and -portal.md files land here
```

## First-time setup

You need **Node.js (LTS)**. Install from https://nodejs.org if you don't have it.

That's it — `Start_Builder.command` installs dependencies on first run automatically.

## How to use it

**Double-click `Start_Builder.command`.** A Terminal window opens and your browser opens to `http://localhost:4173`.

### Single file

1. Upload a `.json` lesson spec.
2. Click **Validate**.
3. If validation passes with no warnings, click **Build PPTX**.
4. If there are warnings, the button changes to **Build anyway** — review the warnings first, then proceed if you're happy.
5. Download the `.pptx` and (if the lesson has YOU DO slides) the `-portal.md` companion.

### Batch folder

1. Switch to the **Batch folder** tab.
2. Enter the absolute path to a folder containing `.json` specs.
3. Click **Validate & build all**.
4. Each spec is validated and built independently. Failures don't block other files.
5. Download individual files from the result panel.

### Stopping the server

Close the Terminal window or press Ctrl+C in it.

## How a spec gets built

A valid spec needs:

- `meta.palette` — either inline `palette: { ... }` in the spec, or a string like `"PE"` that references `palettes/PE.json`
- `slides` — an array of slide objects matching the schema's slide types

The build pipeline is:

1. **Validators run.** `validators.js` enforces the schema — field lengths, required fields, lesson coherence, continuum term names, all of it. A bad spec never builds.
2. **Builder runs.** `builder.js` applies the schema's locked geometry, typography, and palette. No improvisation — every slide is drawn by the same renderer with the same rules.
3. **PPTX written** to `output/<slug>.pptx`. The slug is derived from `meta.topic`.
4. **Portal markdown written** to `output/<slug>-portal.md` if the lesson has any YOU DO slides.

If you ever see a slide that doesn't match the schema's spec — wrong font size, missing pill, ad-hoc bullets — the bug is in `builder.js`, not in your spec. The whole point is that this builder is the single source of truth for "how a slide is drawn."

## Adding a new subject palette

Drop `<name>.json` in `palettes/`. It must include every field listed in `validators.js → REQUIRED_PALETTE`. The validator will refuse builds for any missing palette field.

## Running without the UI (CLI)

You can also run a one-off build from the command line:

```bash
node -e 'const {buildLesson} = require("./builder.js"); const spec = require("./your-spec.json"); buildLesson(spec, { palettesDir: "./palettes", outputDir: "./output", baseName: "test" }).then(console.log)'
```

The UI is the recommended workflow because it surfaces validator warnings clearly.
