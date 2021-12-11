const fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'stats',
	description: 'see your stats',
	async execute(interaction,currency){
		const target = interaction.options.getUser('user') ?? interaction.user;
		
		const balance = await currency.getBalance(target.id);
		
		const guildID = interaction.guildId;
		const user = await currency.get(target.id);
		await user.addGuild(guildID);
		
		const statsEmbed = new MessageEmbed()
			.setColor('#7700E6')
			.setTitle(`${target.username}'s Stats`)
			.setThumbnail(target.displayAvatarURL())
			.addFields(
				{ name: 'Balance', value: `${balance}`, inline: true},
				{ name: 'Wins', value: `${await currency.getWin(target.id)}`, inline: true},
				{ name: 'Loses', value: `${await currency.getLoss(target.id)}`, inline: true},
			);
		interaction.reply({embeds:[statsEmbed],ephemeral: true});
	}
}