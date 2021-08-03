const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

//player class definitions
const armor = {head:{nothing:{name:'Nothing',av:0,dv:0},wreath:{name:'Witchwood Wreath',av:0,dv:0}},face:{nothing:{name:'Nothing',av:0,dv:0},goggles:{name:'Goggles',av:0,dv:0}},body:{nothing:{name:'Nothing',av:0,dv:0},robe:{name:'Cloth Robe',av:1,dv:0},furs:{name:'Furs',av:2,dv:-1},armor:{name:'Leather Armor',av:2,dv:0},tunic:{name:'Woven Tunic',av:1,dv:2},},arms:{nothing:{name:'Nothing',av:0,dv:0},buckler:{name:'Iron Buckler',av:2,dv:-3}},feet:{nothing:{name:'Nothing',av:0,dv:0},moccasins:{name:'Leather Moccasins',av:0,dv:0}}};

const weapons = {fist:{name:'Fist',pv:1,maxPv:2,damage:4},staff:{name:'Staff',pv:4,maxPv:5,damage:2},dagger:{name:'Bronze Dagger',pv:4,maxPv:5,},axe:{name:'Bronze Battle Axe',pv:4,maxPv:5,damage:2},kris:{name:'Desert Kris',pv:4,maxPv:6,damage:3},sword:{name:'Iron Long Sword',pv:4,maxPv:6,damage:4},vinereaper:{name:'Iron Vinereaper',pv:4,maxPv:6,damage:3}};

const skills = {intimidate:{name:'Intimidate',cooldown:25,duration:8,damage:0,statModify:{strength:-5,agility:1,toughness:0,intelligence:-2,willpower:0,ego:0},description:'Cooldown 25 turns, terrify the enemy, lowering their strength and intelligence for 1-8 turns.'},hobble:{name:'Hobble',cooldown:20,duration:4,damage:0,statModify:{strength:0,agility:-10,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 20 turns, focus on a weak spot in the enemy, if you hit, penetrate once and hobble, lowering their agility for 1-4 turns.'},berate:{name:'Berate',cooldown:40,duration:20,damage:0,statModify:{strength:-5,agility:-5,toughness:0,intelligence:0,willpower:-10,ego:-10},description:'Cooldown 40 turns, shame the enemy for 1-20 rounds, during which they recieve a hit to strength, agility, willpower and ego.'},cleave:{name:'Cleave',cooldown:20,duration:0,damage:10,statModify:{strength:0,agility:0,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 20 turns, cleave the enemy, bypassing their armor and dealing 1-10 true damage.'},lunge:{name:'Lunge',cooldown:10,duration:0,damage:5,statModify:{strength:0,agility:0,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 10 turns, lunge at the enemy, bypassing their armor and dealing 5 true damage.'}};

const apostle = {name:'Apostle',attributes:{strength:15,agility:15,toughness:15,intelligence:15,willpower:15,ego:17},attributeModifiers:{dodgeValue:2,penetrationValue:1},equipment:{head:armor.head.wreath,face:armor.face.nothing,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.staff,skill:skills.intimidate};

const greybeard = {name:'Greybeard',attributes:{strength:14,agility:15,toughness:15,intelligence:15,willpower:18,ego:15},attributeModifiers:{dodgeValue:-1,penetrationValue:2},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.staff,skill:skills.berate};

const marauder = {name:'Marauder',attributes:{strength:17,agility:15,toughness:15,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:1,penetrationValue:2},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.furs,arms:armor.arms.nothing,feet:armor.feet.nothing},weapon:weapons.axe,skill:skills.cleave};

const nomad = {name:'Nomad',attributes:{strength:15,agility:15,toughness:17,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:-1,penetrationValue:2},equipment:{head:armor.head.nothing,face:armor.face.goggles,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.kris,skill:skills.hobble};

const warden = {name:'Warden',attributes:{strength:17,agility:15,toughness:15,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:-2,penetrationValue:3},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.armor,arms:armor.arms.buckler,feet:armor.feet.moccasins},weapon:weapons.sword,skill:skills.lunge};

const farmer = {name:'Farmer',attributes:{strength:15,agility:15,toughness:17,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:2,penetrationValue:3},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.tunic,arms:armor.arms.nothing,feet:armor.feet.nothing},weapon:weapons.vinereaper,skill:skills.cleave};

const classNames = new Map();
classNames.set('Apostle',apostle);
classNames.set('Greybeard',greybeard);
classNames.set('Marauder',marauder);
classNames.set('Nomad',nomad);
classNames.set('Warden',warden);
classNames.set('Farmer',farmer);

function battle(client,message){
	let workingID = message.author.id;
	let enemyID = "";
	let playerName = message.author.username;
	let enemyName = "";
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !pp battle <user>');
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
	//variables to store about player
	let id = message.author.id;
	
	//filters for decisions
	//get the acceptance of battle
	const classFilter = m => {
		if(!classNames.has(m.content) && !m.author.bot){
			m.channel.send('Invalid choice, make sure you spell it exactly as it was sent before!');
		}
		return (classNames.has(m.content) && !m.author.bot);
	}
	const responceFilter = m => {
		return ((m.content === 'accept' || m.content === 'deny') &&(m.author.id == enemyID));
	};
	
	let player1 = client.users.cache.get(id);
	let player2 = client.users.cache.get(enemyID);
	
	let player1Class = '';
	let player2Class = '';
	
	
	message.channel.send(`${enemyName}! Type 'accept' to accept the battle, or 'deny' to reject the battle, You have 1 min to respond!`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == 'accept'){
				message.channel.send(`Fighters, your battle will be in DM's!`);
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
	
	async function classSelection(){
		//get player1 class
		player1.send(`Please select one of the following classes:\nApostle\nGreybeard\nMarauder\nNomad\nWarden\nFarmer`).then(() => {
			//await class selection
			player1.dmChannel.awaitMessages(classFilter, {max:1,time:60000,errors:['time']}).then(p1Class => {
				//assign class to player 1
				player1Class = JSON.parse(JSON.stringify(classNames.get(p1Class.first().content)));
				player1.send(characterDescription(player1Class));
			}).catch(() => {
				message.channel.send(`${playerName} didn't type their response correctly or time expired to respond`);
			});
		}).catch(() => {
			message.channel.send(`Failed to send DM to challenger (make sure you have DM's on for this server!)`);
		});
	}
	
	async function playerChoice(){
		//begin battle
		player1.send(`Type rock, paper, or scissors`).then(()=>{
			player1.dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(challChoice => {
				//DO STUFF WITH PLAYER 1 RESPONSE
				
				
				player1.send(`Got it, going to get opponents choice now`);
				player2.send(`Type rock, paper, or scissors`).then(()=>{
					player2.dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(oppChoice => {
						//DO STUFF WITH PLAYER 2 RESPONSE
						
						
					}).catch(oppChoice => {message.channel.send(`Opponent didn't type their response correctly or time expired to respond`);});
				}).catch(() => {message.channel.send(`Failed to send DM to opponent (make sure you have DM's on for this server!)`);;});
			}).catch(challChoice => {message.channel.send(`Challenger didn't type their response correctly or time expired to respond`);});
		}).catch(() => {message.channel.send(`Failed to send DM to challenger (make sure you have DM's on for this server!)`);});
	}
}
const apostle = {name:'Apostle',attributes:{strength:15,agility:15,toughness:15,intelligence:15,willpower:15,ego:17},attributeModifiers:{dodgeValue:2,penetrationValue:1},equipment:{head:armor.head.wreath,face:armor.face.nothing,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.staff,skill:skills.intimidate};
function characterDescription(character){
	return `The ${character.name}...\nSTATS\nStrength......${character.attributes.strength}\nAgility.......${character.attributes.agility}\nToughness.....${character.attributes.toughness}\nIntelligence..${character.attributes.intelligence}\nWillpower.....${character.attributes.willpower}\nEgo...........${character.attributes.ego}\n
	SKILL\n${character.skill.name}\n${character.skill.description}\n`
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
//export section
module.exports = {
	connect4,
	connectHelp
};