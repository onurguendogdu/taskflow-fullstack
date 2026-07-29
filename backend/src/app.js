import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { createAuth } from "./auth/createAuth.js";
import { createOpenApi } from "./openapi.js";
import createTaskRouter from "./routes/taskRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.resolve(__dirname, "../../frontend");

export function createApp({ repository, config }) {
    const app = express();
    const auth = createAuth(config);
    const openApi = createOpenApi(config.port);

    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.use(express.json({ limit: "100kb" }));
    app.use(cookieParser());
    app.use(auth.initialize);

    auth.registerRoutes(app);

    app.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "taskflow-api" });
    });

    app.use("/api/tasks", auth.authenticate, createTaskRouter(repository));

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApi, {
        explorer: true,
        customSiteTitle: "TaskFlow API"
    }));
    app.get("/api-docs.json", (_req, res) => res.json(openApi));

    app.use(express.static(frontendPath));
    app.get("/", (_req, res) => res.sendFile(path.join(frontendPath, "index.html")));

    app.use((req, res) => {
        if (req.path.startsWith("/api/")) {
            return res.status(404).json({ message: "API route not found." });
        }
        return res.status(404).send("Not found");
    });

    app.use((error, _req, res, _next) => {
        console.error(error);
        const status = Number(error.statusCode) || 500;
        res.status(status).json({
            message: status >= 500 ? "Unexpected server error." : error.message
        });
    });

    return app;
}
