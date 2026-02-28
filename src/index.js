const sequelizeService = require("./services/sequelize.service");

(async () => {
    await sequelizeService.init();
})();

require("./bot");