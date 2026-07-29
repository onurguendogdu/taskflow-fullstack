import { createPublicKey, randomBytes } from "node:crypto";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

export function createAuth(config) {
    if (config.authMode === "demo") {
        return {
            initialize: (_req, _res, next) => next(),
            authenticate: (req, _res, next) => {
                req.user = { username: config.demoUser };
                next();
            },
            registerRoutes(app) {
                app.get("/auth/me", (_req, res) => {
                    res.json({ username: config.demoUser, mode: "demo" });
                });
                app.get("/login", (_req, res) => res.redirect("/"));
                app.get("/logout", (_req, res) => res.redirect("/"));
            }
        };
    }

    const { issuer, clientId, clientSecret } = config.oidc;
    const jwksUrl = `${issuer}/protocol/openid-connect/certs`;
    const tokenUrl = `${issuer}/protocol/openid-connect/token`;
    const loginUrl = `${issuer}/protocol/openid-connect/auth`;

    let cachedKeys = new Map();
    let cacheValidUntil = 0;

    async function loadPublicKeys() {
        const response = await fetch(jwksUrl);
        if (!response.ok) {
            throw new Error(`Unable to load OIDC signing keys (${response.status}).`);
        }

        const jwks = await response.json();
        const keys = new Map();

        for (const jwk of jwks.keys || []) {
            if (!jwk.kid) continue;
            const keyObject = createPublicKey({ key: jwk, format: "jwk" });
            keys.set(
                jwk.kid,
                keyObject.export({ type: "spki", format: "pem" })
            );
        }

        cachedKeys = keys;
        cacheValidUntil = Date.now() + 5 * 60 * 1000;
    }

    async function findPublicKey(rawToken) {
        const encodedHeader = rawToken.split(".")[0];
        const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));

        if (!header.kid) throw new Error("JWT does not contain a key ID.");

        if (Date.now() >= cacheValidUntil || !cachedKeys.has(header.kid)) {
            await loadPublicKeys();
        }

        const key = cachedKeys.get(header.kid);
        if (!key) throw new Error("No matching OIDC signing key found.");
        return key;
    }

    passport.use(
        "taskflow-jwt",
        new JwtStrategy(
            {
                jwtFromRequest: (req) =>
                    ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req.cookies?.token || null,
                secretOrKeyProvider: (_req, rawToken, done) => {
                    findPublicKey(rawToken).then((key) => done(null, key)).catch(done);
                },
                issuer,
                algorithms: ["RS256"],
                ignoreExpiration: false
            },
            (payload, done) => {
                const username = payload.preferred_username || payload.email || payload.sub;
                return username ? done(null, { ...payload, username }) : done(null, false);
            }
        )
    );

    const authenticate = passport.authenticate("taskflow-jwt", { session: false });

    return {
        initialize: passport.initialize(),
        authenticate,
        registerRoutes(app) {
            app.get("/login", (req, res) => {
                const state = randomBytes(24).toString("hex");
                const redirectUri = `${req.protocol}://${req.get("host")}/oauth_callback`;
                const params = new URLSearchParams({
                    response_type: "code",
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    scope: "openid profile email",
                    state
                });

                res.cookie("oauth_state", state, {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: req.protocol === "https",
                    maxAge: 10 * 60 * 1000
                });

                res.redirect(`${loginUrl}?${params}`);
            });

            app.get("/oauth_callback", async (req, res, next) => {
                try {
                    if (!req.query.code || req.query.state !== req.cookies.oauth_state) {
                        return res.status(400).send("Invalid OAuth callback.");
                    }

                    const redirectUri = `${req.protocol}://${req.get("host")}/oauth_callback`;
                    const body = new URLSearchParams({
                        grant_type: "authorization_code",
                        code: String(req.query.code),
                        redirect_uri: redirectUri
                    });

                    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
                    const response = await fetch(tokenUrl, {
                        method: "POST",
                        headers: {
                            Authorization: `Basic ${basic}`,
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body
                    });

                    const data = await response.json();
                    if (!response.ok || !data.access_token) {
                        return res.status(502).send("Unable to obtain access token.");
                    }

                    res.cookie("token", data.access_token, {
                        httpOnly: true,
                        sameSite: "lax",
                        secure: req.protocol === "https",
                        maxAge: Number(data.expires_in || 300) * 1000
                    });
                    res.clearCookie("oauth_state");
                    return res.redirect("/");
                } catch (error) {
                    return next(error);
                }
            });

            app.get("/logout", (req, res) => {
                res.clearCookie("token");
                res.clearCookie("oauth_state");
                res.redirect("/");
            });

            app.get("/auth/me", authenticate, (req, res) => {
                res.json({ username: req.user.username, mode: "oidc" });
            });
        }
    };
}
