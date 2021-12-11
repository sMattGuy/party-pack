const fs = require('fs');
const { Formatters, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'leaderboard',
	description: 'see whose best',
	async execute(interaction,currency,client){
		return interaction.reply(
			{content: Formatters.codeBlock(
				currency.sort((a,b) => b.balance - a.balance)
					.filter(user => client.users.cache.has(user.user_id))
					.first(10)
					.map((user, position) => `(${position + 1})${(client.users.cache.get(user.user_id).tag)}: ${user.balance} coin`)
					.join('\n'),
			),ephemeral: true
			}
		);
	}
}