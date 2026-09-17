# Normalized Message Contract

`normalizeMessage(rawMessage, options)` mengembalikan object pesan publik dengan bentuk:

```js
{
  id: string | null,
  chat: string | null,
  sender: string | null,
  fromMe: boolean,
  isGroup: boolean,
  type: string | null,
  txt: string,
  text: string,
  mentions: string[],
  quoted: object | null,
  reply: Function,
  isAdmin: Promise<boolean>,
  isBotAdmin: Promise<boolean>,
  raw: object
}
```

Aturan:

- `id`, `chat`, dan `sender` berasal dari `rawMessage.key`; sender private fallback ke chat.
- `isGroup` bernilai true jika chat berakhiran `@g.us`.
- `type` mengambil tipe payload utama selain metadata internal.
- `txt` dan `text` mengambil conversation, text, caption, atau interactive selected ID.
- `mentions` berasal dari `contextInfo.mentionedJid` dan selalu berupa array.
- `quoted` berisi id, sender, type, text, dan raw quoted payload jika tersedia; jika tidak, `null`.
- `reply(content, chatId?, options?)` mengirim string sebagai `{ text }` atau meneruskan object payload melalui socket.
- `isAdmin` dan `isBotAdmin` berupa Promise lazy yang aman menjadi false jika socket/metadata tidak tersedia atau fetch gagal.
- Input null atau tanpa `message` tetap menghasilkan object aman dengan text kosong.
