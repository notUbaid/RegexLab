# How RegexLab works

This is a walkthrough of the code, in the order the data flows. Read it top to bottom and you can explain every file.

## The big picture

The app has one screen (`Workspace.tsx`) and one engine entry point (`analyze()`).

```
 user types in the pattern box, flag buttons or text box
                     │
                     ▼
 Workspace.tsx  ── state: pattern, flags, text
                     │
                     │  useMemo(() => analyze(pattern, flags, text))
                     ▼
 engine/analyze.ts ──► lexer.ts       tokens      (for the explanation)
                   ──► slowPattern.ts  warning    (for the warning line)
                   ──► matcher.ts      matches    (for highlights + results)
                     │
                     ▼
 { error, tokens, matches, warning }  passed as props to:
   PatternInput      shows error / warning
   TestEditor        highlights matches in the text
   ResultsPanel      lists matches, previews replace
   ExplanationPanel  explains tokens
```

Two rules keep this simple:

1. **State lives in one place.** Only `Workspace.tsx` holds the pattern, flags and text. The panels receive data as props and report changes through callbacks like `onPatternChange`.
2. **Analysis runs once per change.** `useMemo` reruns `analyze()` only when the pattern, flags or text actually change. Every panel reads the same result, so they always agree.

## The engine (`src/engine/`)

The engine is plain TypeScript with no React, so it can be tested on its own with `npm test`.

### `lexer.ts`: understanding the pattern

`tokenize(pattern)` walks the pattern one character at a time and produces a list of tokens. Each token records:

- `raw`: the characters it covers, e.g. `\d` or `{2,4}`
- `kind`: literal, class, anchor, quantifier, group-open, group-close, or, backreference
- `start` / `end`: its position in the pattern
- `depth`: how many groups it is inside (used to indent the explanation)
- `description`: plain English, e.g. "any digit (0-9)"

The loop checks, in order: backslash escapes (`\d`, `\1`, `\k<name>`, `\x41`, `\.`), character sets (`[a-z]`), groups (`(`, `(?:`, `(?<name>`, lookarounds), `)`, `|`, `^`, `$`, `.`, quantifiers, and finally plain characters.

Capturing groups are numbered as they open, the same way JavaScript numbers them. A stack (`openGroups`) remembers which group each `)` closes. Groups that don't capture (`(?:`, lookarounds, `(?i:`) push `undefined`, so they never shift the numbers.

A quantifier looks at the token just before it to say what it repeats: `"\d"` for a single piece, or `group 1` when it follows a `)`.

Example:

```
tokenize('(\d{4})+')
  (    group-open   "start of group 1 (captured)"
  \d   class        "any digit (0-9)"                       depth 1
  {4}  quantifier   "repeat "\d" exactly 4 times"           depth 1
  )    group-close  "end of group 1"
  +    quantifier   "repeat group 1 one or more times"
```

The lexer only explains. It never decides whether text matches.

### `matcher.ts`: finding matches

Matching uses the browser's real `RegExp` engine. Writing our own engine would be slower and would get edge cases wrong. The interesting part is getting exact positions:

```ts
const regex = new RegExp(pattern, flags.replace(/[gd]/g, '') + 'gd');
```

- The **`d` flag** ("has indices") makes `exec()` return `result.indices`, the exact `[start, end]` of the whole match and of every capture group. Without it you would have to search for the group text again, which gives the wrong position when the same text appears twice (e.g. `1.1`).
- The **`g` flag** lets us call `exec()` in a loop. We always add it, then stop after the first match if the user turned `g` off. This copies how JavaScript itself behaves.
- An **empty match** (from `^` or `\b`) does not move the search forward, so the loop moves `lastIndex` by one to avoid looping forever.
- At most **1000 matches** are collected, to protect the page from huge results.

### `slowPattern.ts`: the performance warning

Some patterns take exponential time on certain inputs. The classic case is `(a+)+` run against `aaaaaaaaaaaaaaaaaaaaaaaa!`: the engine tries every way of splitting the a's between the inner and outer `+`. This is called catastrophic backtracking, and attackers use it to freeze servers (ReDoS).

`findSlowPattern(tokens)` walks the token list with a stack of open groups. When it sees an unbounded repeat (`+`, `*`, `{n,}`), it marks every open group as "contains a repeat". When a group closes and is itself followed by an unbounded repeat, that is a nested repeat, so it returns a warning.

Because it works on tokens and not raw text, the `+` in `[+-]` is not counted: the lexer already knows it sits inside a character set.

It is a simple check on purpose. It does not catch overlapping alternatives like `(a|a)+`. The code says so in a comment.

### `analyze.ts`: putting it together

```ts
analyze(pattern, flags, text) → { error, tokens, matches, warning }
```

It tokenizes, runs the slow-pattern check, then calls `findMatches` inside `try/catch`. If the pattern is invalid, `new RegExp` throws. The message `Invalid regular expression: /(abc/g: Unterminated group` is shortened to `Unterminated group`, and the `ERROR_HINTS` table adds a plain-English hint for the most common mistakes:

```
Unterminated group. Every ( needs a matching ).
```

The hints are keyed on Chrome's exact wording. In another browser the message is still shown, just without the hint.

## The UI (`src/components/`)

### `TestEditor.tsx`: highlighting inside a text box

A `<textarea>` cannot colour parts of its text. The trick is two layers stacked on top of each other:

1. **Back layer:** a `<div>` with the same text, where every match is wrapped in `<mark>` and every capture group in a coloured `<mark class="capture">`. The text itself is transparent; only the mark backgrounds show.
2. **Front layer:** the real `<textarea>` with a transparent background. You type into it and see the marks through it.

For the marks to sit exactly under the letters, both layers (and the line numbers) share the CSS class `.editor-text`, which fixes the font, size, line height and padding. When the textarea scrolls, `syncScroll()` copies its scroll position to the other two layers.

`renderHighlights()` builds the back layer: plain text, then a `<mark>` for the match, with group marks inside it, then more plain text, and so on.

### `PatternInput.tsx`

The pattern box, four flag buttons (with a word next to each letter so beginners know what they do), a Copy button, and the error or warning line from `analyze()`.

### `ResultsPanel.tsx`

Two tabs:

- **Matches:** one card per match with its position and groups. Hovering a group calls `onHoverGroup(n)`, and `TestEditor` outlines group `n` in the text. When there is no pattern, an error, or no match, a short message says what to do instead.
- **Replace:** runs `text.replace(new RegExp(pattern, flags), replacement)`. JavaScript's `replace` already understands `$1`, `$&` and `$<name>`, so no custom code is needed.

### `ExplanationPanel.tsx`

Lists the tokens with their descriptions, indented by `depth`. Capture group brackets use the same colour as that group's highlight in the text.

### The three windows

- `ExamplesModal.tsx`: filters `data/examples.ts` by the search text. Clicking an example loads its pattern, flags and sample lines.
- `CheatsheetModal.tsx`: clicking an entry calls `insertIntoPattern()` in `Workspace`, which inserts the token at the cursor using the input's `selectionStart`/`selectionEnd`.
- `PracticeModal.tsx`: compiles the learner's pattern on every keystroke and tests it against `mustMatch` and `mustNotMatch`. Solved exercises are saved in `localStorage`.

All three use `Modal.tsx`, which closes on Esc or a click on the dark background.

### Sharing and themes (`Workspace.tsx`)

- **Share** builds `?p=<pattern>&f=<flags>&t=<text>` with `URLSearchParams`, which handles the URL encoding. On page load `readSharedLink()` reads them back and drops any flag letter the UI does not support.
- **Theme** sets `data-theme="light"` or `"dark"` on `<html>`. The colours are CSS variables in `styles/index.css`, and `tailwind.config.js` maps class names like `bg-surface` to those variables, so every component works in both themes without extra code.

## Tests

`src/engine/engine.test.ts` uses Node's built-in test runner, so it needs no extra packages. Node 22.18+ can run `.ts` files directly, which is why engine files import each other with the `.ts` extension.

The tests cover the lexer, exact group positions, the `g` flag, named groups, empty matches, the slow-pattern check and error messages. Two tests check the data:

- every example pattern matches at least one of its own sample lines, and none of them sets off the slow-pattern warning
- every practice answer passes its own checks

## Decisions worth knowing

| Decision | Why |
| --- | --- |
| Use the browser's `RegExp` for matching | It is fast, correct, and exactly what the user's JavaScript will do. |
| Write our own lexer for explanations | The browser does not expose how it parses a pattern. |
| One `analyze()` call per change | Every panel shows the same, consistent result. |
| No state library | One component owns the state, and React state is enough. |
| Transparent textarea over a highlight layer | Keeps native typing, selection, undo and paste, which a fake editor would lose. |
