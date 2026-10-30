# RegexLab 🧪

Hey! Welcome to **RegexLab**. I built this project because I was learning regular expressions and found most online tools either clunky, full of ads, or confusing when trying to understand *why* an expression failed.

I wanted something clean, fast, and fun to use—where you can test expressions, see color-coded matches, step through execution, and hear satisfying mechanical keyboard clicks while you type.

---

## What It Does

- **Real-time Match Highlighting**: Type your pattern and watch matches and capture groups (`$1`, `$2`, etc.) light up instantly.
- **Railroad Diagram**: See your regular expression visually rendered as a train track state diagram so you can easily trace the branches.
- **Step-by-Step Debugger**: Play, pause, or drag through character-by-character matching to see exactly where your pattern succeeds, fails, or backtracks.
- **Mechanical Keyboard Sounds**: Procedural sound effects using the Web Audio API with 5 switch profiles (Lubed Linear "Thock", Cherry MX Blue "Clicky", Tactile, IBM Model M, and Cyber 8-bit).
- **Interactive Syntax Tree (AST)**: Expand and collapse expression tokens with byte ranges and categories.
- **Performance & ReDoS Check**: Quick heuristic check for exponential backtracking traps and catastrophic complexity.
- **Multi-Language Snippets**: 1-click copy your pattern ready for JavaScript, Python `re.compile`, Rust `Regex::new`, or Go.
- **Practice Challenges & Presets**: 11 interactive regex puzzles with confetti when you solve them, plus 50+ pre-made patterns for emails, URLs, dates, and semver.
- **Keyboard Shortcuts**: Built for quick navigation (`Ctrl+K` for cheatsheet, `Ctrl+S` to copy share link, `Ctrl+B` for token palette, `Alt+1..6` for tabs).

---

## Tech Stack

I built this with:
- **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for the bundler
- **Web Audio API** for zero-latency procedural click synthesis (no heavy audio files needed!)
- **Canvas-Confetti** for challenge celebration

---

## Running Locally

Clone the repo and start the dev server:

```bash
git clone https://github.com/notUbaid/RegexLab.git
cd RegexLab
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To build for production:

```bash
npm run build
```

---

## How It Works Under The Hood

If you're curious about how I wrote the parser and matcher, check out [`docs/ENGINE.md`](docs/ENGINE.md). I wrote a small tokenizer and recursive-descent parser that turns regex strings into tokens and an AST tree, and simulates the transitions step-by-step.

---

## Feedback

If you find a bug, have an idea for a cool switch sound, or want to add more regex challenges, feel free to open an issue or PR!

Made with ❤️ by [Ubaid](https://github.com/notUbaid).
