const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

function mancala(client,message){
	let workingID = message.author.id;
	let enemyID = "";
	let playerName = message.author.username;
	let enemyName = "";
	let playerImage = message.author.displayAvatarURL({format:'png'});
	let enemyImage = "";
	let chop = message.content.split(" ");
	let boardArray = [[4,4,4,4,4,4],[4,4,4,4,4,4]];
	let playerPocket = 0;
	let enemyPocket = 0;
	if(chop.length != 3){
		message.channel.send('Usage: !pp mancala <user>');
		return;
	}
	try{
		let enemy = getUserFromMention(client,chop[chop.length-1]);
		enemyID = enemy.id;
		enemyName = enemy.username;
		enemyImage = enemy.displayAvatarURL({format:'png'});
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
		return (m.content.startsWith('pocket')&&(workingID == m.author.id));
	};
	//variables to store about player
	let playerId = message.author.id;

	//get the acceptance of battle
	const diffFilter = m => {
		return ((m.content === 'accept' || m.content === 'deny')&&(enemyID == m.author.id));
	}
	let info = `It is ${message.author.username}'s turn!\n`;
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
		//will need to change
		drawMancala(message.channel,`${info}pocket <index>`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete().catch(() => {console.log('couldnt delete message in mancala')});
				//get action
				let action = choice.first().content;
				let chopAction = action.split(" ");
				let sideIndex = 0;
				if(workingID == id){
					sideIndex = 0;
				}
				else{
					sideIndex = 1;
				}
				let number = parseInt(chopAction[chopAction.length-1]);
				if(number >= boardArray[0].length || number < 0 || isNaN(number)){
					msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`That pocket is invalid ${currentName}! try again!\n`);
				}
				//check if pocket is empty
				else if(boardArray[sideIndex][number] == 0){
					msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`Pocket ${number} has no pieces ${currentName}! try again!\n`);
				}
				//actually do game calculation
				else{
					let pieceCount = boardArray[sideIndex][number];
					let originalPocket = number;
					boardArray[sideIndex][number] = 0;
					//advance to next pocket
					let enemySide = false;
					let goAgain = false;
					for(let i=pieceCount;i!=0;i--){
						number++;
						if(number == 6 && !enemySide){
							goAgain = true;
							if(sideIndex == 1){
								sideIndex = 0;
								enemyPocket++;
							}
							else{
								sideIndex = 1;
								playerPocket++;
							}
							number = -1;
							enemySide = true;
						}
						else if(number == 6 && enemySide){
							number = 0;
							if(sideIndex == 1){
								sideIndex = 0;
							}
							else{
								sideIndex = 1;
							}
							enemySide = false;
							boardArray[sideIndex][number]++;
						}
						else{
							goAgain = false;
							boardArray[sideIndex][number]++;
						}
					}
					//steal
					if(boardArray[sideIndex][number] == 1 && !enemySide){
						let oppositeSide = 0;
						if(sideIndex == 1){
							oppositeSide = 0;
						}
						else{
							oppositeSide = 1;
						}
						//complete steal
						if(boardArray[oppositeSide][5-number] != 0){
							if(workingID == id){
								playerPocket += boardArray[sideIndex][number] + boardArray[oppositeSide][5-number];
							}
							else{
								enemyPocket += boardArray[sideIndex][number] + boardArray[oppositeSide][5-number];
							}
							boardArray[sideIndex][number] = 0;
							boardArray[oppositeSide][5 - number] = 0;
						}
					}
					//check game end
					let gameOver = true;
					for(let i=0;i<boardArray[0].length;i++){
						if(boardArray[0][i] != 0){
							gameOver = false;
							break;
						}
					}
					if(!gameOver){
						gameOver = true;
						for(let i=0;i<boardArray[1].length;i++){
							if(boardArray[1][i] != 0){
								gameOver = false;
								break;
							}
						}
					}
					//end game
					if(gameOver){
						for(let i=0;i<boardArray[0].length;i++){
							playerPocket += boardArray[0][i];
							boardArray[0][i] = 0;
							enemyPocket += boardArray[1][i];
							boardArray[1][i] = 0;
						}
						info = "";
						let winner = "";
						let loser = "";
						if(playerPocket > enemyPocket){
							//player wins
							winner = id;
							loser = enemyID;
							info += `${playerName} has won! They got ${wager*2}CC!\n`;
						}
						else if(playerPocket < enemyPocket){
							//enemy wins
							winner = enemyID;
							loser = id;
							info += `${enemyName} has won! They got ${wager*2}CC!\n`;
						}
						else{
							//tie
							//draw final screen
							info = `It's a tie.... Good job?`;
							drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then(()=>{
								msg.delete().catch(() => {console.log('couldnt delete message in battle')});
							});
							return;
						}
						//draw final screen
						drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then(()=>{
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
						});
						return;
					}
					if(goAgain){
						//player gets to go again
						if(workingID == id){
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Right) ${playerName}'s turn again! ${playerName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
						else{
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Left) ${enemyName}'s turn again! ${enemyName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
					}
					else{
						//not won yet
						if(workingID == id){
							workingID = enemyID;
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Right) ${enemyName}'s turn! ${playerName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
						else{
							workingID = id;
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Left) ${playerName}'s turn! ${enemyName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
					}
				}
			}).catch(e => {
			let payPlayer = '';
			let slacker = '';
			let payPlayerName = '';
			let slackerName = '';
			if(workingID == id){
				payPlayer = enemyID;
				payPlayerName = enemyName;
				slacker = id;
				slackerName = playerName;
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
			message.channel.send(`Didnt get valid response in time. Ending game...`);
			console.log(e);
		});
	}
}

function mancalaHelp(client,message){
	message.channel.send(`Use !pp mancala <user> to challenge someone to mancala\nUse 'pocket <index>' to place your piece\nHow to play: get the most rocks in your slot at the end. If you land a rock in your slot exactly you get to go again. if you land a rock in an empty pocket you steal the opponents rocks directly across.`);
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

async function drawMancala(channel,info,boardArray,playerIcon,EnemyIcon,playerScore,enemyScore,playerName,enemyName){
	const canvas = Canvas.createCanvas(300,400);
	const pieceNames = ['red','blue','purple','green','orange','yellow'];
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('./mancala/mancalaboard.png');
	const playerPic = await Canvas.loadImage(playerIcon);
	const enemyPic = await Canvas.loadImage(EnemyIcon);
	//draw background board
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
	//place icons
	ctx.drawImage(playerPic, 5, 5, 50, 50);
	ctx.drawImage(enemyPic, 245, 345, 50, 50);
	//place in pockets
	//player side
	for(let j=boardArray[0].length-1;j>=0;j--){
		for(let k=0;k<boardArray[0][j];k++){
			let currentRock = `${pieceNames[k%pieceNames.length]}Rock.png`;
			let rock = await Canvas.loadImage(`./mancala/${currentRock}`);
			ctx.drawImage(rock,80 + Math.floor(Math.random() * 10),300 - (j * 42) + Math.floor(Math.random() * 10),10,10);
		}
		ctx.font = '12px sans-serif';
		ctx.fillStyle = '#000000';
		ctx.fillText(boardArray[0][j],40,310 - (j * 43));
	}
	//enemy side
	for(let j=0;j<boardArray[1].length;j++){
		for(let k=0;k<boardArray[1][j];k++){
			let currentRock = `${pieceNames[k%pieceNames.length]}Rock.png`;
			let rock = await Canvas.loadImage(`./mancala/${currentRock}`);
			ctx.drawImage(rock,80 + (120 + Math.floor(Math.random() * 10)),87 + ((j * 42) + Math.floor(Math.random() * 10)),10,10);
		}
		ctx.font = '12px sans-serif';
		ctx.fillStyle = '#000000';
		ctx.fillText(boardArray[1][j],45 + 200,100 + (j * 43));
	}
	//player scores
	for(let k=0;k<playerScore;k++){
		let rock = await Canvas.loadImage(`./mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,85 + Math.floor(Math.random() * 120),45 + Math.floor(Math.random() * 10),10,10);
	}
	//enemy scores
	for(let k=0;k<enemyScore;k++){
		let rock = await Canvas.loadImage(`./mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,85 + Math.floor(Math.random() * 120),335 + Math.floor(Math.random() * 8),10,10);
	}
	//draw scores
	ctx.font = '12px sans-serif';
	ctx.fillStyle = '#000000';
	ctx.fillText(playerScore,230,20);
	ctx.fillText(enemyScore,60,390);
	ctx.fillText(playerName,150 - (playerName.length * 5),20);
	ctx.fillText(enemyName,150 - (enemyName.length * 5),390);
	//place in score sections
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'connect4image.png');
	return channel.send(info,attachment);
}
//export section
module.exports = {
	mancala,
	mancalaHelp
};