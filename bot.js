const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth.json');

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});

sock.ev.on('creds.update', saveState);

let spamActive = false;

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const text = msg.message.conversation || '';
  const jid = msg.key.remoteJid;

  if (text === '/start') {
    spamActive = true;
    await sock.sendMessage(jid, { text: '✅ Spam activat.' });
  }

  if (text === '/stop') {
    spamActive = false;
    await sock.sendMessage(jid, { text: '⛔ Spam oprit.' });
  }

  if (text === '/spam' && spamActive) {
    const spam = fs.readFileSync('spam.txt', 'utf8');
    await sock.sendMessage(jid, { text: spam });
  }
});
