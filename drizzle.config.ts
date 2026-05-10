import { defineConfig } from "drizzle-kit";

import {readConfig} from "./src/config.ts";

const config = readConfig();

if (!config?.dbUrl || !config?.dbUrl.startsWith("postgres://")) {
	throw new Error("config file doesn't have dbUrl or not valid url");
}


export default defineConfig({
  schema: "src/schema.ts",
  out: "src/lib/db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,
  },
});