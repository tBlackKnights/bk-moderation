const { Model, DataTypes } = require('sequelize');

class Helper extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            requestId: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Thread ID of the help request',
            },
            helperId: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Discord user ID of the person who helped',
            },
            requesterId: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Discord user ID of the person who requested help',
            },
        }, {
            sequelize,
            modelName: 'Helper',
            tableName: 'Helpers',
            timestamps: true,
        });
    }
}

module.exports = Helper;
