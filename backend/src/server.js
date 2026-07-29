import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import MongoTaskRepository from "./repositories/mongoTaskRepository.js";

const config = loadConfig();
const repository = new MongoTaskRepository({
    uri: config.mongoUri,
    dbName: config.mongoDb
});

try {
    await repository.connect();

    const app = createApp({ repository, config });
    const server = app.listen(config.port, () => {
        console.log(`TaskFlow: http://localhost:${config.port}`);
        console.log(`API docs: http://localhost:${config.port}/api-docs`);
        console.log(`Auth mode: ${config.authMode}`);
    });

    async function shutdown(signal) {
        console.log(`\n${signal} received. Shutting down...`);
        server.close(async () => {
            await repository.close();
            process.exit(0);
        });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
    console.error("TaskFlow failed to start:", error);
    await repository.close();
    process.exit(1);
}
