function required(name, value) {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function loadConfig(env = process.env) {
    const authMode = (env.AUTH_MODE || "demo").toLowerCase();

    if (!["demo", "oidc"].includes(authMode)) {
        throw new Error("AUTH_MODE must be either 'demo' or 'oidc'.");
    }

    const config = {
        port: Number(env.PORT) || 3000,
        nodeEnv: env.NODE_ENV || "development",
        mongoUri: env.MONGO_URI || "mongodb://127.0.0.1:27017",
        mongoDb: env.MONGO_DB || "taskflow",
        authMode,
        demoUser: env.DEMO_USER || "portfolio-user",
        oidc: null
    };

    if (authMode === "oidc") {
        config.oidc = {
            issuer: required("OIDC_ISSUER", env.OIDC_ISSUER).replace(/\/$/, ""),
            clientId: required("OIDC_CLIENT_ID", env.OIDC_CLIENT_ID),
            clientSecret: required("OIDC_CLIENT_SECRET", env.OIDC_CLIENT_SECRET)
        };
    }

    return config;
}
