const fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const Canvas = require('canvas');

function checkVictory(boardArray,col,row,id){
	//check vertical
	let count = 0;
	for(let i=0;i<boardArray[0].length;i++){
		if(boardArray[col][i] == id){
			count++;
		}
		else{
			count = 0;
		}
		if(count >= 4){
			return true;
		}
	}
	//check horizontal
	count = 0;
	for(let i=0;i<boardArray.length;i++){
		if(boardArray[i][row] == id){
			count++
		}
		else{
			count = 0;
		}
		if(count >= 4){
			return true;
		}
	}
	//check down right diagnol 
	for(let rowStart = 0;rowStart<boardArray[0].length - 3;rowStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = rowStart, colC = 0; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			//console.log('down right row'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down right diagnol 
	for(let colStart = 0;colStart<boardArray.length - 3;colStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = 0, colC = colStart; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			//console.log('down right col'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down left diagnol 
	for(let colStart = boardArray.length-1;colStart>2;colStart--){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = 0, colC = colStart; rowC < boardArray[0].length && colC >= 0;rowC++, colC--){
			//console.log('down left col'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down left diagnol 
	for(let rowStart = 0;rowStart<boardArray[0].length - 3;rowStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = rowStart, colC = boardArray.length-1; rowC < boardArray[0].length && colC >= 0;rowC++, colC--){
			//console.log('down left row'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	return false;
}

function checkTie(boardArray){
	for(let i=0;i<boardArray.length;i++){
		if(boardArray[i][0] == 0){
			return false;
		}
	}
	return true;
}

module.exports = {
	name: 'connect4',
	description: 'connect 4',
	async execute(interaction){
		await interaction.reply(`Playing Connect4`);
		let optionOpp = interaction.options.getUser('user');
		let workingID = interaction.user.id;
		let enemyID = optionOpp.id;
		let playerName = interaction.user.username;
		let enemyName = optionOpp.username;
		let boardArray = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
		//check if trying to battle self temp disabled for testing
		if(workingID == enemyID){
			await interaction.editReply('You cannot play with yourself..... weirdo');
			return;
		}
		if(optionOpp.bot){
			await interaction.editReply('Robots don\'t like connect 4!');
			return;
		}
		//variables to store about player
		let id = interaction.user.id;

		//get the acceptance of battle
		const startFilter = i => i.user.id === enemyID && (i.customId === 'accept' || i.customId === 'deny');
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
		await interaction.editReply({content:`${enemyName}! Click 'Accept' to accept the battle, or 'Deny' to reject the battle, You have 1 min to respond!`,components:[accRow]}).then(res => {
			let noGame = true;
			accCollector.once('collect',async buttInteraction => {
				noGame = false;
				if(buttInteraction.customId == 'accept'){
					await buttInteraction.update({components:[]});
					let info = `It is ${playerName}'s turn!\n`;
					frame(info,interaction);
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
		
		const gameFilter = i => (i.customId === '0' || i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4' || i.customId === '5' || i.customId === '6') && workingID == i.user.id;
		
		
		async function frame(info,frameInteraction){
			const gameCollector = await interaction.channel.createMessageComponentCollector({filter:gameFilter,time: 60000});
			//draw the board
			if(checkTie(boardArray)){
				drawConnect(frameInteraction,`It's a tie!`,boardArray,true).then(()=>{
					return;
				});
			}
			drawConnect(frameInteraction,`${info}`,boardArray,false).then(lastReply =>{
				gameCollector.once('collect',async bi =>{
					//parsing of choice begins here
					let number = parseInt(bi.customId);
					if(boardArray[number][0] == 1 || boardArray[number][0] == -1){
						let currentName = "";
						if(workingID == id){
							currentName = playerName;
						}
						else{
							currentName = enemyName;
						}
						await bi.update({components:[]});
						frame(`That column is full ${currentName}! select a different one!\n`,frameInteraction);
					}
					//actually place piece
					else{
						for(let i=0;i<boardArray[number].length;i++){
						if(i+1 == boardArray[number].length || boardArray[number][i+1] == 1 || boardArray[number][i+1] == -1){
								//reached end place piece
								let num;
								if(workingID == id){
									boardArray[number][i] = 1;
									num = 1;
								}
								else{
									boardArray[number][i] = -1;
									num = -1;
								}
								//check if win
								//number is the column, i is the downward direction
								/*
								 0 1 2 3 4 5 6			these are number
								|_|_|_|_|_|_|_| 0
								|_|_|_|_|_|_|_| 1 	i
								|_|_|_|_|_|_|_| 2 	|	these are i
								|_|_|_|_|_|_|_| 3	V
								|_|_|_|_|_|_|_| 4
								|_|_|_|_|_|_|_| 5
								*/
								if(checkVictory(boardArray,number,i,num)){
									let winner = workingID;
									let loser = "";
									if(workingID == id){
										loser = enemyID;
									}
									else{
										loser = id;
									}
									info = "";
									if(workingID == id){
										info += `${playerName} has won!\n`;
									}
									else{
										info += `${enemyName} has won!\n`;
									}
									drawConnect(frameInteraction,`${info}`,boardArray,true).then(()=>{
										return;
									});
								}
								else{
									//not won yet
									if(workingID == id){
										workingID = enemyID;
										await bi.update({components:[]});
										frame(`It's (blue) ${enemyName}'s turn! ${playerName} placed their chip in ${number}!\n`,frameInteraction);
									}
									else{
										workingID = id;
										await bi.update({components:[]});
										frame(`It's (red) ${playerName}'s turn! ${enemyName} placed their chip in ${number}!\n`,frameInteraction);
									}
								}
								break;
							}
						}
					}
				});
				gameCollector.once('end', collected => {});
			});
		}
	}
}

async function drawConnect(interaction,info,boardArray,end){
	await interaction.editReply({attachments:[]});
	const canvas = Canvas.createCanvas(288,252);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('./connect/connectBoard.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
		
	for(let i=0;i<boardArray[0].length;i++){
		for(let j=0;j<boardArray.length;j++){
			if(boardArray[j][i] == 1){
				let chip = await Canvas.loadImage(`./connect/redChip.png`);
				ctx.drawImage(chip,(j*36)+18,(i*36)+18+i,36,36);
			}
			else if(boardArray[j][i] == -1){
				let chip = await Canvas.loadImage(`./connect/blueChip.png`);
				ctx.drawImage(chip,(j*36)+18,(i*36)+18+i,36,36);
			}
			else{
				continue;
			}
		}
	}
	const row1 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('0')
				.setLabel('0')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('1')
				.setLabel('1')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('2')
				.setLabel('2')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('3')
				.setLabel('3')
				.setStyle('PRIMARY')
		);
	const row2 = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setCustomId('4')
			.setLabel('4')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('5')
			.setLabel('5')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('6')
			.setLabel('6')
			.setStyle('PRIMARY')
	);
	const attachment = new MessageAttachment(canvas.toBuffer(), 'connect4image.png');
	if(end){
		return await interaction.editReply({content:info,files:[attachment],components:[]});
	}
	return await interaction.editReply({content:info,files:[attachment],components:[row1,row2]});
}