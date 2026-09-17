# T15 — Test message normalizer

## Tujuan
Menguji normalizer dengan fixture text, group, media caption, dan empty message.

## Acceptance criteria
- [ ] Fixture private text lulus.
- [ ] Fixture group text lulus.
- [ ] Caption media lulus.
- [ ] Message invalid diabaikan secara aman.

## Verification
- `npm test -- tests/message.test.js`

## Dependencies
T14.

## Files
- `tests/message.test.js`
- `tests/fixtures/messages.js`

## Scope
S — test module.
