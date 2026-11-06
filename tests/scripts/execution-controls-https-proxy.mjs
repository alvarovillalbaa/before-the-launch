// Disposable CI transport only. Fixed loopback endpoints; never a production proxy.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";

const need = (value, code) => { if (!value) throw new Error(code); };
need(process.argv.length === 4 && process.argv[2] === "--root" && process.env.CI === "true"
  && process.env.EXECUTION_CONTROLS_TEST_TARGET === "local-disposable", "https_fixture_scope_required");
const root = fs.realpathSync(process.argv[3]), item = fs.lstatSync(process.argv[3]);
need(item.isDirectory() && !item.isSymbolicLink() && path.resolve(process.argv[3]) === root
  && path.basename(root).startsWith("btl-execution-")
  && path.dirname(fs.realpathSync(process.env.TMPDIR)) === root, "https_fixture_root_invalid");
const marker = path.join(root, "owner"), owner = fs.lstatSync(marker);
need(owner.isFile() && !owner.isSymbolicLink() && owner.size === 36
  && /^[a-f0-9-]{36}$/.test(fs.readFileSync(marker, "utf8")), "https_fixture_owner_invalid");
const tlsDirectory = path.join(root, "tls"), directory = fs.lstatSync(tlsDirectory);
need(directory.isDirectory() && !directory.isSymbolicLink(), "https_fixture_tls_directory_invalid");
function privateFile(name) {
  const file = path.join(tlsDirectory, name), before = fs.lstatSync(file);
  need(before.isFile() && !before.isSymbolicLink() && (before.mode & 0o077) === 0 && before.size > 0 && before.size <= 16_384, "https_fixture_file_invalid");
  const bytes = fs.readFileSync(file), after = fs.lstatSync(file);
  need(before.dev === after.dev && before.ino === after.ino && before.size === after.size && before.mtimeMs === after.mtimeMs, "https_fixture_file_changed");
  return bytes;
}
const authority = "127.0.0.1:3100", sockets = new Set(), requests = new Set();
const hop = new Set(["connection", "proxy-connection", "keep-alive", "upgrade", "te", "trailer", "transfer-encoding"]);
const headersWithoutHop = headers => Object.fromEntries(Object.entries(headers).filter(([name]) => !hop.has(name)));
let closing = false, failed = false, closeTimer;
const server = https.createServer({ key: privateFile("key.pem"), cert: privateFile("cert.pem"), minVersion: "TLSv1.2" }, (request, response) => {
  if (closing || request.headers.host !== authority || !request.url?.startsWith("/") || request.url.startsWith("//")) {
    response.writeHead(400, { "Content-Type": "text/plain", "Cache-Control": "no-store" }); response.end("Invalid fixture request."); return;
  }
  const headers = headersWithoutHop(request.headers);
  delete headers.forwarded;
  delete headers["x-forwarded-for"];
  headers.host = authority;
  headers["x-forwarded-host"] = authority;
  headers["x-forwarded-port"] = "3100";
  headers["x-forwarded-proto"] = "https";
  const upstream = http.request({ hostname: "127.0.0.1", port: 3101, method: request.method, path: request.url,
    headers, agent: false, timeout: 30_000 }, result => {
    response.writeHead(result.statusCode ?? 502, headersWithoutHop(result.headers));
    result.on("error", () => response.destroy());
    result.pipe(response);
  });
  requests.add(upstream);
  upstream.once("close", () => requests.delete(upstream));
  upstream.once("timeout", () => upstream.destroy());
  upstream.once("error", () => {
    if (!response.headersSent) { response.writeHead(502, { "Content-Type": "text/plain", "Cache-Control": "no-store" }); response.end("Fixture upstream unavailable."); }
    else response.destroy();
  });
  request.once("error", () => upstream.destroy());
  request.once("aborted", () => upstream.destroy());
  response.once("error", () => upstream.destroy());
  response.once("close", () => { if (!response.writableFinished) upstream.destroy(); });
  request.pipe(upstream);
});
server.headersTimeout = 15_000;
server.requestTimeout = 30_000;
server.keepAliveTimeout = 1_000;
server.on("connection", socket => { sockets.add(socket); socket.once("close", () => sockets.delete(socket)); });
server.on("upgrade", (_request, socket) => socket.destroy());
server.on("connect", (_request, socket) => socket.destroy());
function forceClose() {
  for (const request of requests) request.destroy();
  for (const socket of sockets) socket.destroy();
  server.closeAllConnections();
}
function stop() {
  if (closing) { forceClose(); return; }
  closing = true;
  server.close(() => { clearTimeout(closeTimer); process.exitCode = failed ? 1 : 0; });
  server.closeIdleConnections();
  closeTimer = setTimeout(forceClose, 1_500);
}
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, stop);
server.once("error", () => {
  failed = true; process.stderr.write("https_fixture_proxy_failed\n"); stop();
});
server.listen(3100, "127.0.0.1", () => process.stdout.write("https_fixture_proxy_ready\n"));
