import "dotenv/config";
import { resolve } from "node:path";

import { buildApp } from "./app";

const start = async (): Promise<void> => {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  const openapiPath = resolve(process.cwd(), "openapi.yaml");

  const app = await buildApp({ openapiPath });

  await app.listen({
    port,
    host,
  });
};

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
