const axios = require('axios');

const sendDiscordNotification = async ({ type, name, email, subject, message }) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const adminDashboardUrl = process.env.ADMIN_DASHBOARD_URL || 'https://sawt-medenine.vercel.app/admin';

  if (!webhookUrl) return console.error('❌ DISCORD_WEBHOOK_URL non défini');

  try {
    await axios.post(webhookUrl, {
      embeds: [{
        title: `📝 Nouvelle ${type} reçue`,
        description: message || subject,
        color: 0x1abc9c,
        fields: [
          { name: 'Nom', value: name, inline: true },
          { name: 'Email', value: email || 'Non fourni', inline: true },
          { name: 'Type', value: type, inline: true },
          { name: 'Lien Admin', value: `[Ouvrir Dashboard](${adminDashboardUrl})`, inline: false }
        ],
        timestamp: new Date()
      }]
    });
    console.log('✅ Notification Discord envoyée');
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi de la notification Discord:', error.message);
  }
};

module.exports = sendDiscordNotification;
