export const privateTextMessage = {
  key: {
    id: 'private-1',
    remoteJid: '6281111111111@s.whatsapp.net',
    fromMe: false
  },
  message: {
    conversation: 'Halo bot'
  }
}

export const groupTextMessage = {
  key: {
    id: 'group-1',
    remoteJid: '120363000000000000@g.us',
    participant: '6282222222222@s.whatsapp.net',
    fromMe: false
  },
  message: {
    extendedTextMessage: {
      text: 'Halo @6283333333333',
      contextInfo: {
        mentionedJid: ['6283333333333@s.whatsapp.net']
      }
    }
  }
}

export const captionMessage = {
  key: {
    id: 'media-1',
    remoteJid: '6281111111111@s.whatsapp.net',
    fromMe: false
  },
  message: {
    imageMessage: {
      caption: 'Foto laporan',
      contextInfo: {
        mentionedJid: ['6286666666666@s.whatsapp.net']
      }
    }
  }
}

export const quotedMessage = {
  key: {
    id: 'quoted-1',
    remoteJid: '120363000000000000@g.us',
    participant: '6282222222222@s.whatsapp.net',
    fromMe: false
  },
  message: {
    extendedTextMessage: {
      text: 'Balas ini',
      contextInfo: {
        stanzaId: 'original-1',
        participant: '6284444444444@s.whatsapp.net',
        quotedMessage: {
          conversation: 'Pesan asli'
        }
      }
    }
  }
}
