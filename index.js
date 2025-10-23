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

let spamInterval = null;

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
  const chat = await msg.getChat();

  // Oprire spam
  if (text === '/stop') {
    if (spamInterval) {
      clearInterval(spamInterval);
      spamInterval = null;
      await msg.reply('⛔ Spam oprit.');
    } else {
      await msg.reply('⚠️ Nu era activ niciun spam.');
    }
    return;
  }

  // Activare spam la intervale
  const match = text.match(/^\/start(\d+)$/);
  if (match) {
    const seconds = parseInt(match[1]);
    const spam = getSpamMessage();

    if (spamInterval) clearInterval(spamInterval); // oprim orice spam anterior

    spamInterval = setInterval(() => {
      chat.sendMessage(spam);
    }, seconds * 1000);

    await msg.reply(`✅ Spam activat la fiecare ${seconds} secunde.`);
    return;
  }

  // Răspuns general
  if (text.includes('salut')) {
    await msg.reply('Salut! Cu ce te pot ajuta?');
  }
});
