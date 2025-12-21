declare const config: {
    env: "development" | "production" | "test";
    port: number;
    database: {
        url: string;
    };
    openai: {
        apiKey: string;
    };
    gemini: {
        apiKey: string;
    };
    models: {
        primaryProvider: "openai" | "gemini";
        primary: string;
        fallbackProvider: "openai" | "gemini";
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
