// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
   seed: "node --loader ts-node/esm src/prisma/seed.ts"

  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
