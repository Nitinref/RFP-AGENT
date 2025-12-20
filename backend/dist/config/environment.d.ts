declare const config: {
    env: "development" | "production" | "test";
    port: number;
    database: {
        url: string;
    };
    anthropic: {
        apiKey: string;
    };
    models: {
        primary: string;
        fallback: string;
    };
    jwt: {
        secret: string;
        expiresIn: number | import("ms").StringValue;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    logging: {
        level: string;
        logQueries: boolean;
    };
    upload: {
        maxFileSizeMB: number;
        uploadDir: string;
    };
    workflow: {
        maxRetries: number;
        retryDelayMs: number;
    };
};
export default config;
