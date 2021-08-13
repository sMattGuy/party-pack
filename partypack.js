'use strict';
// Import the discord.js module and others
const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');

// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

// import token and database
const credentials = require('./auth.json');

client.commands = new Collection();
const commandFolders = fs.readdirSync('./js');

for(const folder of commandFolders){
	const commandFiles = fs.readdirSync(`./js/${folder}`).filter(file => file.endsWith(`.js`));
	for(const file of commandFiles){
		const command = require(`./js/${folder}/${file}`);
		client.commands.set(command.name,command);
	}
}

//sets ready presense
client.on('ready', () => {
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
	if (message.content.toLowerCase() === '!partypack deploy' && message.author.id == '492850107038040095') {
		await client.guilds.cache.get(message.guildId).commands.set([]);
		console.log('deploying commands');
		const data = [
		{
			name: 'blackjack',
			description: 'Lets you play a game of Blackjack!',
		},
		{
			name: 'battle',
			description: 'Starts a battle with another player!',
			options: [{
				name: 'user',
				type: 'USER',
				description: 'The users ID or mention',
				required: true,
			}],
		},
		{
			name: 'connect4',
			description: 'Starts a connect 4 game with someone!',
			options: [{
				name: 'user',
				type: 'USER',
				description: 'The users ID or mention',
				required: true,
			}],
		},
		{
			name: 'rps',
			description: 'Starts a Rock Paper Scissors game with someone!',
			options: [{
				name: 'user',
				type: 'USER',
				description: 'The users ID or mention',
				required: true,
			}],
		},
		];

		const command = await client.guilds.cache.get(message.guildId).commands.set(data);
		console.log(command);
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (!client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
