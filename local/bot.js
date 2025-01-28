require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const channelId = process.env.CHANNEL_ID;

async function fetchFreeGame() {
  try {
    const response = await axios.get(
      'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions'
    );
    const games = response.data.data.Catalog.searchStore.elements;

    const freeGames = games.filter(
      (game) => game.promotions && game.promotions.promotionalOffers.length > 0
    );

    if (freeGames.length === 0)
      return 'Nincsenek ingyenes játékok ezen a héten :(';

    let message = '**Heti ingyenes Epic játék(ok):**\n';

    freeGames.forEach((game) => {
      const title = game.title;
      const url = `https://store.epicgames.com/p/${game.catalogNs.mappings[0].pageSlug}`;
      const offerEndDate = new Date(
        game.promotions.promotionalOffers[0].promotionalOffers[0].endDate
      );

      message += `\n🎮 **${title}**\n🔗 [Húzd be itt](${url})\n🕒 Eddig érhető el ingyen: ${offerEndDate
        .toLocaleString('se-SE', { timeZone: 'Europe/Budapest' })
        .replaceAll('-', '.')
        .replace(' ', '. ')}\n\n`;
    });
    console.log(message);
    return message;
  } catch (error) {
    console.error('Error fetching free games:', error);
    return 'Hiba történt a játékok lekérése során.';
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule the bot to send a message every Thursday at 11:00 UTC
  //   schedule.scheduleJob('* * * * *', async () => {
  // const channel = await client.channels.fetch(channelId);
  const message = await fetchFreeGame();
  // channel.send(message);
  //   });
});

client.login(process.env.DISCORD_TOKEN);
