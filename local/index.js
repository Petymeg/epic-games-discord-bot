const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const channelId =
  process.env.DISCORD_CHANNEL_ID || functions.config().discord.channel_id;
const discordToken =
  process.env.DISCORD_TOKEN || functions.config().discord.token;

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
      const pageSlug = game.productSlug || game.catalogNs.mappings[0].pageSlug;
      const url = `https://store.epicgames.com/p/${pageSlug}`;
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

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule the bot to send a message every Thursday at 11:00 UTC
  //   schedule.scheduleJob('0 11 * * 4', async () => {
  const channel = await client.channels.fetch(channelId);
  const message = await fetchFreeGame();
  //     channel.send(message);
  //   });
});

exports.discordBot = async () => {
  await client.login(discordToken);
};
