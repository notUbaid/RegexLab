import { Challenge } from '../types/regex';

export const REGEX_CHALLENGES: Challenge[] = [
  // Novice
  {
    id: 'ch-1',
    title: 'The First Spark: Digits Only',
    level: 'Novice',
    instructions: 'Write a pattern that matches strings containing only numeric digits (0 through 9).',
    hint: 'Use the `\\d` shorthand or `[0-9]` character set with `+` for one or more, anchored with `^` and `$`.',
    starterPattern: '^\\d+$',
    mustMatch: ['12345', '0', '9876543210'],
    mustNotMatch: ['123a', 'hello', ' 456 ', '12.34'],
  },
  {
    id: 'ch-2',
    title: 'Greeting Gate: Exact Word Match',
    level: 'Novice',
    instructions: 'Match only the exact greeting "Hello" (case-sensitive) without any surrounding text.',
    hint: 'Combine the start anchor `^`, literal word "Hello", and end anchor `$`.',
    starterPattern: '^Hello$',
    mustMatch: ['Hello'],
    mustNotMatch: ['hello', 'Hello World', 'Say Hello', 'HELLO'],
  },
  {
    id: 'ch-3',
    title: 'Vowel Finder: Character Classes',
    level: 'Novice',
    instructions: 'Match single words containing strictly lowercase vowels (a, e, i, o, u).',
    hint: 'Use square brackets `[aeiou]` with a quantifier `+`.',
    starterPattern: '^[aeiou]+$',
    mustMatch: ['aeiou', 'ou', 'a', 'eieio'],
    mustNotMatch: ['cat', 'dog', 'AEIOU', 'apple'],
  },

  // Apprentice
  {
    id: 'ch-4',
    title: 'Hex Palette: Color Codes',
    level: 'Apprentice',
    instructions: 'Match 6-character hexadecimal color codes starting with `#` (e.g., `#38bdf8`).',
    hint: 'Use `^#` followed by `[0-9a-fA-F]{6}$`.',
    starterPattern: '^#[0-9a-fA-F]{6}$',
    mustMatch: ['#38bdf8', '#FFFFFF', '#000000', '#a1b2c3'],
    mustNotMatch: ['#FFF', '#12345', '38bdf8', '#GGGGGG', '#1234567'],
  },
  {
    id: 'ch-5',
    title: 'File Hunter: Image Extensions',
    level: 'Apprentice',
    instructions: 'Match filenames ending in either `.jpg`, `.png`, or `.svg`.',
    hint: 'Escape the dot `\\.` and use an alternation `(jpg|png|svg)$`.',
    starterPattern: '^.+\\.(jpg|png|svg)$',
    mustMatch: ['avatar.png', 'hero_banner.jpg', 'logo.svg', 'photo.1.png'],
    mustNotMatch: ['document.pdf', 'script.js', 'avatar.png.exe', 'imagejpg'],
  },
  {
    id: 'ch-6',
    title: 'Username Policy: Alphanumeric',
    level: 'Apprentice',
    instructions: 'Match usernames between 4 and 12 characters that start with a letter and contain only letters and numbers.',
    hint: 'Start with `^[a-zA-Z]`, then allow `[a-zA-Z0-9]` for the remaining 3 to 11 characters.',
    starterPattern: '^[a-zA-Z][a-zA-Z0-9]{3,11}$',
    mustMatch: ['user123', 'JohnDoe', 'alex99', 'Coder'],
    mustNotMatch: ['123user', 'abc', 'this_username_is_way_too_long', 'user-name'],
  },

  // Adept
  {
    id: 'ch-7',
    title: 'Phone Splitter: Area Codes',
    level: 'Adept',
    instructions: 'Match US phone numbers in `(XXX) XXX-XXXX` format.',
    hint: 'Escape parentheses `\\(` and `\\)`, use `\\d{3}` and `\\d{4}` with a hyphen `-`.',
    starterPattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
    mustMatch: ['(415) 555-2671', '(800) 123-4567', '(212) 999-0000'],
    mustNotMatch: ['415-555-2671', '(415)555-2671', '4155552671', '(41) 555-2671'],
  },
  {
    id: 'ch-8',
    title: 'Date Verifier: YYYY-MM-DD',
    level: 'Adept',
    instructions: 'Match calendar dates in `YYYY-MM-DD` format where month is 01-12 and day is 01-31.',
    hint: 'Use `\\d{4}` for year, `(0[1-9]|1[0-2])` for month, and `(0[1-9]|[12]\\d|3[01])` for day.',
    starterPattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    mustMatch: ['2026-10-19', '1999-01-01', '2030-12-31'],
    mustNotMatch: ['2026-13-01', '2026-00-15', '2026-02-32', '26-10-19'],
  },

  // Master
  {
    id: 'ch-9',
    title: 'The Fortress: Password Lookahead',
    level: 'Master',
    instructions: 'Require at least 8 characters, at least one uppercase letter, and at least one number.',
    hint: 'Use positive lookaheads: `^(?=.*[A-Z])(?=.*\\d).{8,}$`.',
    starterPattern: '^(?=.*[A-Z])(?=.*\\d).{8,}$',
    mustMatch: ['Password1', 'Secure999', 'A1b2c3d4e5'],
    mustNotMatch: ['password', 'PASSWORD', 'Pass1', 'alllowercase1'],
  },
  {
    id: 'ch-10',
    title: 'Markdown Link Extractor',
    level: 'Master',
    instructions: 'Match standard Markdown links: `[Anchor Text](https://url.com)`.',
    hint: 'Escape brackets `\\[` and `\\]`, followed by parentheses `\\(` and `\\)`.',
    starterPattern: '^\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s\\)]+)\\)$',
    mustMatch: [
      '[RegexLab](https://regexlab.dev)',
      '[Documentation](http://docs.example.org/api)',
    ],
    mustNotMatch: [
      'Just a link https://regexlab.dev',
      '[Incomplete Link]',
      '(No Bracket Text)(https://example.com)',
    ],
  },

  // Grandmaster
  {
    id: 'ch-11',
    title: 'HTML Balancer: Matching Tags',
    level: 'Grandmaster',
    instructions: 'Match paired HTML tags with identical tag names using backreferences (e.g. `<b>bold</b>`, `<div>text</div>`).',
    hint: 'Capture the opening tag name in group 1 `<([a-z0-9]+)>`, match the content `.*?`, and refer back with `</\\1>`.',
    starterPattern: '^<([a-z0-9]+)>.*?<\\/\\1>$',
    mustMatch: [
      '<b>Bold Text</b>',
      '<div>Hello World</div>',
      '<h1>Header Title</h1>',
    ],
    mustNotMatch: [
      '<div>Mismatched Tag</span>',
      '<b>Unclosed tag',
      'Plain text without tags',
    ],
  },
];
