const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'rps',
	description: 'rock paper scissors',
	async execute(interaction){
		await interaction.reply(`Starting RPS`);
		//check command is correctly entered
		//assign challenger
		let challengerID = interaction.user.id;
		let challengerName = interaction.user.username;
		let challenger = interaction.user;
		let optionOpp = await interaction.options.getUser('user');
		let opponentID = optionOpp.id;
		let opponentName = optionOpp.username;

		//check if trying to battle self
		
		if(opponentID == challengerID){
			await interaction.editReply('You try to verse yourself and lost... how sad');
			return;
		}
		
		if(optionOpp.bot){
			await interaction.editReply(`Robots don't like RPS!`);
			return;
		}
		
		//get the acceptance of battle
		const startFilter = i => i.user.id === opponentID && (i.customId === 'accept' || i.customId === 'deny');
		const accRow = new MessageActionRow()
			.addComponents(
			new MessageButton()
				.setCustomId('accept')
				.setLabel('Accept')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('deny')
				.setLabel('Deny')
				.setStyle('DANGER'),
		);
		const accCollector = await interaction.channel.createMessageComponentCollector({filter:startFilter, time: 60000});
		let noGame = true;
		await interaction.editReply({content:`${opponentName}! Type 'accept' to accept the rock paper scissors battle, or type 'deny' to refuse the battle! You have 1 min to respond!`,components:[accRow]}).then(msg => {
			accCollector.once('collect', async buttInteraction => {
				noGame = false;
				if(buttInteraction.customId == 'accept'){
					acceptRPS();
				}
				else if(buttInteraction.customId == 'deny'){
					await buttInteraction.update({content:`You have declined the game!`,components:[]});
					return;
				}
			});
			accCollector.once('end',async collected => {
				if(noGame){
					await interaction.deleteReply().catch(e => console.log('no interaction exists'));
				}
			});
		});
		async function acceptRPS(){
			//begin battle
			interaction.editReply({content:`Getting challengers throw, please wait!`,components:[]});
			const filter = i => i.customId === 'rock' || i.customId === 'paper' || i.customId === 'scissors';
			const gameRow = new MessageActionRow()
				.addComponents(
				new MessageButton()
					.setCustomId('rock')
					.setLabel('Rock')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('paper')
					.setLabel('Paper')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('scissors')
					.setLabel('Scissors')
					.setStyle('PRIMARY'),
			);
			const challDM = await challenger.createDM();
			const oppDM = await optionOpp.createDM();
			const challengerCollector = await challDM.createMessageComponentCollector({filter,time:60000});
			const opponentCollector = await oppDM.createMessageComponentCollector({filter,time:60000});
			let noChall = true;
			let noOpp = true;
			challenger.send({content:`Select a throw!`,components:[gameRow]}).then(challMsg => {
				challengerCollector.once('collect', async bi => {
					noChall = false;
					bi.update({content:`Got it, going to get opponents throw now`,components:[]});
					optionOpp.send({content:`Select a throw!`,components:[gameRow]}).then(oppMsg => {
						opponentCollector.once('collect', async obi => {
							noOpp = false;
							await bi.editReply({content:`Go back to the channel you were challenged to see who wins!`,components:[]});
							await obi.update({content:`Go back to the channel you were challenged to see who wins!`,components:[]});
							let challThrow = bi.customId;
							let oppThrow = obi.customId;
							
							if(challThrow != 'rock' && challThrow != 'scissors' && challThrow != 'paper' && oppThrow != 'rock' && oppThrow != 'scissors' && oppThrow != 'paper'){
								await interaction.editReply(`Someone didn't choose correctly, the match is canceled!`);
							}
							else if(challThrow == 'rock' && oppThrow == 'scissors'){
								await interaction.editReply(`${challengerName} threw rock, ${opponentName} threw scissors\n${challengerName} won!`);
							}
							else if(challThrow == 'scissors' && oppThrow == 'paper'){
								await interaction.editReply(`${challengerName} threw scissors, ${opponentName} threw paper\n${challengerName} won!`);
							}
							else if(challThrow == 'paper' && oppThrow == 'rock'){
								await interaction.editReply(`${challengerName} threw paper, ${opponentName} threw rock\n${challengerName} won!`);
							}
							else if(challThrow == oppThrow){
								await interaction.editReply(`${challengerName} threw ${challThrow}, ${opponentName} threw ${oppThrow}\nIt's a tie!`);
							}
							else{
								await interaction.editReply(`${challengerName} threw ${challThrow}, ${opponentName} threw ${oppThrow}\n${opponentName} won!`);
							}
						});
						opponentCollector.once('end',collected => {
							if(noOpp){
								interaction.editReply(`Opponent didn't respond in time!`);
								oppMsg.delete();
							}
						});
					});
				});
				challengerCollector.once('end',collected => {
					if(noOpp){
						interaction.editReply(`Challenger didn't respond in time!`);
						challMsg.delete();
					}
				});
			});
		}
	}
}