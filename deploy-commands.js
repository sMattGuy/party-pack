const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientID, guildIDs, token } = require('./auth.json');

const commands = [
	new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Lets you play a game of Blackjack!')
		.addIntegerOption((option) => 
			option
				.setName('bet')
				.setDescription('How much you want to bet')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('battle')
		.setDescription('Starts a battle with another player!')
		.addUserOption(option => 
			option
				.setName('user')
				.setDescription('The user to battle')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('bet')
				.setDescription('How much you want to bet')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('connect4')
		.setDescription('Starts a connect 4 game with another player!')
		.addUserOption(option => 
			option
				.setName('user')
				.setDescription('The user to verse')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('bet')
				.setDescription('How much you want to bet')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Starts rock paper scissors with another player!')
		.addUserOption(option => 
			option
				.setName('user')
				.setDescription('The user to verse')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('bet')
				.setDescription('How much you want to bet')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See your or someones stats!')
		.addUserOption(option => 
			option
				.setName('user')
				.setDescription('User whos stats you want to see')
				.setRequired(false)),
	new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('See who is the best!'),
]
.map(command => command.toJSON());

const rest = new REST({version:'9'}).setToken(token);

for(let i=0;i<guildIDs.length;i++){
	rest.put(Routes.applicationGuildCommands(clientID,guildIDs[i]),{body:commands})
		.then(() => console.log('Registered application commands!'))
		.catch(console.error);
}