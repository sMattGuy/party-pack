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
		const stats = await user.getStats();
		await user.addGuild(guildID);
		const nextLevel = Math.floor((stats.exp/(25*Math.pow(stats.lvl, 2.6)))*100);
		const statsEmbed = new MessageEmbed()
			.setColor('#7700E6')
			.setTitle(`${target.username} Lvl ${stats.lvl} (${nextLevel}% to next)`)
			.setThumbnail(target.displayAvatarURL())
			.addFields(
				{ name: 'Balance', value: `${balance}`, inline: true},
				{ name: 'Wins', value: `${user.wins}`, inline: true},
				{ name: 'Loses', value: `${user.loses}`, inline: true},
				{ name: 'ATK', value: `${stats.atk}`, inline: true},
				{ name: 'DEF', value: `${stats.def}`, inline: true},
				{ name: 'CHR', value: `${stats.chr}`, inline: true},
				{ name: 'SPC', value: `${stats.spc}`, inline: true},
				{ name: 'INT', value: `${stats.inte}`, inline: true},
				{ name: 'QT', value: `100%`, inline: true},
			);
		interaction.reply({embeds:[statsEmbed],ephemeral: true});
	}
}