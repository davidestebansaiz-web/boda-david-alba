import type { FastifyInstance, HTTPMethods, preHandlerAsyncHookHandler } from "fastify";

import type { OpenApiDocument } from "../../infrastructure/openapi/openapi-types";
import type { OperationHandlers } from "./operation-handlers";

const supportedMethods = ["get", "post", "patch", "delete"] as const;

const toFastifyPath = (openApiPath: string): string =>
  openApiPath.replaceAll("{", ":").replaceAll("}", "");

export const registerRoutesFromContract = (
  app: FastifyInstance,
  contract: OpenApiDocument,
  handlers: OperationHandlers,
  options?: {
    securedOperationPreHandler?: preHandlerAsyncHookHandler;
  },
): void => {
  const boundOperationIds = new Set<string>();

  for (const [path, pathItem] of Object.entries(contract.paths ?? {})) {
    if (!pathItem) {
      continue;
    }

    for (const method of supportedMethods) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      const operationId = operation.operationId;
      if (!operationId) {
        throw new Error(`Missing operationId for ${method.toUpperCase()} ${path}`);
      }

      const handler = handlers[operationId];
      if (!handler) {
        throw new Error(`No handler mapped for operationId ${operationId}`);
      }

      boundOperationIds.add(operationId);

      const hasSecurityRequirements = Array.isArray(operation.security) && operation.security.length > 0;

      app.route({
        method: method.toUpperCase() as HTTPMethods,
        url: toFastifyPath(path),
        preHandler: hasSecurityRequirements ? options?.securedOperationPreHandler : undefined,
        handler,
      });
    }
  }

  const orphanHandlers = Object.keys(handlers).filter((operationId) => !boundOperationIds.has(operationId));

  if (orphanHandlers.length > 0) {
    throw new Error(`Handlers without OpenAPI operation mapping: ${orphanHandlers.join(", ")}`);
  }
};
