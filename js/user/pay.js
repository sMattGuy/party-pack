const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'pay',
	description: 'pay someone',
	async execute(interaction,currency){
		
		//check command is correctly entered
		//assign challenger
		let giverID = interaction.user.id;
		let giverName = interaction.user.username;

		let getter = await interaction.options.getUser('user');
		let getterID = getter.id;
		let getterName = getter.username;
		let giveAmount = interaction.options.getInteger('amount');
		//check if trying to battle self
		
		if(getterID == giverID){
			await interaction.reply({content:`You gave yourself ${giveAmount} coin! How pointless!`,ephemeral: true});
			return;
		}
		
		if(getter.bot){
			await interaction.reply({content: `Robots have no need for money!`,ephemeral: true});
			return;
		}
		
		if(giveAmount <= 0){
			await interaction.reply({content: `Invalid amount!`,ephemeral: true});
			return;
		}
		if(await currency.getBalance(giverID) - giveAmount < 0){
			await interaction.reply({content: `You don't have enough coin!`,ephemeral: true});
			return;
		}
		
		//force creation of new user if they dont exist
		await currency.getBalance(getterID);
		
		const guildID = interaction.guildId;
		const user = await currency.get(giverID);
		await user.addGuild(guildID);
		
		user = await currency.get(getterID);
		await user.addGuild(guildID);
		
		//cleared to give
		/*
			not giving to self
			not giving to bot
			both users exist
			value not negative
		*/
		currency.subBalance(giverID, giveAmount);
		currency.addBalance(getterID, giveAmount);
		
		return interaction.reply(`${giverName} has given ${giveAmount} coin to ${getterName}!`);
	}
}