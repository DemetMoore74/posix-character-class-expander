// Core translation logic for POSIX character classes.
//
// We keep this module dependency-free and side-effect-free so it can be used
// from any ESM environment, including browsers, without a bundler.

/**
 * Mapping of POSIX class names (without the surrounding `[: :]`) to the
 * Unicode-aware regular expression source that represents the same set.
 *
 * The POSIX standard defines these classes over the C locale's character
 * set. Modern regex engines work on Unicode code points, so we expand each
 * class to the closest Unicode equivalent. Where POSIX and Unicode disagree
 * (notably `[:word:]` and `[:blank:]`), we choose the POSIX meaning because
 * that is what callers of a POSIX expander expect.
 */
export const POSIX_CLASSES = Object.freeze({
  alnum: '0-9A-Za-z',
  alpha: 'A-Za-z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E',
  punct: '!"#$%&\'()*+,\\-./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\n\\v\\f\\r',
  upper: 'A-Z',
  word: '0-9A-Za-z_',
  xdigit: '0-9A-Fa-f',
});

/**
 * Matches a single POSIX bracket-expression token: `[:name:]`.
 * The name is restricted to the POSIX class names we know about so that we
 * never silently rewrite something the caller did not intend.
 */
const POSIX_TOKEN = /\[:(alnum|alpha|ascii|blank|cntrl|digit|graph|lower|print|punct|space|upper|word|xdigit):\]/g;

/**
 * Expand every POSIX class token in `input` to its Unicode-aware character
 * class source.
 *
 * The function is deliberately total: unknown `[:...:]` tokens are left
 * untouched rather than throwing. This makes the expander safe to run over
 * arbitrary user input, which is the common case when building a regex from
 * a user-supplied pattern.
 *
 * @param {string} input - A string that may contain POSIX class tokens.
 * @returns {string} The input with known tokens replaced.
 */
export function expand(input) {
  if (typeof input !== 'string') {
    throw new TypeError('expand() expects a string');
  }
  return input.replace(POSIX_TOKEN, (match, name) => POSIX_CLASSES[name]);
}

/**
 * The set of POSIX class names this library understands, without the
 * surrounding `[: :]`. Callers can use this to validate user input before
 * calling `expand`.
 *
 * @returns {string[]} A sorted array of class names.
 */
export function classNames() {
  return Object.keys(POSIX_CLASSES).sort();
}
