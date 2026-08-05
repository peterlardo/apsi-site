CREATE TABLE IF NOT EXISTS download_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'autre',
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
