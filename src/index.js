// Public entry point for posix-character-class-expander.
//
// Re-exporting from a single module keeps the package surface small and makes
// the README's import example the canonical way to consume the library.

export { expand, classNames, POSIX_CLASSES } from './core.js';
