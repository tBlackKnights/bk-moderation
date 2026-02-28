const { Sequelize } = require('sequelize');
const databaseConfig = require("../config/database");
const fs = require("fs");

const modelFiles = fs
    .readdirSync(__dirname + "/../database/models/")
    .filter((file) => file.endsWith(".js"));

const sequelizeService = {
    isInitialized: false,
    init: async () => {
        console.log("[DB] Initializing database...");
        if (sequelizeService.isInitialized) {
            console.log("[DB] Database already initialized. Ignoring new initialization.");
            return;
        }
        sequelizeService.isInitialized = true;

        try {
            const connection = new Sequelize(databaseConfig);
            
            for (const file of modelFiles) {
                const model = await import(`../database/models/${file}`);
                if (model.default && typeof model.default.init === 'function') {
                    model.default.init(connection);
                } else {
                    console.error(`Model ${file} does not have an init method.`);
                }
            }

            modelFiles.map(async (file) => {
                const model = await import(`../database/models/${file}`);
                model.default.associate && model.default.associate(connection.models);
            });

            console.log("[DB] Database initialized");
        } catch (error) {
            console.log("[DB] Error during database service initialization");
            throw error;
        }
    },
};

module.exports = sequelizeService;