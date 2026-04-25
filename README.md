# FlowPins

**A visual scripting IDE for animation and VFX pipeline automation.**

FlowPins lets you build pipeline scripts by connecting nodes on a canvas — no coding experience required. A single visual graph compiles instantly into executable scripts for 7 industry-standard DCC applications and game engines.

---

## What It Does

Instead of writing code, you drag nodes onto a canvas, connect them together, and FlowPins compiles the result into a production-ready script. Change the target language in the dropdown and the same graph compiles to a completely different DCC — no rewiring, no rewriting.

Built for compositors, animators, and technical artists who know exactly what their pipeline needs but shouldn't have to learn seven different scripting languages to get it.

---

## Compile Targets

| Target | Language | Use Case |
|--------|----------|----------|
| Toon Boom Harmony | JavaScript | Node rigging, compositing automation |
| Autodesk Maya | Python | Joint/skeleton building, FBX export |
| SideFX Houdini | Python | Node graph automation, parameter setting |
| Blackmagic Fusion | Lua | Comp node creation, tool automation |
| Unity | C# | GameObject spawning, scene setup |
| GameMaker Studio 2 | GML | Instance creation, movement logic |
| Python (Standard) | Python | Pipeline tools, file system automation |

---

## Pipeline Tools

FlowPins includes a dedicated set of **Pipeline nodes** for common production tasks — no DCC required, just Python.

### File System
- Walk folders and iterate files by extension
- Check if files or folders exist
- Join and build paths cross-platform
- Batch rename files with find/replace
- Write append logs

### Colourspace Validation
- Read PNG ICC profile and sRGB chunk data
- Check against expected colourspace (sRGB, Linear, ACES, P3)
- Batch validate entire frame folders
- Save timestamped validation reports

### Naming Convention
- Check filenames against custom patterns (`shot_###_layer_v##`)
- Extract shot, scene, layer, and version from filenames
- Pad frame numbers to any digit count
- Bump version numbers automatically
- Batch check entire folders

### Image Validation
- Read image dimensions and bit depth
- Check against expected resolution (e.g. 1920×1080)
- Check bit depth (8-bit, 16-bit, 32-bit)
- Full batch validator — checks dimensions, bit depth, and colourspace in one pass
- Saves CSV report with pass/fail per file

### Reporting
- Compare two folders and find missing files
- Count files by type (PNG, EXR, TIFF, etc.)
- Save results to CSV
- Print formatted summary reports

---

## Evelyn — The Librarian

FlowPins includes a natural language prompt bar powered by **Evelyn**, a built-in AI assistant named after the protagonist of The Mummy (1999).

Type what you want to build in plain English and Evelyn will scaffold a starting node graph:

> *"check colourspace"* → drops a pre-wired colourspace validator  
> *"batch rename"* → drops a rename graph ready to configure  
> *"spawn 10 objects"* → drops a for-loop spawn grid  
> *"compare folders"* → drops a folder comparison graph  
> *"pad frames"* → drops a frame padding graph  

She has opinions about mummies. Don't ask about mummies.

---

## The Code Panel

The Code tab shows your compiled script split into **one block per node**. Clicking any node on the canvas highlights its corresponding code block and scrolls to it — so you can always see exactly what each node produces.

The **X-Ray panel** below the script shows the editable properties of the selected node at a glance — no diving into menus, just the values that matter.

---

## Architecture

```
src/renderer/src/
├── App.tsx                    — Main canvas, undo/redo, keyboard shortcuts
├── libraries/
│   ├── compiler.ts            — Graph → code engine (one block per node)
│   ├── core_logic.ts          — All node specs (Core + Pipeline)
│   ├── evelyn.ts              — Natural language prompt parser
│   ├── templates.ts           — Evelyn's pre-built graph blueprints
│   ├── index.ts               — Combined node library export
│   ├── toonboom.ts            — Harmony-specific node specs
│   └── translators/
│       ├── python.ts          — Python (also inherited by Maya + Houdini)
│       ├── harmony.ts         — Harmony JavaScript
│       ├── maya.ts            — Maya Python (extends python.ts)
│       ├── houdini.ts         — Houdini Python (extends python.ts)
│       ├── csharp.ts          — Unity C#
│       ├── fusion.ts          — Fusion Lua
│       └── gml.ts             — GameMaker GML
└── components/
    ├── LibraryPanel.tsx       — Node library accordion + code view
    ├── NodeInspector.tsx      — Right-hand property editor
    └── PromptBar.tsx          — Evelyn's input bar
```

### Adding a New DCC Target

1. Create a new translation dictionary in `/translators/` (copy `gml.ts` as a starting point)
2. Register it in `TRANSLATION_REGISTRY` in `compiler.ts`
3. Add its mode key to the `CompileMode` type
4. Add it to the dropdown in `LibraryPanel.tsx`

That's it. The compiler, library panel, and Evelyn all pick it up automatically.

---

## Stack

- **Frontend / UI:** React, React Flow, Vite
- **Desktop:** Electron, Node.js
- **Logic:** TypeScript
- **Pipeline tools:** Python 3.8+ with Pillow

---

## Status

Active development. Built by a 30-year animation compositor who got tired of not having the pipeline tools the production needed.

This project is a portfolio piece demonstrating full-stack pipeline architecture — from visual scripting UI through to DCC-native script output across 7 targets.

---

## Requirements

- Node.js 18+
- Python 3.8+ (for pipeline script execution)
- `pip install Pillow` (for image validation nodes)

```bash
npm install
npm run dev
```

---

## License

All Rights Reserved © Alistair Murphy

This repository is shared publicly as a portfolio and demonstration piece.
No portion of this codebase may be copied, modified, or redistributed
without explicit written permission from the author.
