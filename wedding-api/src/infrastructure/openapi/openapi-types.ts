export interface OpenApiOperation {
  operationId?: string;
  security?: Array<Record<string, string[]>>;
}

export interface OpenApiDocument {
  paths?: Record<string, Record<string, OpenApiOperation | undefined> | undefined>;
}
