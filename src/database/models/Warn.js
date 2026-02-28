const { Model, DataTypes } = require('sequelize');

class Warn extends Model {
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
            }
        }, {
            sequelize,
            modelName: 'Warn',
            tableName: 'Warns',
            timestamps: true,
        });
    }
}

module.exports = Warn;
