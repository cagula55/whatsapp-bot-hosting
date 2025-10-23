require('dotenv').config();
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
    headless: true
  }
});

let botActive = false;

// Citim mesajul de spam din spam.txt
const getSpamMessage = () => {
  try {
    return fs.readFileSync('spam.txt', 'utf8').trim();
  } catch (err) {
    console.error('❌ Nu pot citi spam.txt:', err);
    return '⚠️ Mesajul de spam nu e disponibil.';
  }
};

client.on('ready', () => {
  console.log('✅ Botul este online și conectat.');
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Botul s-a deconectat:', reason);
  client.initialize(); // reconectare automată
});

client.on('message', async msg => {
  const text = msg.body.toLowerCase();

  // Activare bot
  if (text === '/start') {
    botActive = true;
    await msg.reply('✅ Botul a fost activat.');
    return;
  }

  // Dezactivare bot
  if (text === '/stop') {
    botActive = false;
    await msg.reply('⛔ Botul a fost dezactivat.');
    return;
  }

  if (!botActive) return;

  // Trimite mesajul de spam
  if (text === '/spam') {
    const spam = getSpamMessage();
    await msg.reply(spam);
    return;
  }

  // Răspuns general
  if (text.includes('salut')) {
    await msg.reply('Salut! Cu ce te pot ajuta?');
  }
});
