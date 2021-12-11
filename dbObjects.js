const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite'
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);

module.exports = { Users };