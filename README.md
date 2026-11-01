# posix-character-class-expander

Translates POSIX bracket expressions like `[:alpha:]` into equivalent Unicode-aware regular expression character classes.

```js
import { expand, classNames } from 'posix-character-class-expander';

expand('^[[:alpha:]][[:digit:]]+$');
// => '^[A-Za-z][0-9]+$'

classNames();
// => ['alnum', 'alpha', 'ascii', 'blank', 'cntrl', 'digit', 'graph',
//     'lower', 'print', 'punct', 'space', 'upper', 'word', 'xdigit']
```

## Why this exists

POSIX bracket expressions are portable and readable, but JavaScript's `RegExp`
constructor does not understand them. Rewriting them by hand is tedious and
error-prone, especially for classes whose POSIX definition differs from the
Unicode shorthand you might reach for first. This library performs the
translation once, in a single pass, so a pattern can be written in POSIX form
and compiled by a JavaScript engine unchanged.

The trade-off: the expansion is textual, not syntactic. It does not parse the
surrounding regex, so it will also rewrite a `[:alpha:]` token that appears
inside a character class, a comment, or a string literal. That is the right
choice for the common case (feeding a whole pattern through the expander) and
the wrong choice if you need to preserve literal text. If you need the latter,
run the expander only on the fragments you know are POSIX expressions.

## The awkward edge

`[:word:]` is mapped to `[0-9A-Za-z_]`, the POSIX definition. JavaScript's
`\w` is the same set in the default (non-Unicode) mode, but if you were
expecting Unicode letters to be included, they are not. The same applies to
`[:alpha:]`, which is ASCII-only here. This matches POSIX and the C locale,
which is what the class names mean.

## API

### `expand(input: string): string`

Replaces every known `[:name:]` token in `input` with the corresponding
character-class source. Unknown or malformed tokens are left untouched.
Throws `TypeError` if `input` is not a string.

### `classNames(): string[]`

Returns the sorted list of supported class names (without the surrounding
`[: :]`).

### `POSIX_CLASSES`

A frozen object mapping each supported class name to its expansion. Exposed so
callers can inspect or reuse the mapping without re-deriving it.
