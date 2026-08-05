import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRouter from "./auth.js";
import contentRouter from "./content.js";
import membersRouter from "./members.js";
import cotisationsRouter from "./cotisations.js";
import documentsRouter from "./documents.js";
import projectsRouter from "./projects.js";
import invoicesRouter from "./invoices.js";
import trainingsRouter from "./trainings.js";
import contactRouter from "./contact.js";
import newsletterRouter from "./newsletter.js";
import consentsRouter from "./consents.js";
import { initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/members", membersRouter);
app.use("/api/cotisations", cotisationsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/trainings", trainingsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/consents", consentsRouter);
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(PORT, async () => {
  try {
    await initDb();
    console.log(`API APSI-CG démarrée sur http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  } catch (err) {
    console.error("Échec de l'initialisation de la base MySQL :", err.message);
    process.exit(1);
  }
});

