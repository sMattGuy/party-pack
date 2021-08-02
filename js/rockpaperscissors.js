const Discord = require('discord.js');
const fs = require('fs');

function startRPS(client,message){
	//check command is correctly entered
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !pp rps <user>');
	}
	else{
		//assign challenger
		let challengerID = message.author.id;
		let challengerName = message.author.username;
		let mentionOK = true;
		let opponentID = '';
		let opponentName = '';
		//check if opponent exists or is correctly entered
		try{
			opponentID = getUserFromMention(client,chop[chop.length-1]).id;
			opponentName = getUserFromMention(client,chop[chop.length-1]).username;
		}
		catch(err){
			message.channel.send('Invalid user selected!');
			return;
		}
		//check if trying to battle self
		if(opponent == challenger){
			message.channel.send('You try to verse yourself and lost... how sad');
			return;
		}
		const startFilter = m => {
			return ((m.content === 'accept' || m.content === 'deny')&&(opponentID == m.author.id));
		}
		message.channel.send(`${opponentName}! Type 'accept' to accept the rock paper scissors battle, or type 'deny' to refuse the battle! You have 1 min to respond!`).then(msg => {
			message.channel.awaitMessages(startFilter,{max:1,time:60000,errors:['time']}).then(choice => {
				let option = choice.first().content;
				if(option == 'accept'){
					acceptRPS();
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
		async function acceptRPS(){
			//begin battle
			message.channel.send(`Getting challengers throw, please wait!`);
			const filter = m => {
				if((m.content !== 'rock' && m.content !== 'paper' && m.content !== 'scissors') && !m.author.bot){
					m.channel.send('Invalid choice, make sure you spell it correctly!');
				}
				return (m.content === 'rock' || m.content === 'paper' || m.content === 'scissors')
			};
			client.users.cache.get(challengerID).send(`Type rock, paper, or scissors`).then(()=>{
				client.users.cache.get(challengerID).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(challChoice => {
					client.users.cache.get(challengerID).send(`Got it, going to get opponents choice now`);
					client.users.cache.get(opponentID).send(`Type rock, paper, or scissors`).then(()=>{
						client.users.cache.get(opponentID).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(oppChoice => {
							client.users.cache.get(challengerID).send(`Go back to the channel you were challenged to see who wins!`);
							client.users.cache.get(opponentID).send(`Go back to the channel you were challenged to see who wins!`);
							let challThrow = challChoice.first().content;
							let oppThrow = oppChoice.first().content;
							
							if(challThrow != 'rock' && challThrow != 'scissors' && challThrow != 'paper' && oppThrow != 'rock' && oppThrow != 'scissors' && oppThrow != 'paper'){
								message.channel.send(`Someone didn't choose correctly, the match is cancelled!`)
							}
							else if(challThrow == 'rock' && oppThrow == 'scissors'){
								message.channel.send(`${challengerName} threw rock, ${opponentName} threw scissors`);
								message.channel.send(`${challengerName} won!`);
							}
							else if(challThrow == 'scissors' && oppThrow == 'paper'){
								message.channel.send(`${challengerName} threw scissors, ${opponentName} threw paper`);
								message.channel.send(`${challengerName} won!`);
							}
							else if(challThrow == 'paper' && oppThrow == 'rock'){
								message.channel.send(`${challengerName} threw paper, ${opponentName} threw rock`);
								message.channel.send(`${challengerName} won!`);
							}
							else if(challThrow == oppThrow){
								message.channel.send(`${challengerName} threw ${challThrow}, ${opponentName} threw ${oppThrow}`);
								message.channel.send(`It's a tie!`);
							}
							else{
								message.channel.send(`${challengerName} threw ${challThrow}, ${opponentName} threw ${oppThrow}`);
								message.channel.send(`${opponentName} won!`);
							}
						}).catch(oppChoice => {message.channel.send(`Opponent didn't type their response correctly or time expired to respond`);});
					}).catch(() => {message.channel.send(`Failed to send DM to opponent (make sure you have DM's on for this server!)`);;});
				}).catch(challChoice => {message.channel.send(`Challenger didn't type their response correctly or time expired to respond`);});
			}).catch(() => {message.channel.send(`Failed to send DM to challenger (make sure you have DM's on for this server!)`);});
		}
	}
}

function rpsHelp(client,message){
	message.channel.send(`Use !pp rps <user> to challenge someone to rock paper scissors!\nUse 'accept' or 'deny' to respond to a battle request\nMake sure you have DM's enabled so the bot can get your throw!`);
}

//helper function to get user
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

//export functions
module.exports = {
	startRPS
};