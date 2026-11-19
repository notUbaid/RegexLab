// Practice exercises. The learner's pattern must match every `mustMatch` string
// and none of the `mustNotMatch` strings. `solution` stays hidden until asked for.

export interface Challenge {
  title: string;
  level: 'Easy' | 'Medium' | 'Hard';
  task: string;
  hint: string;
  solution: string;
  mustMatch: string[];
  mustNotMatch: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    title: 'Digits only',
    level: 'Easy',
    task: 'Match text made only of digits (0-9), nothing else.',
    hint: 'Use \\d with + for "one or more", and wrap it in ^ and $ so nothing else is allowed.',
    solution: '^\\d+$',
    mustMatch: ['12345', '0', '9876543210'],
    mustNotMatch: ['123a', 'hello', ' 456 ', '12.34'],
  },
  {
    title: 'Exact word',
    level: 'Easy',
    task: 'Match exactly "Hello", with the capital H and nothing around it.',
    hint: 'Put the word between ^ (start) and $ (end).',
    solution: '^Hello$',
    mustMatch: ['Hello'],
    mustNotMatch: ['hello', 'Hello World', 'Say Hello', 'HELLO'],
  },
  {
    title: 'Vowels only',
    level: 'Easy',
    task: 'Match words made only of lowercase vowels (a, e, i, o, u).',
    hint: 'A character set [aeiou] matches one vowel. Add + to allow several.',
    solution: '^[aeiou]+$',
    mustMatch: ['aeiou', 'ou', 'a', 'eieio'],
    mustNotMatch: ['cat', 'dog', 'AEIOU', 'apple'],
  },
  {
    title: 'Hex color',
    level: 'Medium',
    task: 'Match 6-digit hex colors that start with #, like #38bdf8.',
    hint: 'After ^#, allow [0-9a-fA-F] exactly 6 times with {6}.',
    solution: '^#[0-9a-fA-F]{6}$',
    mustMatch: ['#38bdf8', '#FFFFFF', '#000000', '#a1b2c3'],
    mustNotMatch: ['#FFF', '#12345', '38bdf8', '#GGGGGG', '#1234567'],
  },
  {
    title: 'Image files',
    level: 'Medium',
    task: 'Match file names that end in .jpg, .png or .svg.',
    hint: 'Escape the dot as \\. and use (jpg|png|svg) for the choice.',
    solution: '^.+\\.(jpg|png|svg)$',
    mustMatch: ['avatar.png', 'hero_banner.jpg', 'logo.svg', 'photo.1.png'],
    mustNotMatch: ['document.pdf', 'script.js', 'avatar.png.exe', 'imagejpg'],
  },
  {
    title: 'Username rules',
    level: 'Medium',
    task: 'Match usernames of 4 to 12 characters that start with a letter and use only letters and digits.',
    hint: 'Start with ^[a-zA-Z], then [a-zA-Z0-9]{3,11} for the rest, then $.',
    solution: '^[a-zA-Z][a-zA-Z0-9]{3,11}$',
    mustMatch: ['user123', 'JohnDoe', 'alex99', 'Coder'],
    mustNotMatch: ['123user', 'abc', 'this_username_is_way_too_long', 'user-name'],
  },
  {
    title: 'Phone number',
    level: 'Medium',
    task: 'Match US phone numbers written as (XXX) XXX-XXXX.',
    hint: 'Brackets are special, so escape them: \\( and \\). Use \\d{3} and \\d{4}.',
    solution: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
    mustMatch: ['(415) 555-2671', '(800) 123-4567', '(212) 999-0000'],
    mustNotMatch: ['415-555-2671', '(415)555-2671', '4155552671', '(41) 555-2671'],
  },
  {
    title: 'Calendar date',
    level: 'Hard',
    task: 'Match dates written YYYY-MM-DD where the month is 01-12 and the day is 01-31.',
    hint: 'Month: (0[1-9]|1[0-2]). Day: (0[1-9]|[12]\\d|3[01]).',
    solution: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    mustMatch: ['2026-10-19', '1999-01-01', '2030-12-31'],
    mustNotMatch: ['2026-13-01', '2026-00-15', '2026-02-32', '26-10-19'],
  },
  {
    title: 'Password check',
    level: 'Hard',
    task: 'Require at least 8 characters, at least one uppercase letter and at least one digit.',
    hint: 'A lookahead (?=.*[A-Z]) checks for something without using it up. Combine two, then .{8,}',
    solution: '^(?=.*[A-Z])(?=.*\\d).{8,}$',
    mustMatch: ['Password1', 'Secure999', 'A1b2c3d4e5'],
    mustNotMatch: ['password', 'PASSWORD', 'Pass1', 'alllowercase1'],
  },
  {
    title: 'Markdown link',
    level: 'Hard',
    task: 'Match Markdown links like [Text](https://example.com).',
    hint: 'Escape both kinds of bracket: \\[ \\] and \\( \\). [^\\]]+ means "anything except ]".',
    solution: '^\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)$',
    mustMatch: ['[RegexLab](https://regexlab.dev)', '[Docs](http://docs.example.org/api)'],
    mustNotMatch: ['Just a link https://regexlab.dev', '[Incomplete Link]', '(No Bracket Text)(https://example.com)'],
  },
  {
    title: 'Matching HTML tags',
    level: 'Hard',
    task: 'Match a tag pair where the closing tag has the same name, like <b>bold</b>.',
    hint: 'Capture the name with <([a-z0-9]+)>, then reuse it in the closing tag with \\1.',
    solution: '^<([a-z0-9]+)>.*?<\\/\\1>$',
    mustMatch: ['<b>Bold Text</b>', '<div>Hello World</div>', '<h1>Header Title</h1>'],
    mustNotMatch: ['<div>Mismatched Tag</span>', '<b>Unclosed tag', 'Plain text without tags'],
  },
];
