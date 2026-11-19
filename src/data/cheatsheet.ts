// Entries for the Cheatsheet window. Clicking one inserts `token` into the pattern at the cursor.

export interface CheatsheetItem {
  token: string;
  name: string;
  example: string;
}

export const CHEATSHEET: { section: string; items: CheatsheetItem[] }[] = [
  {
    section: 'Characters',
    items: [
      { token: '\\d', name: 'Any digit 0-9', example: '\\d\\d matches "42"' },
      { token: '\\w', name: 'Letter, digit or underscore', example: '\\w+ matches "user_1"' },
      { token: '\\s', name: 'Whitespace (space, tab, new line)', example: 'a\\sb matches "a b"' },
      { token: '\\D', name: 'Anything except a digit', example: '\\D matches "a"' },
      { token: '\\W', name: 'Anything except a word character', example: '\\W matches "!"' },
      { token: '\\S', name: 'Anything except whitespace', example: '\\S+ matches "hello"' },
      { token: '.', name: 'Any character except a new line', example: 'c.t matches "cat" and "cot"' },
      { token: '\\.', name: 'A real dot (escaped)', example: '3\\.14 matches "3.14"' },
    ],
  },
  {
    section: 'Sets',
    items: [
      { token: '[abc]', name: 'One of a, b or c', example: '[aeiou] matches "e"' },
      { token: '[^abc]', name: 'Anything except a, b or c', example: '[^0-9] matches "z"' },
      { token: '[a-z]', name: 'One character in a range', example: '[A-Z] matches "M"' },
    ],
  },
  {
    section: 'Repeats',
    items: [
      { token: '+', name: 'One or more', example: 'a+ matches "a", "aaa"' },
      { token: '*', name: 'Zero or more', example: 'ab* matches "a", "abbb"' },
      { token: '?', name: 'Optional (zero or one)', example: 'colou?r matches "color" and "colour"' },
      { token: '{3}', name: 'Exactly 3 times', example: '\\d{3} matches "123"' },
      { token: '{2,}', name: '2 or more times', example: '\\d{2,} matches "12", "12345"' },
      { token: '{2,4}', name: 'Between 2 and 4 times', example: '\\d{2,4} matches "12" to "1234"' },
      { token: '+?', name: 'One or more, as few as possible (lazy)', example: '<.+?> matches "<b>" not "<b>x</b>"' },
    ],
  },
  {
    section: 'Positions',
    items: [
      { token: '^', name: 'Start of text (or line with m)', example: '^Hi matches "Hi there"' },
      { token: '$', name: 'End of text (or line with m)', example: 'end$ matches "the end"' },
      { token: '\\b', name: 'Edge of a word', example: '\\bcat\\b skips "concatenate"' },
    ],
  },
  {
    section: 'Groups',
    items: [
      { token: '(abc)', name: 'Capture group (numbered $1, $2...)', example: '(\\d+)-(\\d+) captures both numbers' },
      { token: '(?:abc)', name: 'Group without capturing', example: '(?:ha)+ matches "hahaha"' },
      { token: '(?<name>abc)', name: 'Named capture group', example: '(?<year>\\d{4})' },
      { token: 'a|b', name: 'a OR b', example: 'cat|dog matches either word' },
      { token: '\\1', name: 'Same text as group 1 again', example: '(\\w)\\1 matches "ll" in "hello"' },
    ],
  },
  {
    section: 'Lookarounds',
    items: [
      { token: '(?=abc)', name: 'Followed by abc', example: '\\d+(?=px) matches "12" in "12px"' },
      { token: '(?!abc)', name: 'Not followed by abc', example: 'q(?!u) matches the q in "Iraq"' },
      { token: '(?<=abc)', name: 'Preceded by abc', example: '(?<=\\$)\\d+ matches "5" in "$5"' },
      { token: '(?<!abc)', name: 'Not preceded by abc', example: '(?<!-)\\d+ skips "-5"' },
    ],
  },
];
