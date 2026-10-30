// Types for presets and challenges

export interface PatternItem {
  id: string;
  name: string;
  category: 
    | 'Web & Network' 
    | 'Security & Auth' 
    | 'Data & Numbers' 
    | 'Dates & Times' 
    | 'Telephony & Location' 
    | 'Programming';
  description: string;
  regex: string;
  flags: string;
  tags: string[];
  testCases: {
    input: string;
    shouldMatch: boolean;
  }[];
}

export interface Challenge {
  id: string;
  title: string;
  level: 'Novice' | 'Apprentice' | 'Adept' | 'Master' | 'Grandmaster';
  instructions: string;
  hint: string;
  starterPattern: string;
  mustMatch: string[];
  mustNotMatch: string[];
}
