const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

//cards
const blackjackCards = ['♠A','♠2','♠3','♠4','♠5','♠6','♠7','♠8','♠9','♠10','♠J','♠Q','♠K','♥A','♥2','♥3','♥4','♥5','♥6','♥7','♥8','♥9','♥10','♥J','♥Q','♥K','♦A','♦2','♦3','♦4','♦5','♦6','♦7','♦8','♦9','♦10','♦J','♦Q','♦K','♣A','♣2','♣3','♣4','♣5','♣6','♣7','♣8','♣9','♣10','♣J','♣Q','♣K'];
const blackjackCardsImages = ['AS.png','2S.png','3S.png','4S.png','5S.png','6S.png','7S.png','8S.png','9S.png','10S.png','JS.png','QS.png','KS.png','AH.png','2H.png','3H.png','4H.png','5H.png','6H.png','7H.png','8H.png','9H.png','10H.png','JH.png','QH.png','KH.png','AD.png','2D.png','3D.png','4D.png','5D.png','6D.png','7D.png','8D.png','9D.png','10D.png','JD.png','QD.png','KD.png','AC.png','2C.png','3C.png','4C.png','5C.png','6C.png','7C.png','8C.png','9C.png','10C.png','JC.png','QC.png','KC.png'];

function blackjackStart(client,message){
	let challengerID = message.author.id;
	let challengerName = message.author.username;
	let challengerImage = message.author.displayAvatarURL({format:'png'});
	let cardValue = [11,2,3,4,5,6,7,8,9,10,10,10,10];
	console.log(challengerName + ' has started blackjack');	
	let usedCards = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
	//dealer
	let dealerCard1 = (Math.floor(Math.random() * 52));
	usedCards[dealerCard1] = true;
	let dealerCard2 = (Math.floor(Math.random() * 52));
	while(usedCards[dealerCard2]){
		dealerCard2 = (Math.floor(Math.random() * 52));
	}
	usedCards[dealerCard2] = true;
	//player
	let playerCard1 = (Math.floor(Math.random() * 52));
	while(usedCards[playerCard1]){
		playerCard1 = (Math.floor(Math.random() * 52));
	}
	usedCards[playerCard1] = true;
	let playerCard2 = (Math.floor(Math.random() * 52));
	while(usedCards[playerCard2]){
		playerCard2 = (Math.floor(Math.random() * 52));
	}
	usedCards[playerCard2] = true;
	let dealerCards = [dealerCard1,dealerCard2];
	let playerCards = [playerCard1,playerCard2];
	//check instant win
	if(((playerCard1%13 == 0)&&(playerCard2%13 == 9 || playerCard2%13 == 10 || playerCard2%13 == 11 || playerCard2%13 == 12))|| ((playerCard2%13 == 0)&&(playerCard1%13 == 9 || playerCard1%13 == 10 || playerCard1%13 == 11 || playerCard1%13 == 12))){
		if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
			let resultsOfGame = `You and the dealer both got a natural..... you get back your CC\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.`;
			drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,21,message.author.username,21,challengerImage).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			console.log(data.users[i].name + ' drew in blackjack');
		}
		else{
			let resultsOfGame = `You got a natural! You win!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.\n`;
			console.log(data.users[i].name + ' won in blackjack');
			drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,21,message.author.username,cardValue[dealerCards[0]%13]+cardValue[dealerCards[1]%13],challengerImage).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
		}
	}
	else if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
		//seduce dealer
		let resultsOfGame = `Dealer got a natural! You lose!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.\n`;
		console.log(data.users[i].name + ' lost in blackjack');
		drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,cardValue[playerCards[0]%13]+cardValue[playerCards[1]%13],message.author.username,21,challengerImage).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
	}
	else{
		let playersValue = cardValue[playerCards[0]%13]+cardValue[playerCards[1]%13];
		if(playersValue == 22){
			playersValue = 12;
		}
		let dealersValue = cardValue[dealerCards[0]%13]+cardValue[dealerCards[1]%13];
		if(dealersValue == 22){
			dealersValue = 12;
		}
		const filter = m => {
			return ((m.content === 'hit' || m.content === 'stand') && (challengerID == m.author.id));
		};
		let resultsOfGame = `${challengerName}, Type 'hit' or 'stand', you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`;
		drawBoard(message.channel, true, resultsOfGame, playerCards, dealerCards,false,false,playersValue,message.author.username,cardValue[dealerCards[0]%13],challengerImage).then(msg => {
		message.channel.awaitMessages(filter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			choice.first().delete();
			if(option == 'hit'){
				msg.delete().catch(() => {console.log('couldnt delete message')});
				blackjackHit();
			}
			else if(option == 'stand'){
				msg.delete().catch(() => {console.log('couldnt delete message')});
				blackjackStand();
			}
			}).catch(e => {
				message.channel.send(`${challengerName} didn't respond in time!`);
				console.log(e);
			});
		}).catch(error => {
			console.log(error);
			message.channel.send(`An error has occurred, ending game.`);
		});
		
		
		async function blackjackHit(){
			let pCardValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
			let dealerValue = [11,2,3,4,5,6,7,8,9,10,10,10,10];
			let newCard = (Math.floor(Math.random() * 52));
			while(usedCards[newCard]){
				newCard = (Math.floor(Math.random() * 52));
			}
			usedCards[newCard] == true;
			playerCards.push(newCard);
			let currentTotal = 0;
			let ace = false;
			let bust = false;
			for(let i=0;i<playerCards.length;i++){
				let currentCardValue = pCardValue[playerCards[i]%13];
				if(currentCardValue == 1){
					ace = true;
				}
				currentTotal += currentCardValue;
			}
			let cardViewer = "";
			for(let i=0;i<playerCards.length;i++){
				cardViewer += blackjackCards[playerCards[i]];
			}
			if(currentTotal > 21){
				let resultsOfGame = `Bust! You drew a ${blackjackCards[newCard]}, ${challengerName}, you lose!\nYou:${cardViewer}\n`;
				console.log(challengerName + ' lost in blackjack');
				drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,currentTotal,challengerName,dealerValue[dealerCards[0]%13]+dealerValue[dealerCards[1]%13],challengerImage).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			}
			else if(ace && currentTotal + 10 <= 21){
				let resultsOfGame = `${challengerName}, you drew a ${blackjackCards[newCard]} you now have ${currentTotal} (or ${currentTotal + 10} since you have an ace)\nYou:${cardViewer}`;
				drawBoard(message.channel, true, resultsOfGame, playerCards, dealerCards,false,false,`${currentTotal} (or ${currentTotal + 10})`,challengerName,dealerValue[dealerCards[0]%13],challengerImage).then(msg => {
				message.channel.awaitMessages(filter,{max:1,time:60000,errors:['time']}).then(choice => {
					let option = choice.first().content;
					choice.first().delete();
					if(option == 'hit'){
						msg.delete().catch(() => {console.log('couldnt delete message')});
						blackjackHit();
					}
					else if(option == 'stand'){
						msg.delete().catch(() => {console.log('couldnt delete message')});
						blackjackStand();
					}
					}).catch(e => {
						message.channel.send(`${challengerName} didn't respond in time!`);
						console.log(e);
					});
				}).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			}
			else{
				let resultsOfGame = `${challengerName}, you drew a ${blackjackCards[newCard]} you now have ${currentTotal}\nYou:${cardViewer}`;
				drawBoard(message.channel, true, resultsOfGame, playerCards, dealerCards,false,false,currentTotal,challengerName,dealerValue[dealerCards[0]%13],challengerImage).then(msg => {
				message.channel.awaitMessages(filter,{max:1,time:60000,errors:['time']}).then(choice => {
					let option = choice.first().content;
					choice.first().delete();
					if(option == 'hit'){
						msg.delete().catch(() => {console.log('couldnt delete message')});
						blackjackHit();
					}
					else if(option == 'stand'){
						msg.delete().catch(() => {console.log('couldnt delete message')});
						blackjackStand();
					}
					}).catch(e => {
						message.channel.send(`${challengerName} didn't respond in time!`);
						console.log(e);
					});
				}).catch(error => {
					console.log(error);
					message.channel.send(`An error has occured, the game is ending.`);
				});
			}
		}

		async function blackjackStand(){
			let pCardValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
			let dealerTotal = 0;
			let ace = false;
			for(let i=0;i<dealerCards.length;i++){
				let currentCardValue = pCardValue[dealerCards[i]%13];
				if(currentCardValue == 1){
					ace = true;
				}
				dealerTotal += currentCardValue;
			}
			if(ace && dealerTotal + 10 <= 21){
				dealerTotal += 10;
			}
			while(dealerTotal < 17){
				let newCard = (Math.floor(Math.random() * 52));
				while(usedCards[newCard]){
					newCard = (Math.floor(Math.random() * 52));
				}
				usedCards[newCard] == true;
				dealerCards.push(newCard);
				let currentCardValue = pCardValue[newCard%13];
				dealerTotal += currentCardValue;
				if(ace && dealerTotal > 21){
					ace = false;
					dealerTotal -= 10;
				}
			}
			if(ace && dealerTotal + 10 <= 21){
				dealerTotal += 10;
			}
			let cardViewer = "";
			for(let i=0;i<dealerCards.length;i++){
				cardViewer += blackjackCards[dealerCards[i]];
			}
			let playerViewer = "";
			for(let i=0;i<playerCards.length;i++){
				playerViewer += blackjackCards[playerCards[i]];
			}
			if(dealerTotal > 21){
				let resultsOfGame = `Bust! Dealer loses, ${challengerName}, you've won!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
				console.log(challengerName + ' won in blackjack');
				
				let playerValueBust = 0;
				let playerAceBust = false;
				for(let i=0;i<playerCards.length;i++){
					let currentCardValue = pCardValue[playerCards[i]%13];
					if(currentCardValue == 1){
						playerAceBust = true;
					}
					playerValueBust += currentCardValue;
				}
				if(playerAceBust && playerValueBust + 10 <= 21){
					playerValueBust += 10;
				}
				drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,playerValueBust,challengerName,dealerTotal,challengerImage).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			}
			else{
				let playerValue = 0;
				let playerAce = false;
				for(let i=0;i<playerCards.length;i++){
					let currentCardValue = pCardValue[playerCards[i]%13];
					if(currentCardValue == 1){
						playerAce = true;
					}
					playerValue += currentCardValue;
				}
				if(playerAce && playerValue + 10 <= 21){
					playerValue += 10;
				}
				if(playerValue > dealerTotal){
					//player wins
					let resultsOfGame = `${challengerName}, you have ${playerValue}, Dealer has ${dealerTotal}. You've won!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
					console.log(challengerName + ' won in blackjack');
					drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,playerValue,challengerName,dealerTotal,challengerImage).catch(error => {
						console.log(error);
						message.channel.send(resultsOfGame);
					});
				}
				else if(dealerTotal > playerValue){
					//player lose
					let resultsOfGame = `${challengerName}, you have ${playerValue}, Dealer has ${dealerTotal}. You've lost!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
					console.log(challengerName + ' lost in blackjack');
					drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,playerValue,challengerName,dealerTotal,challengerImage).catch(error => {
						console.log(error);
						message.channel.send(resultsOfGame);
					});
				}
				else{
					//draw
					let resultsOfGame = `${challengerName}, you have ${playerValue}, Dealer has ${dealerTotal}. It's a draw!\nYou:${playerViewer}. Dealer:${cardViewer}`;
					console.log(challengerName + ' drew in blackjack');
					drawBoard(message.channel, false, resultsOfGame, playerCards, dealerCards,false,true,playerValue,challengerName,dealerTotal,challengerImage).catch(error => {
						console.log(error);
						message.channel.send(resultsOfGame);
					});
				}
			}
		}
		
	}
}



//create board for blackjack
async function drawBoard(channel, hiddenDealer, gameMessage, playerCards, dealerCards, unstable, ender, playerVal, playerName, dealerVal,userIcon){
	const canvas = Canvas.createCanvas(496,288);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('./cardImages/pokertable.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
	
	const avatar = await Canvas.loadImage(userIcon);
	ctx.drawImage(avatar,0,105,75,75);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(0,105,75,75);
	
	const carlCoinImage = await Canvas.loadImage(`./cardImages/carlcoin2.png`);
	ctx.drawImage(carlCoinImage,421,105,75,75);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(421,105,75,75);
	//player name and val
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(playerName, 80, 135);
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(playerVal, 80, 160);
	//carl name and val
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('ParlPoin', 320, 160);
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(dealerVal, 390, 135);
	for(let i=0;i<playerCards.length;i++){
		let currentCard = await Canvas.loadImage(`./cardImages/${blackjackCardsImages[playerCards[i]]}`);
		ctx.drawImage(currentCard,25 + (i * 25) ,188,130,200);
		if(unstable){
			let currentCard = await Canvas.loadImage(`./cardImages/purple_back.png`);
			ctx.drawImage(currentCard,25 + ((i+1) * 25) ,188,130,200);
			break;
		}
	}
	for(let i=0;i<dealerCards.length;i++){
		let dealerCard = await Canvas.loadImage(`./cardImages/${blackjackCardsImages[dealerCards[i]]}`);
		ctx.drawImage(dealerCard,340 - (i * 25) ,-100,130,200);
		if(hiddenDealer){
			dealerCard = await Canvas.loadImage(`./cardImages/purple_back.png`);
			ctx.drawImage(dealerCard,340 - ((i+1) * 25) ,-100,130,200);
			break;
		}
	}
	
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'board.png');
	if(!ender){
		return channel.send(`${gameMessage}`,attachment);
	}
	else{
		return channel.send(`${gameMessage}`,attachment);
	}
}
function blackjackHelp(client, message){
	message.channel.send(`Use !pp blackjack to start a game!\nType 'hit' to get another card\nType 'stand' to keep your current hand\nThe goal is to get your hand to 21, each cards value is its number, all face cards are 10, and an ace is either a 1 or an 11, whichever gives you the higher score. Going over 21 though is a bust, meaning you lose!`)
}
//export functions
module.exports = {
	blackjackStart,
	blackjackHelp
};