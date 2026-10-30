# RegexLab — Video Demo Walkthrough & Recording Guide

This guide gives you an easy, step-by-step roadmap for recording a video demo of **RegexLab**. It includes an exact scene-by-scene script, what to click, what sample inputs to show, and voiceover suggestions in simple, beginner-friendly language.

---

## Quick Setup Before Recording

- **Browser**: Open Chrome or your preferred browser at `http://localhost:4173` (or your deployed Vercel URL).
- **Zoom Level**: 100% or 110% (press `Ctrl +` or `Ctrl 0` to set optimal scale).
- **Recording Tools**:
  - **Loom** (recommended for quick camera bubble + screen capture)
  - **OBS Studio** (recommended for professional 1080p/60fps recording)
  - **Windows Game Bar** (`Win + Alt + R` to instantly record screen)
- **Audio Tip**: Turn on the sound toggle in the top-right header if you want subtle, satisfying click chimes during the demo.

---

## Video Outline (Recommended Length: ~2 to 3 Minutes)

| Time | Scene | Key Feature to Highlight |
| :--- | :--- | :--- |
| **0:00 – 0:25** | **1. Overview & Landing Hero** | Bespoke typography, live highlighter swipe, instant specimen picker |
| **0:25 – 0:55** | **2. Interactive Playground** | Real-time token highlighting, capture groups, natural language explanation, replace sandbox |
| **0:55 – 1:25** | **3. Step-by-Step Engine** | Animated D3 state machine, single-stepping character matcher, backtrack warning |
| **1:25 – 1:50** | **4. No-Code Builder & AST Tree** | Lego-style block assembler, AST tree hierarchy with plain English nodes |
| **1:50 – 2:15** | **5. Fix Errors & Speed Check** | Character-level failure diagnostics, ReDoS complexity meter, adversarial benchmark |
| **2:15 – 2:40** | **6. Multi-Language & Examples** | 7-engine compatibility cards, 1-click code copying, curated pattern library |
| **2:40 – 3:00** | **7. Practice Challenges & Modals** | Gamified regex puzzles with celebratory confetti, `Ctrl+K` cheat sheet, theme switcher |

---

## Scene-by-Scene Script & Action Guide

### Scene 1: Introduction & Landing Page (0:00 – 0:25)

**What to do on screen:**
1. Start on the **Overview** page (`/`).
2. Show the bold headline: *"Find the pattern in the text."*
3. Click the sample pills under the specimen: click **"Dates"**, then **"Hex colours"**, then **"Email addresses"**.
4. Notice how the highlighter swipe `.swipe` and colored group pens immediately highlight the matches in the sentence with zero delay.
5. Click the primary button: **"Open in the playground"**.

**Suggested voiceover:**
> *"Hey everyone! Today I want to show you RegexLab — a fast, visual, and beginner-friendly regular expression tool designed to make regex simple, beautiful, and completely transparent.*
> *Right here on the overview page, you can see live specimens like dates, hex colors, and email addresses getting highlighted in real time as you test patterns.*
> *Let's click 'Open in the playground' to see how it works under the hood."*

---

### Scene 2: Interactive Playground (0:25 – 0:55)

**What to do on screen:**
1. Point your cursor to the main pattern input `/ (\w+)@(\w+)\.(\w+) / g`.
2. Toggle a flag button (like `i` for case-insensitive) to show how clean and responsive the toggle is.
3. Hover over the individual token badges right below the input (e.g., `\w+`, `@`) to show the instant tooltips explaining what each token does.
4. Show the ruled sheet editor: point out the line numbers and the right-hand margin notes highlighting matches per line.
5. Click the **"Explanation"** tab: scroll through the natural English sentence breakdown of the regex.
6. Click the **"Replace"** tab: show the live substitution sandbox. Type `User: $1 | Domain: $2.$3` into the input and point out the live transformed output box.
7. Click back to the **"Matches"** tab.

**Suggested voiceover:**
> *"The Playground is built like a developer's notebook. As you type your regex, every matching word is marked up with pen colors that correspond to your capture groups.*
> *Right underneath the input, you get plain-English explanations for every single token so you never have to guess what a symbol means.*
> *You can also switch to the Explanation tab for a complete sentence-by-sentence breakdown, or use the Replace tab to test substitutions with live preview."*

---

### Scene 3: Step-by-Step Engine Matcher (0:55 – 1:25)

**What to do on screen:**
1. Click **"Step by step"** in the sidebar.
2. Show the interactive D3 state machine diagram in the center of the screen.
3. Click the **"Next"** button 3 to 4 times, or click **"Play"** to watch the automated playback.
4. Point out how the active state nodes light up in warm amber as the engine checks each character against the pattern.
5. Point out the plain-English action badges: *"Matched Letter"*, *"Checking Options"*, and *"Found Match!"*.

**Suggested voiceover:**
> *"Now here is one of the coolest features: the Step-by-Step Matcher.*
> *Usually, regex feels like a mysterious black box. Here, we actually simulate the finite state engine right in your browser.*
> *You can step forward character by character, watch the engine evaluate transitions, and see exactly when it succeeds or when it has to back up and try another branch."*

---

### Scene 4: No-Code Builder & Pattern Tree (1:25 – 1:50)

**What to do on screen:**
1. Click **"Builder"** in the sidebar.
2. Show the Lego-style block interface.
3. Click **"+ Numbers"** to add a number block, or click the up/down arrows to reorder blocks.
4. Point out the live compiled regex string updating automatically at the top.
5. Click **"Pattern tree"** in the sidebar.
6. Click an AST node (like `CharacterClass` or `Quantifier`) to show the inspector panel on the right with character index ranges and explanations.

**Suggested voiceover:**
> *"If you don't want to write cryptic regex syntax by hand, the No-Code Builder lets you assemble patterns using visual building blocks — like 'Start of String', 'Numbers', and 'Word Boundary'. It compiles straight into valid regex with one click.*
> *And if you want to inspect complex expressions, the Pattern Tree breaks down the Abstract Syntax Tree into a clear hierarchy with clickable nodes."*

---

### Scene 5: Fix Errors & Speed Check (1:50 – 2:15)

**What to do on screen:**
1. Click **"Fix errors"** in the sidebar.
2. Show the diagnostic report. Point out the *"Mismatch Detected"* or *"Match Succeeded"* hero card.
3. Show the character-level failure index (it pinpoints the exact position where the pattern stopped matching).
4. Click **"Speed check"** in the sidebar.
5. Click the **"Run Adversarial Benchmark"** button.
6. Show the ReDoS risk meter (Low / Safe) and the D3 execution complexity curve.

**Suggested voiceover:**
> *"Two features that make this production-ready are the Debugger and the Speed Check.*
> *When your regex doesn't match, 'Fix errors' tells you the exact character index where it stopped, explains why, and gives you one-click recommendations.*
> *And the Speed Check protects you from ReDoS — or catastrophic backtracking. With one click, you can run an adversarial test and verify your pattern won't freeze your app or server."*

---

### Scene 6: Multi-Language Compatibility & Library (2:15 – 2:40)

**What to do on screen:**
1. Click **"Languages"** in the sidebar.
2. Show the engine cards: JavaScript (V8), Python (re), PCRE2 (PHP), Go (regexp), Rust (regex), Java, and .NET.
3. Click the **"Copy"** button on the Python or JavaScript snippet.
4. Click **"Examples"** in the sidebar.
5. Click a category pill like **"Web & Network"** or type `IP` into the search box.
6. Click **"Open in playground"** on any pattern (e.g., IPv4 address) to show how it seamlessly loads back into the Playground with test data.

**Suggested voiceover:**
> *"Different programming languages handle regex differently. Under Languages, RegexLab evaluates your pattern across 7 major engines — including Python, Go, Rust, and Java — and lets you copy the exact snippet for your codebase.*
> *There's also a built-in Examples library with dozens of battle-tested patterns for emails, passwords, URLs, and dates that you can load directly into the playground."*

---

### Scene 7: Practice Challenges, Cheat Sheet, & Themes (2:40 – 3:00)

**What to do on screen:**
1. Click **"Practice"** in the sidebar.
2. Show the challenge test runner with green checkmarks.
3. Press `Ctrl + K` or click **"Cheat sheet"** in the header to show the modal with instant search.
4. Click the **Theme Switcher** in the top-right header and select **"Paper"** to show the crisp light mode, then switch back to **"Ink"** (dark mode).
5. Wrap up on the Overview or Playground screen.

**Suggested voiceover:**
> *"Finally, RegexLab includes interactive Practice Challenges where you can solve puzzles and test your skills with instant validation and confetti.*
> *You can hit Ctrl+K anytime for a full searchable cheat sheet, and switch between 6 studio themes like Paper and Ink.*
> *Everything is free, fast, and runs entirely in your browser. Thanks for watching, and try out RegexLab today!"*

---

## Checklist for a Flawless Recording

- [ ] Clear browser cookies/hash if you want a completely fresh state (visit `http://localhost:4173/`).
- [ ] Close unnecessary browser tabs and mute OS notifications.
- [ ] Practice speaking in a relaxed, confident, conversational tone.
- [ ] Keep mouse movements deliberate and smooth (don't shake or rapidly wiggle the cursor).
- [ ] Keep video around 2 minutes for Twitter/LinkedIn, or 3–4 minutes for YouTube/Portfolio.
