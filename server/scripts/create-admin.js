import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output, argv } from "node:process";
import bcrypt from "bcryptjs";
import { pool, initDb } from "../db.js";

const args = argv.slice(2);

async function main() {
  let email = args[0] ?? null;
  let name = args[1] ?? null;
  let password = args[2] ?? null;

  const rl = email && name && password ? null : readline.createInterface({ input, output });
  email ??= (await rl.question("Email de l'administrateur : ")).trim().toLowerCase();
  name ??= (await rl.question("Nom complet : ")).trim() || "Administrateur";
  password ??= await rl.question("Mot de passe (min. 8 caractères) : ");
  rl?.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Erreur : email invalide");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Erreur : mot de passe trop court (min. 8 caractères)");
    process.exit(1);
  }

  await initDb();
  const [exists] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
  if (exists[0]) {
    console.error("Erreur : cet email existe déjà");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')",
    [email, hash, name]
  );

  console.log(`Administrateur créé : ${email}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
