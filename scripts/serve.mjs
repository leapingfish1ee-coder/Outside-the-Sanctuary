import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.env.PORT ?? 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT 必须是 1–65535 之间的整数。");
}

const root = new URL("../", import.meta.url);
const routes = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/wiki.html", ["wiki.html", "text/html; charset=utf-8"]],
  ["/game.js", ["game.js", "text/javascript; charset=utf-8"]],
  ...["brand", "hud", "wiki"].map(name => [`/styles/${name}.css`, [`styles/${name}.css`, "text/css; charset=utf-8"]])
]);

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let route;
  try {
    route = routes.get(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (!route) {
    response.writeHead(404);
    response.end();
    return;
  }

  try {
    const content = await readFile(new URL(route[0], root));
    response.writeHead(200, {
      "Content-Type": route[1],
      "Content-Length": content.byteLength
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end();
  }
});

server.on("error", error => {
  console.error(`本地服务启动失败：${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Outside the Sanctuary: http://127.0.0.1:${port}`);
});
