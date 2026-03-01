const { Model, DataTypes } = require('sequelize');

class GuildConfig extends Model {
    static init(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            verifiedRoleId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            unverifiedRoleId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            punishmentLogsChannelId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'GuildConfig',
            tableName: 'GuildConfigs',
            timestamps: true,
        });
    }
}

module.exports = GuildConfig;
