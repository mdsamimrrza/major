import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./utils/schema.ts",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:I0yujTpwXFg2@ep-dawn-violet-a1lbk096.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    }
});
