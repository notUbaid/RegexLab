// Run with: npm test   (uses Node's built-in test runner, no extra packages)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from './lexer.ts';
import { findMatches } from './matcher.ts';
import { findSlowPattern } from './slowPattern.ts';
import { analyze } from './analyze.ts';
import { EXAMPLES } from '../data/examples.ts';
import { CHALLENGES } from '../data/challenges.ts';

test('tokenize: splits a pattern into explained pieces', () => {
  const tokens = tokenize('\\d+');
  assert.deepEqual(tokens.map((t) => [t.raw, t.kind]), [['\\d', 'class'], ['+', 'quantifier']]);
  assert.equal(tokens[0].description, 'any digit (0-9)');
});

test('tokenize: numbers capturing groups and skips non-capturing ones', () => {
  const opens = tokenize('(a)(?:b)(?<year>c)').filter((t) => t.kind === 'group-open');
  assert.deepEqual(opens.map((t) => t.groupNumber), [1, undefined, 2]);
  assert.match(opens[2].description, /named "year"/);
});

test('tokenize: describes each kind of quantifier', () => {
  const describe = (q: string) => tokenize('a' + q)[1].description;
  assert.match(describe('{3}'), /exactly 3 times/);
  assert.match(describe('{2,}'), /2 or more times/);
  assert.match(describe('{1,3}?'), /between 1 and 3 times, as few/);
  assert.match(describe('?'), /optional/);
  assert.doesNotMatch(describe('?'), /as few/);
});

test('tokenize: a quantifier says what it repeats', () => {
  assert.equal(tokenize('\\d{4}')[1].description, 'repeat "\\d" exactly 4 times');
  assert.equal(tokenize('(ab)+')[4].description, 'repeat group 1 one or more times');
});

test('tokenize: backreferences and character sets', () => {
  assert.equal(tokenize('\\1')[0].kind, 'backreference');
  assert.match(tokenize('\\k<year>')[0].description, /group named "year"/);
  assert.deepEqual(tokenize('[a\\]b]c').map((t) => t.raw), ['[a\\]b]', 'c']);
});

test('tokenize: escapes', () => {
  assert.match(tokenize('\\.')[0].description, /a real "\."/);
  assert.match(tokenize('\\f')[0].description, /form feed/);
  assert.match(tokenize('\\x41')[0].description, /the character "A"/);
  assert.match(tokenize('\\u0041')[0].description, /the character "A"/);
});

test('tokenize: a flag group like (?i:...) does not shift the group numbers', () => {
  const opens = tokenize('(?i:a)(b)').filter((t) => t.kind === 'group-open');
  assert.deepEqual(opens.map((t) => t.groupNumber), [undefined, 1]);
});

test('findMatches: group positions are exact even when the same text repeats', () => {
  // The old indexOf-based code put group 2 on the first "1" as well.
  const [match] = findMatches('(\\d+)\\.(\\d+)', 'g', 'v1.1');
  assert.deepEqual(match.groups.map((g) => [g.start, g.end]), [[1, 2], [3, 4]]);
});

test('findMatches: respects the g flag', () => {
  assert.equal(findMatches('a', 'g', 'aaa').length, 3);
  assert.equal(findMatches('a', '', 'aaa').length, 1);
});

test('findMatches: reports group names and skips groups that did not match', () => {
  const [match] = findMatches('(?<year>\\d{4})(-x)?', 'g', '2026');
  assert.deepEqual(match.groups, [{ number: 1, name: 'year', text: '2026', start: 0, end: 4 }]);
});

test('findMatches: empty matches do not loop forever', () => {
  assert.equal(findMatches('^', 'gm', 'a\nb\nc').length, 3);
});

test('findSlowPattern: flags nested repeats only', () => {
  assert.ok(findSlowPattern(tokenize('(a+)+$')));
  assert.ok(findSlowPattern(tokenize('(\\w*\\s)*')));
  assert.equal(findSlowPattern(tokenize('(a+)?')), null);
  assert.equal(findSlowPattern(tokenize('([+-]\\d)+')), null); // the + inside [ ] is just a character
  assert.equal(findSlowPattern(tokenize('(\\d+)\\.(\\d+)')), null);
});

test('analyze: turns syntax errors into short messages with a hint', () => {
  assert.equal(analyze('(abc', 'g', 'abc').error, 'Unterminated group. Every ( needs a matching ).');
  assert.equal(analyze('', 'g', 'abc').matches.length, 0);
});

test('every example compiles, matches some sample lines and does not trigger the slow-pattern warning', () => {
  for (const example of EXAMPLES) {
    const matches = findMatches(example.pattern, example.flags, example.sample.join('\n'));
    assert.ok(matches.length > 0, example.name);
    assert.equal(findSlowPattern(tokenize(example.pattern)), null, example.name);
  }
});

test('every challenge solution passes its own checks', () => {
  for (const challenge of CHALLENGES) {
    const regex = new RegExp(challenge.solution);
    for (const text of challenge.mustMatch) assert.ok(regex.test(text), `${challenge.title}: should match ${text}`);
    for (const text of challenge.mustNotMatch) assert.ok(!regex.test(text), `${challenge.title}: should not match ${text}`);
  }
});
