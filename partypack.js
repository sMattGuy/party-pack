'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
//additional files holding each feature
const blackjack = require('./js/blackjack.js');
const RPS = require('./js/rockpaperscissors.js');
const connect = require('./js/connect.js');
const mancala = require('./js/mancala.js');
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
	if(message.content.startsWith('!pp blackjack')){ /* !cc blackjack amount */	
		console.log(message.author.username + ' is playing blackjack');
		blackjack.blackjackStart(client,message);
	}
	//rock paper scissors
	else if(message.content.startsWith('!pp rps')){ /* !cc challenge @user amount */
		console.log(message.author.username + ' is rpsing');
		RPS.startRPS(client,message);
	}
	else if(message.content.startsWith('!pp connect4')){
		console.log(message.author.username + ' is playing connect4');
		connect.connect4(client,message);
	}
	else if(message.content.startsWith('!pp mancala')){
		console.log(message.author.username + ' is playing mancala');
		mancala.mancala(client,message);
	}
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
