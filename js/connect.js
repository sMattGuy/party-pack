const Discord = require('discord.js');
const fs = require('fs');
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

function connect4(client,message){
	let workingID = message.author.id;
	let enemyID = "";
	let playerName = message.author.username;
	let enemyName = "";
	let chop = message.content.split(" ");
	let boardArray = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
	if(chop.length != 3){
		message.channel.send('Usage: !pp connect4 <user>');
		return;
	}
	try{
		enemyID = getUserFromMention(client,chop[chop.length-1]).id;
		enemyName = getUserFromMention(client,chop[chop.length-1]).username;
	}
	catch(err){
		message.channel.send('Invalid user selected!');
		return;
	}
	//check if trying to battle self temp disabled for testing
	if(message.author.id == enemyID){
		message.channel.send('You cannot play with yourself..... weirdo');
		return;
	}
	const filter = m => {
		return (m.content.startsWith('place')&&(workingID == m.author.id));
	};
	//variables to store about player
	let id = message.author.id;

	//get the acceptance of battle
	const diffFilter = m => {
		return ((m.content === 'accept' || m.content === 'deny')&&(enemyID == m.author.id));
	}
	message.channel.send(`${enemyName}! Type 'accept' to accept the battle, or 'deny' to reject the battle, You have 1 min to respond!`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == 'accept'){
				let info = `It is ${message.author.username}'s turn!\n`;
				frame(info);
			}
			else if(option == 'deny'){
				message.channel.send(`You have declined the game!`);
				return;
			}
		}).catch(e => {
			message.channel.send(`Opponent didn't respond in time`);
			console.log(e);
		})
	});
	
	async function frame(info){
		//draw the board
		if(checkTie(boardArray)){
			drawConnect(message.channel,`It's a tie!`,boardArray).then(()=>{
				return;
			});
		}
		drawConnect(message.channel,`${info}Use 'place <index>'`,boardArray).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete().catch(() => {console.log('couldnt delete message in battle')});
				let action = choice.first().content;
				let chopAction = action.split(" ");
				let number = parseInt(chopAction[chopAction.length-1]);
				if(number >= boardArray.length || number < 0 || isNaN(number)){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`Invalid index selected ${currentName}! try again!\n`);
				}
				else if(boardArray[number][0] == 1 || boardArray[number][0] == -1){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`That column is full ${currentName}! select a different one!\n`);
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
								drawConnect(message.channel,`${info}`,boardArray).then(()=>{
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
								});
								return;
							}
							else{
								//not won yet
								if(workingID == id){
									workingID = enemyID;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
									frame(`It's (blue) ${enemyName}'s turn! ${playerName} placed their chip in ${number}!\n`);
								}
								else{
									workingID = id;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
									frame(`It's (red) ${playerName}'s turn! ${enemyName} placed their chip in ${number}!\n`);
								}
							}
							break;
						}
					}
				}
			}).catch(e => {
			let payPlayer = '';
			let slacker = '';
			let slackerName = '';
			let payPlayerName = '';
			if(workingID == id){
				payPlayer = enemyID;
				payPlayerName = enemyName;
				slacker = id;
			}
			else{
				payPlayer = id;
				payPlayerName = playerName;
				slacker = enemyID;
				slackerName = enemyName;
			}
			message.channel.send(`${slackerName} didn't respond in time! ${payPlayerName} wins!`);
			console.log(e);
		});
		}).catch(e => {
			message.channel.send(`Didn't get back a response. Game ending...`);
			console.log(e);
		});
	}
}

function connectHelp(client,message){
	message.channel.send(`Use !pp connect4 <user> to challenge someone to connect 4\nUse 'accept' or 'deny' to respond to the challenge\nUse 'place <index>' to place your piece\nThe goal of connect 4 is to line up 4 of your pieces either horizontally, vertically, or diagonally!`);
}

function getUserFromMention(client,mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);
		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.cache.get(mention);
	}
}

async function drawConnect(channel,info,boardArray){
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
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'connect4image.png');
	return channel.send(info,attachment);
}
//export section
module.exports = {
	connect4,
	connectHelp
};