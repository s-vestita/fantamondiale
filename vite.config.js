import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rosaPath = path.resolve(__dirname, "rosa.json");
const formazioniPath = path.resolve(__dirname, "formazioni_giornate.json");

function emptyRosaJson() {
  return JSON.stringify(
    { portieri: [], difensori: [], centrocampisti: [], attaccanti: [] },
    null,
    2
  );
}

const emptyFormazioniJson = JSON.stringify(
  {
    giornate: {
      "1": { modulo: "4-3-3", titolari: [], panchina: [] },
      "2": { modulo: "4-3-3", titolari: [], panchina: [] },
      "3": { modulo: "4-3-3", titolari: [], panchina: [] },
    },
  },
  null,
  2
);

function jsonFileApiPlugin({ name, route, filePath, emptyContent }) {
  return {
    name,
    configureServer(server) {
      server.middlewares.use(route, (req, res, next) => {
        if (req.method === "GET") {
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, emptyContent, "utf8");
          }
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(filePath, "utf8"));
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
              fs.writeFileSync(filePath, body, "utf8");
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
  plugins: [
    react(),
    jsonFileApiPlugin({
      name: "rosa-api",
      route: "/api/rosa",
      filePath: rosaPath,
      emptyContent: emptyRosaJson(),
    }),
    jsonFileApiPlugin({
      name: "formazioni-api",
      route: "/api/formazioni",
      filePath: formazioniPath,
      emptyContent: emptyFormazioniJson,
    }),
  ],
});
