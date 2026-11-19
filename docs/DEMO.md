# Demo walkthrough

A step-by-step script for showing RegexLab. Each step says what to type, what you will see, and a line you can say. Every result below was checked in the running app.

About 8 minutes of app, then 4 minutes of code.

## Before you start

1. Run `npm install` (first time only), then `npm run dev`.
2. Open http://localhost:5173 in a **private / incognito window**, so the theme and practice progress start fresh.
3. Make the window wide (1280px or more) and keep the browser zoom at 100%.

**If anything goes wrong, reload the page.** The pattern, flags and text always go back to the starting example.

---

## Part 1: the app

### Step 1. The screen (30s)

Don't type anything yet. Point at the four areas:

| Area | What it is |
| --- | --- |
| Top box | The regular expression, with the flag buttons next to it |
| Left | The test text. Matches are highlighted as you type |
| Right | The list of matches (and a Replace tab) |
| Bottom | "What the pattern means": every piece of the pattern in plain English |

> "RegexLab is a regex tester that also explains the pattern. Everything runs in the browser, there's no server."

### Step 2. Read the starting example (1 min)

The pattern box already holds `(\d{4})-(\d{2})-(\d{2})`.

**You'll see:**

- Three dates highlighted in the text. The year is pink, the month blue, the day green.
- The right panel says **Matches (3)**. Match 1 is `2026-03-14` with Group 1 `2026`, Group 2 `03`, Group 3 `14`.
- The text on line 3 has no date, so nothing on it is highlighted.

**Do:** hover over **Group 2** under Match 1.

**You'll see:** all three months (`03`, `04`, `12`) get an outline in the text.

**Do:** point at the bottom panel.

**You'll see:** `\d` = "any digit (0-9)", `{4}` = "repeat "\d" exactly 4 times". The brackets of each group have the same colour as that group's highlight.

> "The brackets make capture groups. Each group gets its own colour, here and in the explanation, so you can see which part of the pattern grabbed which part of the text."

### Step 3. Build a pattern one piece at a time (1.5 min)

Select everything in the pattern box and type each pattern below, one after the other.

| Type this | Matches | What you'll see |
| --- | --- | --- |
| `\d` | 24 | Every single digit is its own match |
| `\d+` | 9 | Whole numbers: `2026`, `03`, `14`, ... |
| `\d{4}` | 3 | Only the three years |
| `\d{4}-\d{2}-\d{2}` | 3 | The three full dates |

> "`\d` is one digit. `+` means one or more, so the digits join up into numbers. `{4}` means exactly four, so only the years are left. Then I add the dashes and the month and day."

Watch the bottom panel change with each one.

### Step 4. Flags (1 min)

Flags change how the whole pattern behaves. Each button has its name written next to the letter.

**g (global):**

1. Put the starting pattern back: `(\d{4})-(\d{2})-(\d{2})`.
2. Click **g global** to turn it off. **You'll see:** Matches (1). Only the first date is found.
3. Click it again to turn it back on: Matches (3).

**i (ignore case):**

1. Type `invoice`. **You'll see:** "No matches", because the text says "Invoice" with a capital I.
2. Click **i ignore case**. **You'll see:** Matches (1), "Invoice" is highlighted.
3. Click **i ignore case** again to turn it off.

**m (multiline):**

1. Type `^\w+`. **You'll see:** Matches (1): `Invoice`. `^` means "start of the text", and the text only starts once.
2. Click **m multiline**. **You'll see:** Matches (3): `Invoice`, `Next`, `This`. Now `^` means "start of each line".
3. Click **m multiline** again to turn it off.

> "Without m, `^` and `$` are the start and end of the whole text. With m, they're the start and end of every line."

### Step 5. A mistake in the pattern (30s)

Type `(\d{4}` (a bracket that is never closed).

**You'll see:**

- Red text under the box: **"Pattern error: Unterminated group. Every ( needs a matching )."**
- The right panel says "The pattern has an error". Nothing crashes, and the explanation still shows the pieces you typed.

> "The browser's message is just 'Unterminated group', so I add a plain-English hint for the common mistakes."

Then type the closing `)` and watch the error disappear.

### Step 6. Find and replace (45s)

1. Put the starting pattern back: `(\d{4})-(\d{2})-(\d{2})`.
2. Click the **Replace** tab on the right.
3. In "Replace each match with", delete the `[$&]` that is there and type `$3/$2/$1`.

**You'll see** in Result: `Invoice sent on 14/03/2026 and paid on 02/04/2026.` and `01/12/2026` on the next line.

> "`$1`, `$2`, `$3` are the three capture groups, so I'm swapping the date around from year-month-day to day/month/year."

Optional: turn off **g global** and only the first date changes. A note under the box explains why. Turn g back on, then click the **Matches** tab to go back.

### Step 7. Examples (45s)

1. Click **Examples** in the top bar.
2. Type `email` in the search box.
3. Click **Email address**.

**You'll see:** five sample lines. The first two (`developer@regexlab.dev`, `sarah.connor+filter@sky.net.io`) are highlighted. `not-an-email`, `missing@domain` and `@missing-user.com` are not. Matches (2).

> "Every example comes with sample text: good lines get highlighted, bad ones don't. The pattern starts with `^` and ends with `$`, and it uses the m flag, so each line is checked on its own."

### Step 8. Cheatsheet (1 min)

This shows that the cheatsheet inserts where your cursor is, not just at the end.

First **reload the page** so the starting text with the dates comes back (the email example replaced it).

1. Type `\w{4}`. **You'll see:** Matches (16). It even matches pieces of longer words, like `Invo` from "Invoice".
2. Click in the pattern box and press **Home** so the cursor is at the very start.
3. Click **Cheatsheet**, then click **`\b` Edge of a word**. The pattern is now `\b\w{4}`: Matches (15).
4. Press **End** to move the cursor to the end, open **Cheatsheet** again and click **`\b`** again. The pattern is now `\b\w{4}\b`: **Matches (10)**.

**You'll see:** only whole 4-letter words are left: `sent`, `paid`, `Next`, `2026`, ...

> "`\b` is a word boundary, the edge of a word. Putting one on each side means 'a whole word of exactly four characters'."

### Step 9. Slow pattern warning (45s)

Type `(\w+\s?)+$`.

**You'll see:** an orange line under the box: **"Slow pattern: (\w+\s?)+ repeats something that already repeats. On some inputs this can make the regex extremely slow."** When you type the final `$`, the page also freezes for a moment (about half a second on a normal laptop).

> "The group repeats, and the `\w+` inside it repeats too. When the match fails, the engine tries every possible way of splitting the words between the two repeats, and that number doubles with every extra character. That's called catastrophic backtracking, and attackers use it to freeze servers. It's known as ReDoS. That pause was on just three short lines."

Don't paste a long text while this pattern is in the box: the tab can freeze for a long time. Reload the page to move on.

### Step 10. Practice (1 min)

1. Click **Practice** in the top bar. **Digits only** is already selected.
2. Type `\d+` in "Your pattern".

**You'll see:** the three "Should match" lines are green. Under "Should NOT match", `hello` is green but `123a`, ` 456 ` and `12.34` are red.

> "`\d+` finds digits anywhere, so '123a' still contains a match."

3. Change it to `^\d+$`.

**You'll see:** every line is green, **"Solved! Every check passes."** appears, a tick appears next to Digits only, and the title changes to **Practice (1 of 11 solved)**.

> "Adding `^` and `$` forces the whole text to be digits from start to end."

4. Click **Try it in the editor**. **You'll see:** the window closes, and the main screen has the pattern `^\d+$` with the g and m flags on and all 7 test lines. Matches (3).

### Step 11. Share and theme (20s)

- Click **Share**. The button changes to **Copied**. Paste the link in a new tab: the same pattern, flags and text open.
- Click the moon / sun icon to switch between light and dark theme.

> "The share link holds the pattern, flags and text in the URL itself, so nothing is stored on a server."

---

## Part 2: the code

Open these files in order. [HOW-IT-WORKS.md](HOW-IT-WORKS.md) has the detail behind each one.

1. **`src/components/Workspace.tsx`**: "All the state lives here: pattern, flags and text. One `useMemo` calls `analyze()`, and every panel gets the result as props."
2. **`src/engine/analyze.ts`**: "The engine's one entry point: split the pattern into tokens, check for slow patterns, find the matches, and turn errors into short messages with a hint."
3. **`src/engine/matcher.ts`**: "I use the browser's real `RegExp`, so the results are exactly what JavaScript does. The `d` flag gives me the exact start and end of every group."
4. **`src/engine/lexer.ts`**: "The browser doesn't explain patterns, so I wrote a small lexer. It walks the pattern one character at a time and describes each piece in plain English."
5. **`src/components/TestEditor.tsx`**: "A textarea can't colour its text. So a transparent textarea sits on top of a div with the same text and `<mark>` tags. They share one CSS class so the letters line up, and the scrolling is synced."
6. **Run `npm test`**: 15 tests. Two of them check the data: every example matches its own samples, and every practice answer passes its own checks.

## Questions you may get

**Why not write your own regex engine?**
The browser's engine is fast, complete, and exactly what the user's JavaScript will do. My code adds what the browser doesn't give you: the explanation, and showing the positions visually.

**How are the highlights lined up with the text?**
Two layers with exactly the same font, size, line height and padding (the `.editor-text` CSS class), plus `syncScroll()` to keep them scrolled together.

**How do you know where each capture group is?**
The `d` (hasIndices) flag. With it, `exec()` returns `indices`: the exact `[start, end]` of the match and of every group.

**What if the regex is invalid?**
`new RegExp` throws an error. `analyze()` catches it, shortens the message, adds a hint for common mistakes, and returns it. The panels show an empty state and nothing crashes.

**Why does `^...$` need the m flag in the examples?**
Without m, `^` and `$` mean the start and end of the whole text. With m, they mean the start and end of each line, so each sample line is checked on its own.

**How do you detect slow patterns?**
From the tokens. A stack of open groups remembers whether each group contains `+`, `*` or `{n,}`. If such a group is itself followed by one of those, it's a nested repeat. It's a simple teaching check, not a full ReDoS detector, and the code comment says what it misses (like `(a|a)+`).

**Why no Redux or Zustand?**
One component owns all the state. Plain React state and props are enough, and easier to follow.

**Is anything sent to a server?**
No. There is no backend. A share link carries the data in the URL itself.

**How is it tested?**
Node's built-in test runner on the engine (no extra packages), and GitHub Actions runs the tests, the type-check and the production build on every push.

**What would you add next?**
Run the regex in a Web Worker with a time limit, so even a catastrophic pattern can't freeze the tab. Also colour nested capture groups in the highlighter (today only the outer one is coloured, though every group is listed on the right).
