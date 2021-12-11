const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite'
});

require('./models/Users.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({force}).then(async () => {
	console.log('database synced');
	sequelize.close();
}).catch(console.error);