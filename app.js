const mariadb = require("./lib/connection");
module.exports = (app) => {
    app.on('configDidLoad', async () => {
        app.mariadb = await mariadb(app);

        try {
            await app.mariadb.get('SELECT NOW() AS currentTime;');
            app.coreLogger.info(`\x1B[34m▉ Mariadb connection success;\x1B[0m`);
        }catch (e) {
            throw e;
        }
    });

    app.on('beforeClose', async () => {
        try {
            await app.mariadb.end();
            app.coreLogger.info(`\x1B[34m▉ Mariadb connection closed;\x1B[0m`);
        }catch (e) {
            app.coreLogger.info(`\x1B[31m▉ Mariadb connection close error;\x1B[0m`);
            app.coreLogger.error(e);
        }
    });
};
