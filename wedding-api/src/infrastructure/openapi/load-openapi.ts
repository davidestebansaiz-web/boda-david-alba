import { readFile } from "node:fs/promises";

import SwaggerParser from "@apidevtools/swagger-parser";
import { parse } from "yaml";

import type { OpenApiDocument } from "./openapi-types";

export const loadAndValidateOpenApi = async (openapiPath: string): Promise<OpenApiDocument> => {
  const rawContent = await readFile(openapiPath, "utf8");
  const document = parse(rawContent);

  await SwaggerParser.validate(document as any);

  return document as OpenApiDocument;
};
