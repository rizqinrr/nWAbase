# Configuration Contract

`src/config.js` membaca environment dan menghasilkan objek `settings` dengan bentuk berikut:

```js
{
  botName: string,
  owners: string[],
  prefixes: string[],
  pairingCode: string,
  usePairingCode: boolean,
  watchPlugins: boolean,
  sessionDbPath: string,
  appDbPath: string
}
```

Aturan kontrak:

- `BOT_NAME` default ke `nWAbase`; whitespace di awal dan akhir dihapus.
- `OWNER_NUMBER` default ke list kosong; nilainya comma-separated dan setiap item dibersihkan.
- `PREFIX` default ke `!`; nilainya comma-separated dan setiap item dibersihkan.
- `PAIRING_CODE` default ke string kosong; whitespace dihapus.
- `USE_PAIRING_CODE` default ke `true` dan hanya menerima `true`, `false`, `1`, atau `0` tanpa membedakan huruf besar-kecil.
- `WATCH_PLUGINS` default ke `false` dan hanya menerima `true`, `false`, `1`, atau `0` tanpa membedakan huruf besar-kecil.
- `SESSION_DB_PATH` default ke `./store/session.db`; path tidak boleh kosong.
- `APP_DB_PATH` default ke `./store/app.db`; path tidak boleh kosong.
- List dihasilkan dalam urutan input, tetapi item kosong setelah trimming diabaikan dan nilai duplikat dihapus.
- List yang hanya berisi pemisah atau whitespace menghasilkan error konfigurasi yang menyebut nama variable.
- Nilai boolean selain yang ditentukan menghasilkan error konfigurasi yang menyebut nama variable dan nilai invalid.
- Nilai path yang hanya berisi whitespace menghasilkan error konfigurasi yang menyebut nama variable.
- `OWNER_NUMBER` tetap berupa input konfigurasi pada tahap kontrak; normalisasi JID dilakukan oleh utilitas terpisah.
- Secret, session, dan nomor personal tidak boleh dimasukkan ke `.env.example`.
