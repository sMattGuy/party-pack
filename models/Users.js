module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id:{
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		wins:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		loses:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},{
		timestamps: false,
	});
};