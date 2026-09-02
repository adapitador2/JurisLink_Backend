import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { after, before } from "node:test";

process.env.ACCESS_TOKEN_SECRET = "jurislink-test-secret";
process.env.CORS_ORIGINS = "https://jurislink.example";

const { default: app } = await import("../app.js");

let server;
let baseUrl;

before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  server.unref();
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections?.();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("healthcheck responde sem depender de autenticação", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("preflight permite a origem configurada em produção", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://jurislink.example",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://jurislink.example");
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
});
