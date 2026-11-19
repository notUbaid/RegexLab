// Shared data shapes for the engine. The UI only ever reads these.

export type TokenKind =
  | 'literal' // a plain character, e.g. a or \.
  | 'class' // matches one character from a set, e.g. \d [a-z] .
  | 'anchor' // matches a position, not a character, e.g. ^ $ \b
  | 'quantifier' // repeats the previous item, e.g. + * ? {2,4}
  | 'group-open' // ( (?: (?<name> (?= ...
  | 'group-close' // )
  | 'or' // |
  | 'backreference'; // \1 .. \9

/** One meaningful piece of a pattern, with its position and a plain-English description. */
export interface Token {
  kind: TokenKind;
  raw: string;
  start: number;
  end: number;
  /** How many groups this token sits inside. Used to indent the explanation. */
  depth: number;
  description: string;
  /** Set on capturing group-open / group-close tokens. */
  groupNumber?: number;
}

/** A capture group inside one match. */
export interface Group {
  number: number;
  name?: string;
  text: string;
  start: number;
  end: number;
}

/** One match of the pattern in the test text. `end` is exclusive, like String.slice. */
export interface Match {
  text: string;
  start: number;
  end: number;
  groups: Group[];
}
