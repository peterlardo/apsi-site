CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date TEXT,
  place TEXT,
  category TEXT,
  excerpt TEXT,
  image TEXT,
  body TEXT,
  published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO events (title, slug, date, place, category, excerpt, image, body, published) VALUES
('Rencontres mensuelles', 'rencontres-mensuelles', 'Chaque 1er jeudi du mois', 'Brazzaville', 'Échange', 'Rencontres d''échange entre professionnels de la sécurité de l''information, partage de retours d''expérience et veille collective.', '', '', 1),
('Capture The Flag (CTF)', 'capture-the-flag-ctf', 'Deux fois par an', 'En ligne', 'Compétition', 'Compétitions pratiques de cybersécurité ouvertes aux étudiants et aux professionnels pour développer leurs compétences techniques.', '', '', 1),
('Conférence annuelle APSI-CG', 'conference-annuelle-apsi-cg', 'Chaque année', 'Brazzaville', 'Conférence', 'Le rendez-vous de la cybersécurité au Congo : conférences, panels et ateliers avec des experts nationaux et internationaux.', '', '', 1),
('Ateliers de sensibilisation', 'ateliers-de-sensibilisation', 'Tout au long de l''année', 'Entreprises & Écoles', 'Formation', 'Campagnes de sensibilisation aux risques numériques destinées aux organisations, aux écoles et au grand public.', '', '', 1);
