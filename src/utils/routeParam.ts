import type { Request } from "express";

export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new Error(`Missing route param: ${name}`);
  }
  return value;
}

export function routeParamInt(req: Request, name: string): number {
  const n = Number(routeParam(req, name));
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Invalid integer route param: ${name}`);
  }
  return n;
}
