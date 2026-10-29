import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "docs");

export const HOST = "0.0.0.0";
export const DEFAULT_PORT = 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

export function createAppServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(publicDir, relativePath);
    const fromPublic = path.relative(publicDir, filePath);

    if (fromPublic.startsWith("..") || path.isAbsolute(fromPublic)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] ?? "application/octet-stream",
      });
      response.end(body);
    });
  });
}

export function lanUrls(port) {
  const urls = [];
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        urls.push(`http://${address.address}:${port}`);
      }
    }
  }
  return urls;
}

function start() {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const server = createAppServer();
  server.listen(port, HOST, () => {
    console.log(`Open on this computer: http://127.0.0.1:${port}`);
    const phones = lanUrls(port);
    if (phones.length === 0) {
      console.log("No other network address found. Connect to Wi-Fi, then restart.");
      return;
    }
    for (const url of phones) {
      console.log(`Open on your phone: ${url}`);
    }
  });
}

const launchedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (launchedDirectly) start();
