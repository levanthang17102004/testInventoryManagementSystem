import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { routeParam, routeParamInt } from "../../src/utils/routeParam.js";

function reqWithParams(params: Record<string, string | string[]>): Request {
  return { params } as Request;
}

describe("routeParam", () => {
  it("returns string param", () => {
    expect(routeParam(reqWithParams({ id: "5" }), "id")).toBe("5");
  });

  it("throws when param missing", () => {
    expect(() => routeParam(reqWithParams({}), "id")).toThrow(
      "Missing route param: id",
    );
  });
});

describe("routeParamInt", () => {
  it("returns positive integer", () => {
    expect(routeParamInt(reqWithParams({ id: "12" }), "id")).toBe(12);
  });

  it("throws for non-numeric value", () => {
    expect(() => routeParamInt(reqWithParams({ id: "abc" }), "id")).toThrow(
      "Invalid integer route param: id",
    );
  });

  it("throws for zero or negative", () => {
    expect(() => routeParamInt(reqWithParams({ id: "0" }), "id")).toThrow(
      "Invalid integer route param: id",
    );
  });
});
