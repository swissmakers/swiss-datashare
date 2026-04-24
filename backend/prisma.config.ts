import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL || "file:./data/swiss-datashare.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node --project prisma/seed/tsconfig.seed.json --transpile-only prisma/seed/config.seed.ts",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
