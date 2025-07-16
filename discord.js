const { EmbedBuilder, WebhookClient } = require('discord.js');

const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1394480007849443408/_9QGnvReWrGwPyWif1Y2IePIWpCtMPWgb17iao0ZbesNfvQnd8SF7vQru07HU6uQWyay' });

function _sendMessage(msg, embed) {
  webhookClient.send({
    content: msg,
    username: 'scraper',
		embeds: embed ? [embed] : []
  })
}

module.exports = {
  sendMessage(msg, title, desc) {
    if (!msg) return 

    if (msg.length > 2000) {
      console.log('message too long. not sending.')
      return
    }

		if (!title && !desc) {
			_sendMessage(msg)
			return
		}
			
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(desc)
		
		_sendMessage(msg, embed)
  }
}

