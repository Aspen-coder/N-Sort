// src/utils/profanity.ts
export type ProfanityOptions = {
  // words are matched as whole words with Unicode boundaries
  words?: string[];
  whitelist?: string[]; // words allowed even if they look profane
  maskChar?: string;    // replacement char for censor
};

const DEFAULT_WORDS = [
  // keep this small; extend as needed (store server-side for robustness)
  "ass", "asshole", "bastard", "bitch", "bloody", "bollocks",
  "crap", "cunt", "damn", "dick", "douche", "fuck", "fucker",
  "fucking", "motherfucker", "piss", "prick", "shit", "slut",
  "whore", "nigger", "cum", "jerk off", "jack off", "porn"
];

// Common false positives to allow (example list; tweak for your app)
const DEFAULT_WHITELIST = [
  "pass", "class", "assignment", "assistant", "bass", "Scunthorpe",
  "Dickinson", "cocktail", "esse", "assess"
];

// Map common leetspeak/variants for detection
const VARIANT_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "$": "s",
  "5": "s",
  "0": "o",
  "1": "i",
  "!": "i",
  "3": "e",
  "7": "t"
};

function normalize(input: string): string {
  // lower, strip diacritics, translate common l33t chars
  const folded = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}+/gu, "");
  return [...folded].map(ch => VARIANT_MAP[ch] ?? ch).join("");
}

function escapeRegex(word: string) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ProfanityFilter {
  private patterns: RegExp[];
  private whitelistSet: Set<string>;
  private maskChar: string;

  constructor(opts: ProfanityOptions = {}) {
    const words = (opts.words ?? DEFAULT_WORDS).map(w => normalize(w));
    const whitelist = (opts.whitelist ?? DEFAULT_WHITELIST).map(w => normalize(w));

    // Build whole-word Unicode boundary patterns
    this.patterns = words
      .filter(w => w.trim().length > 1)
      .map(w => new RegExp(`\\b${escapeRegex(w)}\\b`, "giu"));

    this.whitelistSet = new Set(whitelist);
    this.maskChar = opts.maskChar ?? "*";
  }

  /** Returns true if any profane word is found (respecting whitelist). */
  isProfane(text: string): boolean {
    const norm = normalize(text);
    // Tokenize on word boundaries to apply whitelist accurately
    const tokens = norm.match(/\p{L}+/gu) ?? [];
    const allowed = new Set(tokens.filter(t => this.whitelistSet.has(t)));
    for (const rx of this.patterns) {
      rx.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rx.exec(norm))) {
        if (!allowed.has(m[0])) return true;
      }
    }
    return false;
  }

  /** Returns the text with profanities masked (does not touch whitelist). */
  censor(text: string): string {
    // Work on normalized indices, then map back via simple strategy:
    // Split original into words, check each normalized token, mask if needed.
    const words = text.split(/(\b)/); // keep boundaries
    return words
      .map(chunk => {
        const norm = normalize(chunk);
        if (!/\p{L}/u.test(norm)) return chunk; // punctuation/space
        if (this.whitelistSet.has(norm)) return chunk;

        // If any pattern matches the normalized chunk as a *whole word*, mask it
        const isBad = this.patterns.some(rx => rx.test(norm));
        return isBad ? this.maskChar.repeat([...chunk].length) : chunk;
      })
      .join("");
  }

  addWords(words: string[]) {
    for (const w of words.map(normalize)) {
      if (w.length > 1) this.patterns.push(new RegExp(`\\b${escapeRegex(w)}\\b`, "giu"));
    }
  }

  removeWords(words: string[]) {
    const toRemove = new Set(words.map(normalize));
    this.patterns = this.patterns.filter(rx => !toRemove.has(rx.source.replace(/^\\b|\b$/g, "")));
  }

  addWhitelist(words: string[]) {
    words.map(normalize).forEach(w => this.whitelistSet.add(w));
  }

  removeWhitelist(words: string[]) {
    words.map(normalize).forEach(w => this.whitelistSet.delete(w));
  }
}

// Convenience singleton
export const profanityFilter = new ProfanityFilter();