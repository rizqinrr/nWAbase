# T21 — Parser command teks

## Tujuan
Memisahkan prefix, command, args, dan text dari normalized message.

## Acceptance criteria
- [x] Prefix tunggal dan multi-prefix didukung.
- [x] Command lowercase.
- [x] Pesan non-prefix menghasilkan no command.
- [x] Whitespace ditangani konsisten.

## Verification
- Test parser pure function.

## Dependencies
T06, T14.

## Files
- `src/core/handler.js`
- `tests/command-parser.test.js`

## Scope
S — parser dan test.
