const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, MessageSelectMenu, Formatters } = require('discord.js');
const fs = require('fs');

//player class definitions
const armor = {head:{nothing:{name:'Nothing',av:0,dv:0},wreath:{name:'Witchwood Wreath',av:0,dv:0}},face:{nothing:{name:'Nothing',av:0,dv:0},goggles:{name:'Goggles',av:0,dv:0}},body:{nothing:{name:'Nothing',av:0,dv:0},robe:{name:'Cloth Robe',av:1,dv:0},furs:{name:'Furs',av:2,dv:-1},armor:{name:'Leather Armor',av:2,dv:0},tunic:{name:'Woven Tunic',av:1,dv:2},},arms:{nothing:{name:'Nothing',av:0,dv:0},buckler:{name:'Iron Buckler',av:2,dv:-3}},feet:{nothing:{name:'Nothing',av:0,dv:0},moccasins:{name:'Leather Moccasins',av:0,dv:0}}};

const weapons = {fist:{name:'Fist',pv:1,maxPv:2,damage:4},staff:{name:'Staff',pv:4,maxPv:5,damage:2},dagger:{name:'Bronze Dagger',pv:4,maxPv:5,},axe:{name:'Bronze Battle Axe',pv:4,maxPv:5,damage:2},kris:{name:'Desert Kris',pv:4,maxPv:6,damage:3},sword:{name:'Iron Long Sword',pv:4,maxPv:6,damage:4},vinereaper:{name:'Iron Vinereaper',pv:4,maxPv:6,damage:3}};

const skills = {intimidate:{name:'Intimidate',currentCooldown:0,cooldown:25,duration:8,damage:0,statModify:{strength:-5,agility:1,toughness:0,intelligence:-2,willpower:0,ego:0},description:'Cooldown 25 turns, terrify the enemy, lowering their strength and intelligence for 1-8 turns.'},hobble:{name:'Hobble',currentCooldown:0,cooldown:20,duration:4,damage:0,statModify:{strength:0,agility:-10,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 20 turns, focus on a weak spot in the enemy, if you hit, penetrate once and hobble, lowering their agility for 1-4 turns.'},berate:{name:'Berate',currentCooldown:0,cooldown:40,duration:20,damage:0,statModify:{strength:-5,agility:-5,toughness:0,intelligence:0,willpower:-10,ego:-10},description:'Cooldown 40 turns, shame the enemy for 1-20 rounds, during which they recieve a hit to strength, agility, willpower and ego.'},cleave:{name:'Cleave',currentCooldown:0,cooldown:20,duration:0,damage:10,statModify:{strength:0,agility:0,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 20 turns, cleave the enemy, bypassing their armor and dealing 1-10 true damage.'},lunge:{name:'Lunge',currentCooldown:0,cooldown:10,duration:0,damage:5,statModify:{strength:0,agility:0,toughness:0,intelligence:0,willpower:0,ego:0},description:'Cooldown 10 turns, lunge at the enemy, bypassing their armor and dealing 5 true damage.'}};

const apostle = {name:'Apostle',attributes:{strength:15,agility:15,toughness:15,intelligence:15,willpower:15,ego:17},attributeModifiers:{dodgeValue:2,armorValue:1},equipment:{head:armor.head.wreath,face:armor.face.nothing,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.staff,skill:skills.intimidate,debuffs:[]};

const greybeard = {name:'Greybeard',attributes:{strength:14,agility:15,toughness:15,intelligence:15,willpower:18,ego:15},attributeModifiers:{dodgeValue:-1,armorValue:1},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.staff,skill:skills.berate,debuffs:[]};

const marauder = {name:'Marauder',attributes:{strength:17,agility:15,toughness:15,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:0,armorValue:2},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.furs,arms:armor.arms.nothing,feet:armor.feet.nothing},weapon:weapons.axe,skill:skills.cleave,debuffs:[]};

const nomad = {name:'Nomad',attributes:{strength:15,agility:15,toughness:17,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:-1,armorValue:1},equipment:{head:armor.head.nothing,face:armor.face.goggles,body:armor.body.robe,arms:armor.arms.nothing,feet:armor.feet.moccasins},weapon:weapons.kris,skill:skills.hobble,debuffs:[]};

const warden = {name:'Warden',attributes:{strength:17,agility:15,toughness:15,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:-4,armorValue:4},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.armor,arms:armor.arms.buckler,feet:armor.feet.moccasins},weapon:weapons.sword,skill:skills.lunge,debuffs:[]};

const farmer = {name:'Farmer',attributes:{strength:15,agility:15,toughness:17,intelligence:15,willpower:15,ego:15},attributeModifiers:{dodgeValue:3,armorValue:1},equipment:{head:armor.head.nothing,face:armor.face.nothing,body:armor.body.tunic,arms:armor.arms.nothing,feet:armor.feet.nothing},weapon:weapons.vinereaper,skill:skills.cleave,debuffs:[]};

const classNames = new Map();
classNames.set('Apostle',apostle);
classNames.set('Greybeard',greybeard);
classNames.set('Marauder',marauder);
classNames.set('Nomad',nomad);
classNames.set('Warden',warden);
classNames.set('Farmer',farmer);

const menuOptions = new Map();
menuOptions.set('attack',true);			//attacks with weapon
menuOptions.set('skill',true);			//uses skill
menuOptions.set('defend',true);			//gain AV and DV
menuOptions.set('heal',true);			//heal based on intelligence and willpower
menuOptions.set('description',true);	//all info about a character

/*
const menu = `OPTIONS\n'attack'      -> Attacks the opponent with your weapon\n'skill'       -> Uses your class skill on the opponent\n'defend'      -> Gain extra DV and AV for this turn\n'heal'        -> Use your intelligence and willpower to heal\n'description' -> Get a full description of your character`;

const menuNoDesc = `OPTIONS\n'attack'      -> Attacks the opponent with your weapon\n'skill'       -> Uses your class skill on the opponent\n'defend'      -> Gain extra DV and AV for this turn\n'heal'        -> Use your intelligence and willpower to heal\n`;
*/

//menus
const menuSelect = new MessageActionRow()
	.addComponents(
		new MessageSelectMenu()
			.setCustomId('menu')
			.setPlaceholder('Select an Action')
			.addOptions([
				{
					label: 'Attack',
					description: 'Strike the enemy with Strength',
					value: 'attack'
				},
				{
					label: 'Skill',
					description: 'Use your special',
					value: 'skill'
				},
				{
					label: 'Defend',
					description: 'Boost your defense',
					value: 'defend'
				},
				{
					label: 'Heal',
					description: 'Bandage wounds',
					value: 'heal'
				},
				{
					label: 'Description',
					description: 'Introspect',
					value: 'description'
				},
			])
	);
const menuSelectNoDes = new MessageActionRow()
	.addComponents(
		new MessageSelectMenu()
			.setCustomId('menuNoDes')
			.setPlaceholder('Select an Action')
			.addOptions([
				{
					label: 'Attack',
					description: 'Strike the enemy with Strength',
					value: 'attack'
				},
				{
					label: 'Skill',
					description: 'Use your special',
					value: 'skill'
				},
				{
					label: 'Defend',
					description: 'Boost your defense',
					value: 'defend'
				},
				{
					label: 'Heal',
					description: 'Bandage wounds',
					value: 'heal'
				},
			])
	);
const classSelect = new MessageActionRow()
	.addComponents(
		new MessageSelectMenu()
			.setCustomId('class')
			.setPlaceholder('Select a Class')
			.addOptions([
				{
					label: 'Apostle',
					description: 'A cunning fighter',
					value: 'Apostle'
				},
				{
					label: 'Greybeard',
					description: 'A elderly fighter',
					value: 'Greybeard'
				},
				{
					label: 'Marauder',
					description: 'A strong fighter',
					value: 'Marauder'
				},
				{
					label: 'Nomad',
					description: 'A traveled fighter',
					value: 'Nomad'
				},
				{
					label: 'Warden',
					description: 'A noble fighter',
					value: 'Warden'
				},
				{
					label: 'Farmer',
					description: 'A simple fighter',
					value: 'Farmer'
				},
			])
	);

module.exports = {
	name: 'battle',
	description: 'the battle game',
	async execute(interaction,currency){
		let player = interaction.user;
		let playerID = player.id;
		let playerName = player.username;
		let enemy = interaction.options.getUser('user'); 
		let enemyID = enemy.id;
		let enemyName = enemy.username;
		let betAmount = interaction.options.getInteger('bet');
		if(betAmount < 0){
			await interaction.reply({ content: `Invalid bet amount!`, ephemeral: true });
			return;
		}
		//check if trying to battle self temp disabled for testing
		if(playerID == enemyID){
			interaction.reply({ content: 'You cannot play with yourself..... weirdo', ephemeral: true });
			return;
		}
		if(enemy.bot){
			interaction.reply({ content: 'You cannot play with an AI', ephemeral: true });
			return;
		}
		
		if(await currency.getBalance(playerID) - betAmount < 0){
			interaction.reply({ content: `You don't have enough coins!`, ephemeral: true });
			return;
		}
		if(await currency.getBalance(enemyID) - betAmount < 0){
			interaction.reply({ content: `Your opponent doesn't have enough coins!`, ephemeral: true });
			return;
		}
		
		const guildID = interaction.guildId;
		let user = await currency.get(playerID);
		await user.addGuild(guildID);
		
		user = await currency.get(enemyID);
		await user.addGuild(guildID);
		
		await interaction.reply(`Starting battle...`);
		
		//variables to store about player
		let id = interaction.user.id;
		
		//get the acceptance of battle
		const startFilter = i => i.user.id === enemyID && (i.customId === 'accept' || i.customId === 'deny');
		const accRow = new MessageActionRow()
			.addComponents(
			new MessageButton()
				.setCustomId('accept')
				.setLabel('Accept')
				.setStyle('SUCCESS'),
			new MessageButton()
				.setCustomId('deny')
				.setLabel('Deny')
				.setStyle('DANGER'),
		);
		const accCollector = await interaction.channel.createMessageComponentCollector({filter:startFilter, time: 60000});
		
		let player1 = player;
		let player2 = enemy;
		
		let player1Class = '';
		let player2Class = '';
		
		let player1Choice = '';
		let player2Choice = '';
		
		let player1HP = 20;
		let player2HP = 20;
		
		let turnCount = 0;
		
		let noGame = true;
		
		
		let player1DM = await player.createDM();
		let player2DM = await enemy.createDM();
		const player1Collector = await player1DM.createMessageComponentCollector();
		const player2Collector = await player2DM.createMessageComponentCollector();
		
		await interaction.editReply({content:`${enemy}! With ${betAmount} coins on the line, Click 'accept' to accept the battle, or 'deny' to reject the battle, You have 1 min to respond!`,components:[accRow]}).then(msg => {
			accCollector.once('collect',async buttInteraction => {
				noGame = false;
				if(buttInteraction.customId == 'accept'){
					await interaction.editReply({content:`Fighters, your battle will be in DM's!`,components:[]});
					classSelection();
				}
				else if(buttInteraction.customId == 'deny'){
					await interaction.editReply({content:`You have declined the game!`,components:[]});
					return;
				}
			});
			accCollector.once('end',async collected => {
				if(noGame){
					await interaction.deleteReply().catch(e => console.log('no interaction exists'));
				}
			})
		});
		
		async function classSelection(){
			//get player1 class
			player1.send({content:`Please select a class`,code:true,components:[classSelect]}).then(() => {
				//await class selection
				player1Collector.once('collect', async player1ClassInt => {
					//assign class to player 1
					player1Class = JSON.parse(JSON.stringify(classNames.get(player1ClassInt.values[0])));
					await player1ClassInt.update({components:[]});
					player1HP += player1Class.attributes.toughness;
					player1.send(characterDescription(player1Class),{code:true});
					player1.send(`Getting opponents class, the game will start soon!`);
					player2.send({content:`Please select a class`,code:true,components:[classSelect]}).then(() => {
						player2Collector.once('collect',async player2ClassInt => {
							//assign player2 class
							player2Class = JSON.parse(JSON.stringify(classNames.get(await player2ClassInt.values[0])));
							await player2ClassInt.update({components:[]});
							player2HP += player2Class.attributes.toughness;
							player2.send(characterDescription(player2Class),{code:true});
							//message all players that the battle has begun
							player1.send(`Get ready, the game will now start with you!`);
							player2.send(`Get ready, the game will now start with player 1!`);
							await interaction.editReply(Formatters.codeBlock(`${playerName} the ${player1Class.name} vs ${enemyName} the ${player2Class.name}`)).then(() => {
								player1Menu();
							});
						})
					}).catch(() => {
						interaction.editReply(`Failed to send DM to player 2 (make sure you have DM's on for this server!)`);
					});
				})
			}).catch(() => {
				interaction.editReply(`Failed to send DM to player 1 (make sure you have DM's on for this server!)`);
			});
		}
		
		async function player1Menu(){
			//begin battle
			let p1menu = Formatters.codeBlock(`Your HP -> ${player1HP}\nSelect an Action`);
			player1.send({content:p1menu,components:[menuSelect]}).then(p1MenuMsg =>{
				player1Collector.once('collect', player1ChoiceInt => {
					//use player 1 menu response to determine next action
					player1Choice = player1ChoiceInt.values[0];
					player1ChoiceInt.update({components:[]});
					//special handle for description
					if(player1Choice === 'description'){
						player1.send(characterDescription(player1Class)).then(p1DescMsg =>{
							player1.send({content:`Please select an action`, components:[menuSelectNoDes]}).then(p1MenuMsgNoDesc => {
								player1Collector.once('collect',player1ChoiceInt2 => {
									player1Choice = player1ChoiceInt2.values[0];
									player1.send(`Getting player 2 action for this turn...`);
									player2Menu();
								})
							}).catch(e => {
								interaction.editReply(`Failed to send message to player 1 (make sure you have DM's on for this server!)`);
								return;
							});
						}).catch(e => {
							interaction.editReply(`Failed to send message to player 1 (make sure you have DM's on for this server!)`);
							return;
						});;
					}
					else{
						player1.send(`Getting player 2 action for this turn...`);
						player2Menu();
					}
				})
			}).catch(() => {
				interaction.editReply(`Failed to send DM to Player 1 (make sure you have DM's on for this server!)`);
			});
		}
		
		async function player2Menu(){
			//begin battle
			let p2menu = Formatters.codeBlock(`Your HP -> ${player2HP}\nSelect an Action`);
			player2.send({content:p2menu,components:[menuSelect]}).then(p2MenuMsg =>{
				player2Collector.once('collect', player2ChoiceInt => {
					//use player 2 menu response to determine next action
					player2Choice = player2ChoiceInt.values[0];
					player2ChoiceInt.update({components:[]});
					//special handle for description
					if(player2Choice === 'description'){
						player2.send(characterDescription(player2Class)).then(p2DescMsg =>{
							player2.send({content:`Please select an action`, components:[menuSelectNoDes]}).then(p2MenuMsgNoDesc => {
								player2Collector.once('collect',player2ChoiceInt2 => {
									player2Choice = player2ChoiceInt2.values[0];
									player2.send(`Getting player 2 action for this turn...`);
									doTurn();
								})
							}).catch(e => {
								interaction.editReply(`Failed to send message to player 2 (make sure you have DM's on for this server!)`);
								return;
							});
						}).catch(e => {
							interaction.editReply(`Failed to send message to player 2 (make sure you have DM's on for this server!)`);
							return;
						});;
					}
					else{
						doTurn();
					}
				})
			}).catch(() => {
				interaction.editReply(`Failed to send DM to Player 2 (make sure you have DM's on for this server!)`);
			});
		}
		
		function doTurn(){
			turnCount += 1;
			let info = `Turn ${turnCount}\n`;
			//get info that doesnt change
			let player1DV = player1Class.attributeModifiers.dodgeValue;
			let player1AV = player1Class.attributeModifiers.armorValue;
			let player2DV = player2Class.attributeModifiers.dodgeValue;
			let player2AV = player2Class.attributeModifiers.armorValue;
			if(player1Choice == 'defend'){
				let dvBonus = Math.floor(Math.random() * Math.floor(player1Class.attributes.agility / 4)) + 1;
				player1DV += dvBonus;
				let avBonus = Math.floor(Math.random() * Math.floor(player1Class.attributes.toughness / 4)) + 1;
				player1AV += avBonus;
				info += `${playerName} prepares their defenses, raising their DV by ${dvBonus} and AV by ${avBonus}!\n`;
			}
			if(player2Choice == 'defend'){
				let dvBonus = Math.floor(Math.random() * Math.floor(player2Class.attributes.agility / 4)) + 1;
				player2DV += dvBonus;
				let avBonus = Math.floor(Math.random() * Math.floor(player2Class.attributes.toughness / 4)) + 1;
				player2AV += avBonus;
				info += `${enemyName} prepares their defenses, raising their DV by ${dvBonus} and AV by ${avBonus}!\n`;
			}
			if(player1Choice == 'heal'){
				let healAmount = Math.floor(Math.random() * Math.floor(player1Class.attributes.intelligence / 2)) + 7;
				player1HP += healAmount;
				info += `${playerName} bandages their wounds healing ${healAmount} HP!\n`;
			}
			if(player2Choice == 'heal'){
				let healAmount = Math.floor(Math.random() * Math.floor(player2Class.attributes.intelligence / 2)) + 7;
				player2HP += healAmount;
				info += `${enemyName} bandages their wounds healing ${healAmount} HP!\n`;
			}
			let player2SkillAct = false;
			if(player1Choice == 'skill'){
				if(player2Choice == 'skill' && player2Class.attributes.agility > player1Class.attributes.agility){
					//player2 skill goes first
					player2SkillAct = true;
					if(player2Class.skill.currentCooldown != 0){
						info += `${enemyName} tried to use ${player2Class.skill.name}, but it is on cooldown for another ${player2Class.skill.currentCooldown} turns!\n`;
						player2Choice = 'attack';
					}
					else{
						if(Math.floor(Math.random() * player2Class.attributes.ego) > Math.floor(player1Class.attributes.ego / 2)){
							//modify stats
							player1HP -= Math.floor(Math.random() * player2Class.skill.damage) + 1;
							player1Class.attributes.strength += player2Class.skill.statModify.strength;
							player1Class.attributes.agility += player2Class.skill.statModify.agility;
							player1Class.attributes.toughness += player2Class.skill.statModify.toughness;
							player1Class.attributes.intelligence += player2Class.skill.statModify.intelligence;
							player1Class.attributes.willpower += player2Class.skill.statModify.willpower;
							player1Class.attributes.ego += player2Class.skill.statModify.ego;
							
							let debuffDuration = Math.floor(Math.random() * player2Class.skill.duration);
							player2Class.skill.currentCooldown = player2Class.skill.cooldown;
							
							let debuff = {name:player2Class.skill.name,duration:debuffDuration, statModify:player2Class.skill.statModify};
							player1Class.debuffs.push(debuff);
							
							info += `${enemyName} uses '${player2Class.skill.name}' on ${playerName}!\n`;
							if(player1HP <= 0){
								info += `${playerName} topples over and dies! ${enemyName} has won!\n`;
								//update users
								currency.addBalance(enemyID,betAmount);
								currency.addWin(enemyID);
								currency.subBalance(playerID,betAmount);
								currency.addLoss(playerID);
								info = Formatters.codeBlock(info);
								player1.send(info);
								player2.send(info);
								interaction.editReply(info);
								return;
							}
						}
						else{
							player2Class.skill.currentCooldown = player2Class.skill.cooldown;
							info += `${enemyName} tried to use '${player2Class.skill.name}' on ${playerName} but failed!\n`;
						}
					}
				}
				//player 1 skill
				if(player1Class.skill.currentCooldown != 0){
					info += `${playerName} tried to use ${player1Class.skill.name}, but it is on cooldown for another ${player1Class.skill.currentCooldown} turns!\n`;
					player1Choice = 'attack';
				}
				else{
					if(Math.floor(Math.random() * player1Class.attributes.ego) > Math.floor(player2Class.attributes.ego / 2)){
						//modify stats
						player2HP -= Math.floor(Math.random() * player1Class.skill.damage) + 1;
						player2Class.attributes.strength += player1Class.skill.statModify.strength;
						player2Class.attributes.agility += player1Class.skill.statModify.agility;
						player2Class.attributes.toughness += player1Class.skill.statModify.toughness;
						player2Class.attributes.intelligence += player1Class.skill.statModify.intelligence;
						player2Class.attributes.willpower += player1Class.skill.statModify.willpower;
						player2Class.attributes.ego += player1Class.skill.statModify.ego;
						
						let debuffDuration = Math.floor(Math.random() * player1Class.skill.duration);
						player1Class.skill.currentCooldown = player1Class.skill.cooldown;
						
						let debuff = {name:player1Class.skill.name,duration:debuffDuration, statModify:player1Class.skill.statModify};
						player2Class.debuffs.push(debuff);
						
						info += `${playerName} uses '${player1Class.skill.name}' on ${enemyName}!\n`;
						if(player2HP <= 0){
							info += `${enemyName} topples over and dies! ${playerName} has won!\n`;
							//update users
							currency.addBalance(playerID,betAmount);
							currency.addWin(playerID);
							currency.subBalance(enemyID,betAmount);
							currency.addLoss(enemyID);
							info = Formatters.codeBlock(info);
							player1.send(info);
							player2.send(info);
							interaction.editReply(info);
							return;
						}
					}
					else{
						player1Class.skill.currentCooldown = player1Class.skill.cooldown;
						info += `${playerName} tried to use '${player1Class.skill.name}' on ${enemyName} but failed!\n`;
					}
				}
			}
			if(player2Choice == 'skill' && !player2SkillAct){
				if(player2Class.skill.currentCooldown != 0){
					info += `${enemyName} tried to use ${player2Class.skill.name}, but it is on cooldown for another ${player2Class.skill.currentCooldown} turns!\n`;
					player2Choice = 'attack';
				}
				else{
					if(Math.floor(Math.random() * player2Class.attributes.ego) > Math.floor(player1Class.attributes.ego / 2)){
						//modify stats
						player1HP -= Math.floor(Math.random() * player2Class.skill.damage) + 1;
						player1Class.attributes.strength += player2Class.skill.statModify.strength;
						player1Class.attributes.agility += player2Class.skill.statModify.agility;
						player1Class.attributes.toughness += player2Class.skill.statModify.toughness;
						player1Class.attributes.intelligence += player2Class.skill.statModify.intelligence;
						player1Class.attributes.willpower += player2Class.skill.statModify.willpower;
						player1Class.attributes.ego += player2Class.skill.statModify.ego;
						
						let debuffDuration = Math.floor(Math.random() * player2Class.skill.duration);
						player2Class.skill.currentCooldown = player2Class.skill.cooldown;
						
						let debuff = {name:player2Class.skill.name,duration:debuffDuration, statModify:player2Class.skill.statModify};
						player1Class.debuffs.push(debuff);
						
						info += `${enemyName} uses '${player2Class.skill.name}' on ${playerName}!\n`;
						if(player1HP <= 0){
							info += `${playerName} topples over and dies! ${enemyName} has won!\n`;
							//update users
							currency.addBalance(enemyID,betAmount);
							currency.addWin(enemyID);
							currency.subBalance(playerID,betAmount);
							currency.addLoss(playerID);
							info = Formatters.codeBlock(info);
							player1.send(info);
							player2.send(info);
							interaction.editReply(info);
							return;
						}
					}
					else{
						player2Class.skill.currentCooldown = player2Class.skill.cooldown;
						info += `${enemyName} tried to use '${player2Class.skill.name}' on ${playerName} but failed!\n`;
					}
				}
			}
			//attack
			let player2AttackAct = false;
			if(player1Choice == 'attack'){
				if(player2Choice == 'attack' && player2Class.attributes.agility > player1Class.attributes.agility){
					//player2 skill goes first
					player2AttackAct = true;
					player2Damage = Math.floor(Math.random() * (player2Class.attributes.strength + player2Class.weapon.damage)) + Math.floor(Math.random() * player2Class.weapon.maxPv) + player2Class.weapon.pv;
					player1Dodge = Math.floor(Math.random() * player1Class.attributes.agility) + player1Class.attributeModifiers.dodgeValue;
					player1Armor = Math.floor(Math.random() * player1Class.attributes.toughness) + player1Class.attributeModifiers.armorValue;
					if(player1Dodge > player2Damage){
						info += `${playerName} dodged ${enemyName}'s attack!\n`;
					}
					else if(player1Armor > player2Damage){
						info += `${playerName}'s armor deflected ${enemyName}'s attack!\n`;
					}
					else{
						player1HP -= player2Damage;
						info += `${enemyName} strikes ${playerName} with their ${player2Class.weapon.name} for ${player2Damage} damage!\n`;
						if(player1HP <= 0){
							info += `${playerName} topples over and dies! ${enemyName} has won!\n`;
							//update users
							currency.addBalance(enemyID,betAmount);
							currency.addWin(enemyID);
							currency.subBalance(playerID,betAmount);
							currency.addLoss(playerID);
							info = Formatters.codeBlock(info);
							player1.send(info);
							player2.send(info);
							interaction.editReply(info);
							return;
						}
					}
				}
				//player 1 attack
				player1Damage = Math.floor(Math.random() * (player1Class.attributes.strength + player1Class.weapon.damage)) + Math.floor(Math.random() * player1Class.weapon.maxPv) + player1Class.weapon.pv;
				player2Dodge = Math.floor(Math.random() * player2Class.attributes.agility) + player2Class.attributeModifiers.dodgeValue;
				player2Armor = Math.floor(Math.random() * player2Class.attributes.toughness) + player2Class.attributeModifiers.armorValue;
				if(player2Dodge > player1Damage){
					info += `${enemyName} dodged ${playerName}'s attack!\n`;
				}
				else if(player2Armor > player1Damage){
					info += `${enemyName}'s armor deflected ${playerName}'s attack!\n`;
				}
				else{
					player2HP -= player1Damage;
					info += `${playerName} strikes ${enemyName} with their ${player1Class.weapon.name} for ${player1Damage} damage!\n`;
					if(player2HP <= 0){
						info += `${enemyName} topples over and dies! ${playerName} has won!\n`;
						//update users
						currency.addBalance(playerID,betAmount);
						currency.addWin(playerID);
						currency.subBalance(enemyID,betAmount);
						currency.addLoss(enemyID);
						info = Formatters.codeBlock(info);
						player1.send(info);
						player2.send(info);
						interaction.editReply(info);
						return;
					}
				}
			}
			if(player2Choice == 'attack' && !player2AttackAct){
				player2Damage = Math.floor(Math.random() * (player2Class.attributes.strength + player2Class.weapon.damage)) + Math.floor(Math.random() * player2Class.weapon.maxPv) + player2Class.weapon.pv;
				player1Dodge = Math.floor(Math.random() * player1Class.attributes.agility) + player1Class.attributeModifiers.dodgeValue;
				player1Armor = Math.floor(Math.random() * player1Class.attributes.toughness) + player1Class.attributeModifiers.armorValue;
				if(player1Dodge > player2Damage){
					info += `${playerName} dodged ${enemyName}'s attack!\n`;
				}
				else if(player1Armor > player2Damage){
					info += `${playerName}'s armor deflected ${enemyName}'s attack!\n`;
				}
				else{
					player1HP -= player2Damage;
					info += `${enemyName} strikes ${playerName} with their ${player2Class.weapon.name} for ${player2Damage} damage!\n`;
					if(player1HP <= 0){
						info += `${playerName} topples over and dies! ${enemyName} has won!\n`;
						//update users
						currency.addBalance(enemyID,betAmount);
						currency.addWin(enemyID);
						currency.subBalance(playerID,betAmount);
						currency.addLoss(playerID);
						info = Formatters.codeBlock(info);
						player1.send(info);
						player2.send(info);
						interaction.editReply(info);
						return;
					}
				}
			}
			//increment debuffs
			if(player1Class.debuffs.length > 0){
				for(let i=0;i<player1Class.debuffs.length;i++){
					player1Class.debuffs[i].duration -= 1;
					if(player1Class.debuffs[i].duration <= 0){
						//clean up effects of debuff
						player1Class.attributes.strength += player1Class.debuffs[i].statModify.strength * -1;
						player1Class.attributes.agility += player1Class.debuffs[i].statModify.agility * -1;
						player1Class.attributes.toughness += player1Class.debuffs[i].statModify.toughness * -1;
						player1Class.attributes.intelligence += player1Class.debuffs[i].statModify.intelligence * -1;
						player1Class.attributes.willpower += player1Class.debuffs[i].statModify.willpower * -1;
						player1Class.attributes.ego += player1Class.debuffs[i].statModify.ego * -1;
						
						info += `${playerName} has overcome the effects of ${player1Class.debuffs[i].name}!\n`;
						player1Class.debuffs.splice(i,1);
						i = i-1;
					}
				}
			}
			if(player2Class.debuffs.length > 0){
				for(let i=0;i<player2Class.debuffs.length;i++){
					player2Class.debuffs[i].duration -= 1;
					if(player2Class.debuffs[i].duration <= 0){
						//clean up effects of debuff
						player2Class.attributes.strength += player2Class.debuffs[i].statModify.strength * -1;
						player2Class.attributes.agility += player2Class.debuffs[i].statModify.agility * -1;
						player2Class.attributes.toughness += player2Class.debuffs[i].statModify.toughness * -1;
						player2Class.attributes.intelligence += player2Class.debuffs[i].statModify.intelligence * -1;
						player2Class.attributes.willpower += player2Class.debuffs[i].statModify.willpower * -1;
						player2Class.attributes.ego += player2Class.debuffs[i].statModify.ego * -1;
						
						info += `${enemyName} has overcome the effects of ${player2Class.debuffs[i].name}!\n`;
						player2Class.debuffs.splice(i,1);
						i = i-1;
					}
				}
			}
			//tick down cooldown
			if(player1Class.skill.currentCooldown > 0){
				player1Class.skill.currentCooldown -= 1;
			}
			if(player2Class.skill.currentCooldown > 0){
				player2Class.skill.currentCooldown -= 1;
			}
			info = Formatters.codeBlock(info);
			player1.send(info);
			player2.send(info);
			interaction.editReply(info).then(() => {
				player1Menu();
			});
		}
	}
}

function characterDescription(character){
	let debuffList = ``;
	for(let i=0;i<character.debuffs.length;i++){
		debuffList += `${character.debuffs[i].name} for ${character.debuffs[i].duration}\n`;
	}
	return Formatters.codeBlock(`The ${character.name}...\nSTATS\nStrength......${character.attributes.strength}\nAgility.......${character.attributes.agility}\nToughness.....${character.attributes.toughness}\nIntelligence..${character.attributes.intelligence}\nWillpower.....${character.attributes.willpower}\nEgo...........${character.attributes.ego}\nSKILL\n${character.skill.name}\n${character.skill.description}\n${character.skill.currentCooldown} Turns until available (0 means ready)\nEQUIPMENT\nHead.........${character.equipment.head.name} ${character.equipment.head.av} AV ${character.equipment.head.dv} DV\nFace.........${character.equipment.face.name} ${character.equipment.face.av} AV ${character.equipment.face.dv} DV\nBody.........${character.equipment.body.name} ${character.equipment.body.av} AV ${character.equipment.body.dv} DV\nArms.........${character.equipment.arms.name} ${character.equipment.arms.av} AV ${character.equipment.arms.dv} DV\nFeet.........${character.equipment.feet.name} ${character.equipment.feet.av} AV ${character.equipment.feet.dv} DV\nWEAPON\n${character.weapon.name}.....${character.weapon.pv}/${character.weapon.maxPv} PV ${character.weapon.damage} damage\nCURRENT DEBUFFS\n${debuffList}`);
}