const functions = require('firebase-functions/v1');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const channelId = process.env.DISCORD_CHANNEL_ID;
const discordToken = process.env.DISCORD_TOKEN;

async function fetchFreeGame() {
  try {
    const response = await axios.get(
      'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions'
    );
    const games = response.data.data.Catalog.searchStore.elements;

    const freeGames = games.filter(
      (game) =>
        game.promotions &&
        game.promotions.promotionalOffers.length > 0 &&
        game.promotions.promotionalOffers[0].promotionalOffers[0]
          .discountSetting.discountPercentage === 0
    );

    if (freeGames.length === 0)
      return 'Nincsenek ingyenes játékok ezen a héten :(';

    let message = '**Heti ingyenes Epic játék(ok):**\n';
    freeGames.forEach((game) => {
      const title = game.title;
      const url = `https://store.epicgames.com/p/${game.productSlug}`;
      const offerEndDate = new Date(
        game.promotions.promotionalOffers[0].promotionalOffers[0].endDate
      );
      const localizedEndDate = offerEndDate.toLocaleString('se-SE', {
        timeZone: 'Europe/Budapest',
      });
      const formattedEndDate = localizedEndDate
        .replaceAll('-', '.')
        .replace(' ', '. ');
      const offerEndHour = localizedEndDate.substring(
        localizedEndDate.indexOf(' ') + 1,
        localizedEndDate.indexOf(' ') + 3
      );
      const offerEndHourForEmoji = offerEndHour % 12 ? offerEndHour % 12 : 12;
      const offerEndMinute =
        offerEndDate.getMinutes() % 60 ? offerEndDate.getMinutes() % 60 : '';
      const offerEndTimeEmoji = `:clock${offerEndHourForEmoji}${offerEndMinute}:`;

      message += `\n🎮 **${title}**\n🔗 [Húzd be itt](${url})\n${offerEndTimeEmoji} Eddig érhető el ingyen: ${formattedEndDate}\n\n`;
    });
    console.log(message);
    return message;
  } catch (error) {
    console.error('Error fetching free games:', error);
    return 'Hiba történt a játékok lekérése során.';
  }
}

// Scheduled function
exports.scheduleFreeGameAnnouncement = functions.pubsub
  // .schedule('every Thursday 11:00') // Schedule (UTC)
  .schedule('5 17 * * 4') // Schedule (UTC)
  .timeZone('Europe/Budapest') // Set timezone (adjust if necessary)
  .onRun(async (context) => {
    await client.login(discordToken);
    const channel = await client.channels.fetch(channelId);
    const message = await fetchFreeGame();
    await channel.send(message);
    console.log('Free game announcement sent!');
  });
