'use strict';
// Import the discord.js module and others
const { Op } = require('sequelize');
const { Client, Intents, Collection, Formatters } = require('discord.js');
const fs = require('fs');
const { Users, Guilds } = require('./dbObjects.js');

// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

const currency = new Collection();

let newDay = true;

Reflect.defineProperty(currency, 'addBalance', {
	value: async function addBalance(id, amount){
		const user = currency.get(id);
		
		user.balance += Number(amount);
		return user.save();
	},
});
Reflect.defineProperty(currency, 'subBalance', {
	value: async function subBalance(id, amount){
		const user = currency.get(id);
		
		user.balance -= Number(amount);
		return user.save();
	},
});
Reflect.defineProperty(currency, 'addWin', {
	value: async function addWin(id){
		const user = currency.get(id);
		
		user.wins += 1;
		return user.save();
	},
});
Reflect.defineProperty(currency, 'getWin', {
	value: async function getWin(id){
		const user = currency.get(id);
		return user.wins;
	},
});
Reflect.defineProperty(currency, 'addLoss', {
	value: async function addLoss(id){
		const user = currency.get(id);
		
		user.loses += 1;
		return user.save();
	},
});
Reflect.defineProperty(currency, 'getLoss', {
	value: async function getLoss(id){
		const user = currency.get(id);
		return user.loses;
	},
});
Reflect.defineProperty(currency, 'getBalance', {
	value: async function getBalance(id){
		const user = currency.get(id);
		if(user){
			return user.balance;
		}
		const newUser = await Users.create({user_id: id, balance: 10, wins: 0, loses: 0});
		currency.set(id, newUser);
		return 10;
	},
});

// import token and database
const credentials = require('./auth.json');

client.commands = new Collection();
const commandFolders = fs.readdirSync('./js');

const messageMap = new Map();

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./js/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./js/${folder}/${file}`);
		client.commands.set(command.name,command);
	}
}

//sets ready presense
client.on('ready', async () => {
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	client.user.setPresence({
		status: 'online',
	});
	//list server
	client.guilds.cache.forEach(guild => {
		console.log(`${guild.name} | ${guild.id}`);
	});
	console.log('I am ready!');
});

client.on('messageCreate', async message => {
	resetBalance();
	//haha funny
	if(messageMap.has(message.channel.id) && !message.author.bot){
		if(messageMap.get(message.channel.id).content == message.content && messageMap.get(message.channel.id).author != message.author.id){
			let messUpdate = messageMap.get(message.channel.id);
			messUpdate.times += 1;
			messUpdate.author = message.author.id;
			messageMap.set(message.channel.id,messUpdate);
			if(messUpdate.times == 3){
				if(messUpdate.content.length != 0){
					message.channel.send(messUpdate.content);
				}
				else{
					message.channel.send({stickers:messUpdate.sticker}).catch(() => {console.log('could not send sticker')});
				}
				messageMap.delete(message.channel.id);
			}
		}
		else{
			let newInput = {content:message.content,times:1,author:message.author.id,sticker:message.stickers};
			messageMap.set(message.channel.id,newInput);
		}
	}
	else{
		let newInput = {content:message.content,times:1,author:message.author.id,sticker:message.stickers};
		messageMap.set(message.channel.id,newInput);
	}
});

client.on('interactionCreate', async interaction => {
	resetBalance();
	if (!interaction.isCommand()) return;
	
	const command = client.commands.get(interaction.commandName);
	
	if (!command) return;

	try {
		await command.execute(interaction,currency,client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

function resetBalance(){
	let currentTime = new Date();
	if(currentTime.getUTCHours < 1 && !newDay){
		newDay = true;
	}
	if(currentTime >= 1 && newDay){
		newDay = false;
		currency.forEach(user => {
			if(user.balance < 10){
				user.balance = 10;
				user.save();
			}
		});
	}
}
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);

client.on('error', error => {
	console.log(error);
});
