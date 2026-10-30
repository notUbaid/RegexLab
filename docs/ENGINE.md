# How the RegexLab Engine Works (My Notes)

I wrote this small engine in TypeScript so that the app could run completely in the browser without relying on any external backend or server.

Here is a quick breakdown of what happens when you type a regex pattern like `a(b|c)*`:

```
User Input -> Lexer (Tokens) -> Parser (AST) -> Matcher & Trace (Execution Steps)
```

---

## 1. Lexer (`src/engine/lexer.ts`)

The lexer scans the raw regex string character by character. Its job is to figure out what each character means (is it a literal letter? a parenthesis opening a group? a `*` quantifier? or an escaped character like `\d`?).

For `a(b|c)*`, it breaks it down into these tokens:

- `'a'` -> Literal character
- `'('` -> Group start
- `'b'` -> Literal character
- `'|'` -> Alternation ("OR")
- `'c'` -> Literal character
- `')'` -> Group end
- `'*'` -> Quantifier (0 or more times)

I also store the `start` and `end` index of each token so that when you hover over a token in the UI, I can highlight the exact characters!

---

## 2. Parser (`src/engine/parser.ts`)

The parser takes those tokens and turns them into a tree (an Abstract Syntax Tree, or AST). 

This helps figure out what belongs inside what. For example:
- The `*` quantifier applies to the group `(b|c)`
- Inside that group, there's a choice between `b` OR `c`
- And the whole thing comes after the literal `'a'`

The tree looks roughly like this:
```
Regex
├── Literal ("a")
└── Quantifier ("*")
    └── Group 1
        └── Choice
            ├── Literal ("b")
            └── Literal ("c")
```

I use this tree to render the **AST Explorer** tab and to generate the nodes for the **Railroad Diagram**.

---

## 3. Matcher & Step Debugger (`src/engine/matcher.ts`)

To match the pattern against the test string, the matcher:
1. Runs the native browser RegExp to get accurate match positions and capture groups (`$1`, `$2`, etc.).
2. Simulates the step-by-step state machine so the debugger can show you exactly what happened:
   - When it tests `'a'` against the first character
   - When it enters the loop
   - When it tries branch `'b'`, or backtracks and tries `'c'`
   - When it successfully matches or fails

Each step records the current character, what action was taken (`match`, `branch`, `backtrack`, or `fail`), and an explanation so you can step through with the slider.

---

## 4. ReDoS & Performance Check (`src/engine/complexity.ts`)

Regex Denial of Service (ReDoS) happens when an expression has nested quantifiers like `(a+)+$` or `(a|b|ab)*$`. If you give it a string like `aaaaaaaaaaaa!`, the engine has to try millions of branch combinations, which freezes the browser.

I wrote a simple scanner that checks for these risky patterns and runs a quick benchmark with strings of lengths 10, 15, 20, and 25 to see if the time explodes exponentially.

---

## 5. Single Pass (`src/engine/analyze.ts`)

Instead of parsing the regex separately inside every component, `Workspace.tsx` calls `analyzeRegex(pattern, flags, testText)` in one place with `useMemo`. All tabs (Visualizer, AST, Debugger, Performance, etc.) just read from this one analysis result so the UI stays super smooth!
