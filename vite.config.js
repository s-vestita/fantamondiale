import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rosaPath = path.resolve(__dirname, "rosa.json");
const rosaInizialePath = path.resolve(__dirname, "rosa_iniziale.json");
const formazioniPath = path.resolve(__dirname, "formazioni_giornate.json");
const squadreDir = path.resolve(__dirname, "squadre_analisi");

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

function squadreAnalisiApiPlugin() {
  return {
    name: "squadre-analisi-api",
    configureServer(server) {
      if (!fs.existsSync(squadreDir)) fs.mkdirSync(squadreDir, { recursive: true });
      server.middlewares.use("/api/squadre", (req, res, next) => {
        const sub = (req.url || "").split("?")[0].replace(/^\//, "");
        const nat = sub.split("/").filter(Boolean)[0] || sub;

        if (req.method === "GET" && !nat) {
          const teams = fs.existsSync(squadreDir)
            ? fs.readdirSync(squadreDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""))
            : [];
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ teams }));
          return;
        }

        if (!nat || !/^[A-Z]{3}$/.test(nat)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Codice nazione non valido (es. MAR)" }));
          return;
        }

        const filePath = path.join(squadreDir, `${nat}.json`);
        const emptyContent = JSON.stringify(
          { nat, modulo: "4-3-3", titolari: [], note: "", noteAmichevoli: "" },
          null,
          2
        );

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
    squadreAnalisiApiPlugin(),
    jsonFileApiPlugin({
      name: "rosa-api",
      route: "/api/rosa",
      filePath: rosaPath,
      emptyContent: emptyRosaJson(),
    }),
    jsonFileApiPlugin({
      name: "rosa-iniziale-api",
      route: "/api/rosa-iniziale",
      filePath: rosaInizialePath,
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
