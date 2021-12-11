const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite'
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);

Reflect.defineProperty(Users.prototype, 'addGuild', {
	value: async function addGuild(guild){
		const userGuild = await Guilds.findOne({
			where:{user_id: this.user_id, guild_id:guild}
		});
		if(userGuild){
			//already exists, ignore
			return;
		}
		//add user to guild
		return Guilds.create({user_id: this.user_id, guild_id:guild});
	}
});

Reflect.defineProperty(Users.prototype, 'checkGuild', {
	value: function checkGuild(guild){
		return Guilds.findOne({
			where:{user_id: this.user_id, guild_id:guild}
		});
	}
});

Reflect.defineProperty(Users.prototype, 'countGuilds', {
	value: async function countGuilds(){
		return await Guilds.count({
			where:{user_id: this.user_id}
		});
	}
});

module.exports = { Users, Guilds };