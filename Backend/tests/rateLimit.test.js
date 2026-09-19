import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../middleware/rateLimit.js";

function fakeReqRes(ip, path) {
  const req = { ip, baseUrl: "", path };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    set(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  return { req, res };
}

test("rateLimit allows requests under the limit", () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 3 });
  const { req, res } = fakeReqRes("1.2.3.4", "/login");
  let nextCalled = 0;
  const next = () => { nextCalled += 1; };

  limiter(req, res, next);
  limiter(req, res, next);
  limiter(req, res, next);

  assert.equal(nextCalled, 3);
  assert.equal(res.statusCode, 200);
});

test("rateLimit blocks requests once the max is exceeded", () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2, message: "slow down" });
  const { req, res } = fakeReqRes("5.6.7.8", "/login");
  let nextCalled = 0;
  const next = () => { nextCalled += 1; };

  limiter(req, res, next); // 1st - allowed
  limiter(req, res, next); // 2nd - allowed
  limiter(req, res, next); // 3rd - blocked

  assert.equal(nextCalled, 2);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.message, "slow down");
});

test("rateLimit tracks separate IPs independently", () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 1 });
  const a = fakeReqRes("9.9.9.9", "/login");
  const b = fakeReqRes("8.8.8.8", "/login");
  let allowed = 0;
  const next = () => { allowed += 1; };

  limiter(a.req, a.res, next);
  limiter(b.req, b.res, next);

  assert.equal(allowed, 2);
  assert.equal(a.res.statusCode, 200);
  assert.equal(b.res.statusCode, 200);
});
