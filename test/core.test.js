import { test } from 'node:test';
import assert from 'node:assert/strict';

import { expand, classNames, POSIX_CLASSES } from '../src/index.js';

test('expands a single alpha class', () => {
  assert.equal(expand('[:alpha:]'), 'A-Za-z');
});

test('expands a class embedded in a larger pattern', () => {
  assert.equal(expand('^[[:digit:]]+$'), '^[0-9]+$');
});

test('expands multiple classes in one string', () => {
  assert.equal(expand('[[:alpha:][:digit:]]'), '[A-Za-z0-9]');
});

test('leaves unknown class names untouched', () => {
  assert.equal(expand('[:nosuch:]'), '[:nosuch:]');
});

test('leaves malformed tokens untouched', () => {
  assert.equal(expand('[:alpha'), '[:alpha');
  assert.equal(expand('alpha:]'), 'alpha:]');
});

test('handles the empty string', () => {
  assert.equal(expand(''), '');
});

test('does not expand a bare name without brackets', () => {
  assert.equal(expand('alpha'), 'alpha');
});

test('expands word to POSIX meaning, not Unicode word', () => {
  // POSIX [:word:] is [A-Za-z0-9_], not the Unicode \w set.
  assert.equal(expand('[:word:]'), '0-9A-Za-z_');
});

test('classNames returns every supported name, sorted', () => {
  const names = classNames();
  assert.deepEqual(names, [
    'alnum',
    'alpha',
    'ascii',
    'blank',
    'cntrl',
    'digit',
    'graph',
    'lower',
    'print',
    'punct',
    'space',
    'upper',
    'word',
    'xdigit',
  ]);
});

test('POSIX_CLASSES is frozen', () => {
  assert.ok(Object.isFrozen(POSIX_CLASSES));
});

test('expand rejects non-string input', () => {
  assert.throws(() => expand(42), TypeError);
  assert.throws(() => expand(null), TypeError);
  assert.throws(() => expand(undefined), TypeError);
});

test('a replaced class is not re-scanned for further tokens', () => {
  // The replacement text for punct contains '[' and ']' but not '[:name:]',
  // so no double-expansion can occur. This test pins that property.
  assert.equal(expand('[:punct:]'), POSIX_CLASSES.punct);
  assert.equal(expand('[:punct:]').includes('[:'), false);
});
