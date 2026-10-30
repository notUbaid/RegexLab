# RegexLab Engine Architecture

RegexLab parses and simulates regular expressions entirely in the browser using a unified, pure compiler pipeline:

```
Pattern String -> Tokens (Lexer) -> AST (Parser) -> NFA Simulator & Analyzer
```

---

## Worked Example: `a(b|c)*`

To see how the engine processes an expression, trace the pattern `a(b|c)*`:

### 1. Lexical Analysis (`src/engine/lexer.ts`)
The scanner reads character-by-character, resolving escaped sequences and operators:

| Offset | Raw | Type | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| `0..1` | `a` | `literal` | Matches character literal 'a' |
| `1..2` | `(` | `group_open` | Starts capturing group #1 |
| `2..3` | `b` | `literal` | Matches character literal 'b' |
| `3..4` | `\|` | `alternation` | Choice branch (left or right) |
| `4..5` | `c` | `literal` | Matches character literal 'c' |
| `5..6` | `)` | `group_close` | Closes capturing group #1 |
| `6..7` | `*` | `quantifier` | Zero or more repetitions (`min: 0, max: Infinity, greedy: true`) |

Each token retains source slice positions `[start, end]` for bidirectional cursor and hover synchronization in the UI.

### 2. Abstract Syntax Tree (`src/engine/parser.ts`)
A recursive-descent parser constructs the operator hierarchy:

```
Expression
├── Literal ("a")
└── Quantifier ("*", greedy: true)
    └── Group (Capture #1)
        └── Disjunction ("|")
            ├── Literal ("b")
            └── Literal ("c")
```

### 3. Non-Deterministic Finite Automaton (`src/engine/matcher.ts`)
Thompson's construction converts the AST into an NFA state graph with epsilon ($\epsilon$) transitions:

```
[State 0 (Start)] ──'a'──> [State 1] ──ε──> [State 2 (Loop Entry)]
                                 ▲                     │
                                 │                 ┌───┴───┐
                                 │                'b'     'c'
                                 │                 │       │
                                 │                 └───┬───┘
                                 │                     ▼
                                 └──────── ε ─────── [State 3] ──ε──> [State 4 (Accept)]
```

When matching against text like `"ab"`:
1. `State 0`: consumes `'a'` at index `0`. Transition to `State 1`.
2. `State 1`: follows $\epsilon$-transition into the group loop (`State 2`).
3. `State 2`: tries left branch `'b'`. Matches index `1`. Transition to `State 3`.
4. `State 3`: greedily loops back to `State 2` to test for more characters.
5. End of string reached: engine backtracks to `State 3` and exits through $\epsilon$-transition to `State 4` (Accept). Match confirmed.

---

## Single Pure Analysis Pass (`src/engine/analyze.ts`)

Instead of re-parsing the regex on every UI component mount, RegexLab executes a single memoized call:

```ts
const analysis = analyzeRegex(pattern, flags, testText);
```

This returns `{ ast, tokens, matches, trace, complexity, compatibility, explanation, error }` in one pure, unmutated pass, keeping the workspace synchronized at 60 FPS.
