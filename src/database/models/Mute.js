const { Model, DataTypes } = require('sequelize');

class Mute extends Model {
    static init(sequelize) {
        super.init({
            userId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            proof: {
                type: DataTypes.STRING,
                allowNull: true
            },
            moderatorId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            endsAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: 'Mute',
            tableName: 'Mutes',
            timestamps: true,
        });
    }
}

module.exports = Mute;
