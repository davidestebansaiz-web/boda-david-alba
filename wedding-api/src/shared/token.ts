import { randomBytes } from "node:crypto";

export const createOpaqueToken = (): string => randomBytes(16).toString("hex");
