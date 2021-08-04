'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
//additional files holding each feature
const blackjack = require('./js/blackjack.js');
const RPS = require('./js/rockpaperscissors.js');
const connect = require('./js/connect.js');
const mancala = require('./js/mancala.js');
const battle = require('./js/battle.js');
// Create an instance of a Discord client
const client = new Discord.Client();
// import token and database
const credentials = require('./auth.json');

//sets ready presense
client.on('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'for !pp help',
        type: "WATCHING"
    }
  });
  //list server
  client.guilds.cache.forEach(guild => {
    console.log(`${guild.name} | ${guild.id}`);
  });
  console.log('I am ready!');
});
// Create an event listener for messages
client.on('message', message => {
	//set presence
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !pp help',
         type: "WATCHING"
      }
   });
	//blackjack
	if(message.content.startsWith('!pp blackjack')){
		console.log(message.author.username + ' is playing blackjack');
		blackjack.blackjackStart(client,message);
	}
	else if(message.content === '!pp help blackjack'){
		blackjack.blackjackHelp(client,message);
	}
	//rock paper scissors
	else if(message.content.startsWith('!pp rps')){
		console.log(message.author.username + ' is rpsing');
		RPS.startRPS(client,message);
	}
	else if(message.content === '!pp help rps'){
		RPS.rpsHelp(client,message);
	}
	else if(message.content.startsWith('!pp connect4')){
		console.log(message.author.username + ' is playing connect4');
		connect.connect4(client,message);
	}
	else if(message.content === '!pp help connect4'){
		connect.connectHelp(client,message);
	}
	else if(message.content.startsWith('!pp mancala')){
		console.log(message.author.username + ' is playing mancala');
		mancala.mancala(client,message);
	}
	else if(message.content === '!pp help mancala'){
		mancala.mancalaHelp(client,message);
	}
	else if(message.content.startsWith('!pp battle')){
		console.log(message.author.username + ' is battling');
		battle.battle(client,message);
	}
	else if(message.content === '!pp help battle'){
		battle.battleHelp(client,message);
	}
	else if(message.content === '!pp help'){
		message.channel.send(`Use !pp help blackjack to see blackjack information\nUse !pp help rps to see rock paper scissors information\nUse !pp help connect4 to see connect4 information\nUse !pp help mancala to see mancala information`);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
