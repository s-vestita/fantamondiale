import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rosaPath = path.resolve(__dirname, "rosa.json");

function emptyRosaJson() {
  return JSON.stringify(
    { portieri: [], difensori: [], centrocampisti: [], attaccanti: [] },
    null,
    2
  );
}

function rosaApiPlugin() {
  return {
    name: "rosa-api",
    configureServer(server) {
      server.middlewares.use("/api/rosa", (req, res, next) => {
        if (req.method === "GET") {
          if (!fs.existsSync(rosaPath)) {
            fs.writeFileSync(rosaPath, emptyRosaJson(), "utf8");
          }
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(rosaPath, "utf8"));
          return;
        }
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              JSON.parse(body);
              fs.writeFileSync(rosaPath, body, "utf8");
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), rosaApiPlugin()],
});
