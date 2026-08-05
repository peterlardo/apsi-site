import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from "./tokens.js";
import { requireAuth } from "./middleware.js";

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

const app = new Hono();

const allowedOrigins = [
  process.env.CORS_ORIGIN || "https://apsi-cg.pages.dev",
  "http://localhost:5173",
  "http://localhost:8788",
];

app.use("*", cors({
  origin: (origin) => {
    if (!origin || allowedOrigins.includes(origin)) return origin || "*";
    return allowedOrigins[0];
  },
  credentials: true,
}));

app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

app.route("/api/auth", authRouter);
app.route("/api/content", contentRouter);
app.route("/api/members", membersRouter);
app.route("/api/cotisations", cotisationsRouter);
app.route("/api/documents", documentsRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/invoices", invoicesRouter);
app.route("/api/trainings", trainingsRouter);
app.route("/api/contact", contactRouter);
app.route("/api/newsletter", newsletterRouter);
app.route("/api/consents", consentsRouter);

app.notFound((c) => c.json({ error: "Route introuvable" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Erreur interne du serveur" }, 500);
});

export default app;
