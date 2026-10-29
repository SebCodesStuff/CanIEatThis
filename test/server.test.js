import assert from "node:assert/strict";
import test from "node:test";
import { HOST, createAppServer } from "../server.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, HOST, () => resolve(server.address()));
  });
}

test("server binds to all local network interfaces", () => {
  assert.equal(HOST, "0.0.0.0");
});

test("server serves the camera page", async () => {
  const server = createAppServer();
  const address = await listen(server);

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.match(html, /id="open-camera"/);
    assert.match(html, /capture="environment"/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
