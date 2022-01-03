const fs = require('fs');
const { Formatters, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'leaderboard',
	description: 'see whose best',
	async execute(interaction,currency,client){
		await interaction.deferReply();
		const guildID = interaction.guildId;
		
		let leaderboardMsg = "Leaderboard:\n";
		
		let result = currency.sort((a, b) => b.balance - a.balance);
		result = result.first(10);
		let position = 1;
		for(let i=0;i<result.length;i++){
			const user = await currency.get(result[i].dataValues.user_id);
			const stats = await user.getStats();
			const username = await interaction.guild.members.fetch(user.user_id).then(userf => {return userf.displayName});
			leaderboardMsg += `(${position}) ${username}: ${user.balance}💰 Lvl: ${stats.lvl}\n`;
			position++;
		}
		
		return interaction.editReply({
			content:
				Formatters.codeBlock(
						leaderboardMsg
				),
			ephemeral: true
		});
	}
}

/*

.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
						.join('\n'),

*/