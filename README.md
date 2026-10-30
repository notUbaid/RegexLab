# RegexLab

A tool-grade regular expression IDE and analyzer built with React, TypeScript, and Tailwind CSS.

RegexLab runs a unified, pure parse-and-analysis pipeline in real time. Instead of switching views to inspect an expression, all tools—pattern input, test editor, match inspector, railroad state graph, AST explorer, step-by-step trace debugger, ReDoS complexity detector, and multi-engine matrix—operate inside a single consolidated workspace.

---

## Workspace Layout

1. **Top Bar & Pattern Input**
   - Pattern editor (`/pattern/flags`) with interactive flag pills (`g`, `i`, `m`, `s`, `u`).
   - One-click **Copy As** generator for JavaScript literals, RegExp constructors, Python `re.compile`, Go `regexp.MustCompile`, and Rust `Regex::new`.
   - **Inline Telemetry Strip** linking directly to inspector tabs (`N matches · X steps (Y ms) · Safe O(n) · Engines`).
   - Quick access to Token Palette, Presets Library, Practice Challenges, Cheatsheet (`Ctrl+K`), themes, and URL Sharing (`Ctrl+S`).

2. **Middle Split Workspace**
   - **Left: Test String Editor**: Ruled line-number gutter, layered syntax highlighting for full matches and indexed capture groups (`g0`–`g7`), sample text dropdown, and synchronized scrolling.
   - **Right: Inspector Pane**:
     - *Matches & Groups*: Detailed match offsets `[start, end]` and capture groups table with hover pinpointing.
     - *Replace Sandbox*: Live substitution preview with quick insertion pills (`$1`, `$2`, `$&`, etc.).
     - *Pattern Compare*: Live side-by-side comparison of two patterns against the same test input.

3. **Collapsible Left Drawer**
   - Click-to-insert Token Palette covering character classes, quantifiers, anchors, capture groups, and lookarounds.

4. **Bottom Inspector Drawer**
   - **Visualizer**: Railroad state machine graph mapping tokens and execution paths.
   - **AST**: Interactive syntax tree with recursive depth indentation, node category badges, and hover sync.
   - **Debugger**: Step-by-step NFA execution trace, failure pinpointer, and one-click fixes.
   - **Performance**: ReDoS complexity analyzer detecting polynomial and exponential backtracking risk, plus a real-time adversarial string benchmark.
   - **Compatibility**: Support matrix across 7 engines (JavaScript, Python, PCRE2, Go, Rust, Java, .NET) with syntax warnings and ready-to-copy code snippets.
   - **Explanation**: Sentence-by-sentence natural language breakdown synchronized with token highlights.

---

## Engine Architecture

All regex analysis is executed via a single pure pass in `src/engine/analyze.ts`:

```ts
const analysis = analyzeRegex(pattern, flags, testText);
```

This single pass tokenizes the input via a recursive descent tokenizer, builds an AST, executes the matcher with capture group indices, traces NFA transitions, evaluates ReDoS vulnerability heuristics, and evaluates multi-engine dialect compatibility.

See [`docs/ENGINE.md`](docs/ENGINE.md) for a technical walkthrough of how a pattern like `a(b|c)*` moves through tokens, AST nodes, and Thompson NFA transitions.

---

## Project Structure

```
RegexLab/
├── docs/
│   └── ENGINE.md            # Lexer, AST, and NFA execution explanation
├── public/
│   ├── logo.svg
│   └── og-image.png
├── src/
│   ├── engine/              # Pure engine pipeline
│   │   ├── types.ts         # Token, AST, Match, Trace, and Complexity types
│   │   ├── lexer.ts         # Tokenizer with byte spans and categories
│   │   ├── parser.ts        # AST construction
│   │   ├── matcher.ts       # Match execution and NFA trace simulation
│   │   ├── complexity.ts    # ReDoS detector and time complexity heuristics
│   │   ├── compatibility.ts # 7-engine feature support matrix
│   │   ├── translator.ts    # Natural language sentence generator
│   │   └── analyze.ts       # Memoizable pure analysis entrypoint
│   ├── components/          # Workspace UI components
│   │   ├── Workspace.tsx    # Single-screen IDE coordinator & URL state sync
│   │   ├── TopBar.tsx       # Header controls, presets, cheatsheet, share
│   │   ├── PatternInput.tsx # Regex input, flag pills, Copy As, inline telemetry
│   │   ├── TestEditor.tsx   # Ruled gutter, layered highlighting, scroll sync
│   │   ├── MatchTable.tsx   # Capture groups table, replace, pattern compare
│   │   ├── TokenPalette.tsx # Collapsible quick-insert token drawer
│   │   ├── Inspector.tsx    # Bottom drawer with text-only tabs
│   │   ├── Railroad.tsx     # SVG state diagram
│   │   ├── AstTree.tsx      # Interactive AST tree
│   │   ├── TraceDebugger.tsx# Step-by-step NFA execution trace
│   │   ├── PerformancePane.tsx # ReDoS curve and adversarial benchmark
│   │   ├── CompatibilityPane.tsx # Engine matrix and code snippets
│   │   ├── ExplanationPane.tsx # Natural language breakdown
│   │   ├── CheatsheetModal.tsx # Searchable syntax reference (Ctrl+K)
│   │   ├── LibraryModal.tsx # Searchable preset patterns
│   │   └── ChallengesModal.tsx # Practice challenges with test suite
│   ├── data/
│   │   ├── challenges.ts    # 11 interactive regex puzzles
│   │   └── patternLibrary.ts# 50+ curated production patterns
│   ├── styles/
│   │   └── index.css        # Studio dark theme & highlight layers
│   ├── types/
│   │   └── regex.ts         # Shared data interfaces
│   ├── utils/
│   │   ├── markup.tsx       # Layered highlight marker utilities
│   │   └── soundEffects.ts  # Web Audio procedural tactile feedback
│   ├── App.tsx              # Root mounting Workspace
│   └── main.tsx             # DOM root
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/notUbaid/RegexLab.git
cd RegexLab
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Build artifacts will be emitted to `dist/`.

---

## License

MIT
