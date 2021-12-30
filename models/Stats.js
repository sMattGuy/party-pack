module.exports = (sequelize, DataTypes) => {
	return sequelize.define('stats', {
		user_id:{
			type: DataTypes.STRING,
			primaryKey: true,
		},
		atk:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		def:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		chr:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		spc:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		inte:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		lvl:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		exp:{
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},{
		timestamps: false,
	});
};