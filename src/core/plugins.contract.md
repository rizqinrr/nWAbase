# Plugin Contract

Plugin files use a default-exported object:

```js
export default {
  name: 'ping',
  command: ['ping'],
  alias: ['p'],
  category: 'example',
  description: 'Memeriksa status bot',
  ownerOnly: false,
  groupOnly: false,
  privateOnly: false,
  adminOnly: false,
  botAdminOnly: false,
  typing: false,
  wait: false,
  async execute(m, context) {
    await m.reply('Pong!')
  }
}
```

Required fields:

- `command`: non-empty string or array of non-empty strings.
- `execute`: function.

Optional metadata:

- `name`, `alias`/`aliases`, `category`, `description`.
- `ownerOnly`, `groupOnly`, `privateOnly`, `adminOnly`, `botAdminOnly`.
- `typing`, `wait`.

Execution context contains `sock`, `args`, `text`, `command`, `prefix`, `isOwner`, `settings`, and `utils`.

Commands and aliases are normalized to lowercase and trimmed. Empty values are rejected. Duplicate triggers are rejected across the candidate registry. `customPrefix`, premium users, and trusted users are not part of the MVP contract.
