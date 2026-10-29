import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../server.js";

const originalFlag = process.env.FEATURE_NEW_DASHBOARD;

afterEach(() => {
  if (originalFlag === undefined) {
    delete process.env.FEATURE_NEW_DASHBOARD;
  } else {
    process.env.FEATURE_NEW_DASHBOARD = originalFlag;
  }
});

describe("GET /feature-flags", () => {
  it("defaults the new dashboard to disabled", async () => {
    delete process.env.FEATURE_NEW_DASHBOARD;

    const response = await request(app).get("/feature-flags");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ newDashboard: false });
  });

  it("enables the new dashboard when the flag is true", async () => {
    process.env.FEATURE_NEW_DASHBOARD = "true";

    const response = await request(app).get("/feature-flags");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ newDashboard: true });
  });

  it.each(["false", "TRUE", "1", "yes", ""])(
    "keeps the dashboard disabled for the value %j",
    async (value) => {
      process.env.FEATURE_NEW_DASHBOARD = value;

      const response = await request(app).get("/feature-flags");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ newDashboard: false });
    },
  );

  it("prevents caching of feature flags", async () => {
    const response = await request(app).get("/feature-flags");

    expect(response.headers["cache-control"]).toBe("no-store");
  });
});