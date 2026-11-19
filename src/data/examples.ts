// Ready-made patterns for the "Examples" window.
// Each sample line is put in the test text when the example is loaded.
// Patterns anchored with ^ and $ use the m flag so they are checked line by line.

export interface Example {
  name: string;
  category: 'Web' | 'Security' | 'Numbers' | 'Dates' | 'Contact' | 'Code';
  description: string;
  pattern: string;
  flags: string;
  sample: string[];
}

export const EXAMPLES: Example[] = [
  {
    name: 'Email address',
    category: 'Web',
    description: 'A simple, practical email check: name, @, domain, and a dot plus at least 2 letters.',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'gm',
    sample: ['developer@regexlab.dev', 'sarah.connor+filter@sky.net.io', 'not-an-email', 'missing@domain', '@missing-user.com'],
  },
  {
    name: 'Web link (http / https)',
    category: 'Web',
    description: 'Finds http and https links inside text, including paths, query strings and #fragments.',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_+.~#?&/=]*',
    flags: 'gi',
    sample: [
      'Docs live at https://regexlab.dev/guide?tab=flags#groups',
      'Mirror: http://example.com:8080/files',
      'Not a link: ftp://files.example.com or just-text',
    ],
  },
  {
    name: 'IPv4 address',
    category: 'Web',
    description: 'Four numbers from 0 to 255 separated by dots.',
    pattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    flags: 'gm',
    sample: ['192.168.1.1', '127.0.0.1', '255.255.255.255', '256.100.0.1', '192.168.1'],
  },
  {
    name: 'IPv6 address (full form)',
    category: 'Web',
    description: 'Eight groups of 1-4 hex digits. Does not handle the short :: form.',
    pattern: '^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$',
    flags: 'gim',
    sample: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'fe80:0:0:0:204:61ff:fe9d:f156', '2001:db8::7334', '192.168.1.1'],
  },
  {
    name: 'MAC address',
    category: 'Web',
    description: 'Six pairs of hex digits separated by colons or dashes.',
    pattern: '^(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$',
    flags: 'gm',
    sample: ['00:1A:2B:3C:4D:5E', '00-1a-2b-3c-4d-5e', '001A2B3C4D5E', '00:1A:2B:3C:4D'],
  },
  {
    name: 'Strong password',
    category: 'Security',
    description: 'At least 8 characters with a lowercase letter, an uppercase letter, a digit and a symbol. Uses lookaheads.',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: 'gm',
    sample: ['P@ssw0rd2026', 'Secure#Lab99', 'alllowercase1!', 'NoSymbol123', 'Sh0rt!'],
  },
  {
    name: 'Username',
    category: 'Security',
    description: '3 to 20 characters, starting with a letter. Letters, digits and underscores only.',
    pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,19}$',
    flags: 'gm',
    sample: ['alex_turner', 'DevMaster99', '99player', 'ab', 'user@name'],
  },
  {
    name: 'JSON Web Token (shape only)',
    category: 'Security',
    description: 'Three base64url parts separated by dots. Checks the shape, not the signature.',
    pattern: '^[\\w-]+\\.[\\w-]+\\.[\\w-]+$',
    flags: 'gm',
    sample: [
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      'only.two',
      'no-dots-at-all',
    ],
  },
  {
    name: 'Hex color',
    category: 'Numbers',
    description: 'CSS colors like #FFF, #38bdf8 or #10b98180 (3, 4, 6 or 8 hex digits).',
    pattern: '^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
    flags: 'gm',
    sample: ['#38bdf8', '#FFF', '#10b98180', '38bdf8', '#12345', '#GGG'],
  },
  {
    name: 'US dollar amount',
    category: 'Numbers',
    description: 'Dollar sign, commas every three digits, and optional cents.',
    pattern: '^\\$(?:0|[1-9]\\d{0,2}(?:,\\d{3})*)(?:\\.\\d{2})?$',
    flags: 'gm',
    sample: ['$1,234.56', '$0.99', '$10,000,000.00', '1234.56', '$1,23.45'],
  },
  {
    name: 'Credit card number (shape only)',
    category: 'Numbers',
    description: 'Visa, Mastercard, Amex or Discover numbers written without spaces. Does not run the Luhn checksum.',
    pattern: '^(?:4\\d{12}(?:\\d{3})?|5[1-5]\\d{14}|3[47]\\d{13}|6(?:011|5\\d{2})\\d{12})$',
    flags: 'gm',
    sample: ['4111111111111111', '5500000000000004', '378282246310005', '1234567890123456'],
  },
  {
    name: 'Date (YYYY-MM-DD)',
    category: 'Dates',
    description: 'Month 01-12 and day 01-31. A regex cannot know that February has fewer days, so 2026-02-31 passes.',
    pattern: '^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    flags: 'gm',
    sample: ['2026-10-19', '1999-12-31', '2026-02-31', '2026-13-01', '19-10-2026'],
  },
  {
    name: '24-hour time',
    category: 'Dates',
    description: 'HH:MM or HH:MM:SS from 00:00 to 23:59.',
    pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?$',
    flags: 'gm',
    sample: ['14:30', '23:59:59', '00:00', '24:00', '12:60', '9:30'],
  },
  {
    name: 'International phone number',
    category: 'Contact',
    description: 'E.164 format: a + followed by up to 15 digits, no spaces.',
    pattern: '^\\+[1-9]\\d{1,14}$',
    flags: 'gm',
    sample: ['+14155552671', '+442071838750', '+919876543210', '07123456789', '+0123456'],
  },
  {
    name: 'US ZIP code',
    category: 'Contact',
    description: '5 digits, optionally followed by a dash and 4 more digits.',
    pattern: '^\\d{5}(?:-\\d{4})?$',
    flags: 'gm',
    sample: ['94107', '10001-1234', '9410', '941071234'],
  },
  {
    name: 'Version number (SemVer)',
    category: 'Code',
    description: 'MAJOR.MINOR.PATCH with an optional -pre-release and +build part.',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-([0-9A-Za-z.-]+))?(?:\\+([0-9A-Za-z.-]+))?$',
    flags: 'gm',
    sample: ['1.0.0', '2.1.3-beta.1+build.42', '0.14.2-alpha', 'v1.0.0', '1.0'],
  },
  {
    name: 'UUID (version 4)',
    category: 'Code',
    description: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a or b.',
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
    flags: 'gm',
    sample: ['2c5e7816-3446-4f0d-9760-b3b7cca27471', '2c5e7816-3446-1f0d-9760-b3b7cca27471', 'not-a-valid-uuid'],
  },
  {
    name: 'HTML tag',
    category: 'Code',
    description: 'An opening tag, and its matching closing tag when there is one. \\1 reuses the tag name from group 1.',
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(?:.*?<\\/\\1>)?',
    flags: 'g',
    sample: ['<div class="card">Hello</div>', '<img src="logo.png" alt="Logo" />', 'just regular text'],
  },
];
