import mysql from "mysql2/promise";
import { DEFAULT_TRAININGS } from "./training-defaults.js";

const CFG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "apsi_cg",
  charset: "utf8mb4",
};

export const pool = mysql.createPool({
  ...CFG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDb() {
  const conn = await mysql.createConnection({
    host: CFG.host,
    port: CFG.port,
    user: CFG.user,
    password: CFG.password,
    charset: "utf8mb4",
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${CFG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${CFG.database}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(191) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_refresh_user (user_id),
      INDEX idx_refresh_revoked (revoked_at)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS content_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      data JSON NOT NULL,
      updated_by INT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      date VARCHAR(100) NOT NULL DEFAULT '',
      category VARCHAR(100) NOT NULL DEFAULT '',
      excerpt TEXT NULL,
      image VARCHAR(500) NOT NULL DEFAULT '',
      body MEDIUMTEXT NULL,
      published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(191) NOT NULL,
      last_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NULL,
      phone VARCHAR(50) NULL,
      profession VARCHAR(191) NULL,
      company VARCHAR(191) NULL,
      member_since VARCHAR(20) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'actif',
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cotisations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      period VARCHAR(20) NOT NULL DEFAULT '',
      due_date DATE NULL,
      payment_date DATE NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'en_attente',
      method VARCHAR(50) NULL,
      receipt_no VARCHAR(100) NULL,
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      INDEX idx_cotisation_member (member_id),
      INDEX idx_cotisation_status (status)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'autre',
      description TEXT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size BIGINT NOT NULL DEFAULT 0,
      mime_type VARCHAR(191) NULL,
      stored_name VARCHAR(255) NOT NULL,
      uploaded_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_document_category (category)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'en_cours',
      due_date DATE NULL,
      created_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      assigned_to INT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'a_faire',
      due_date DATE NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES members(id) ON DELETE SET NULL,
      INDEX idx_task_project (project_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      user_id INT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_message_project (project_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      number VARCHAR(50) NOT NULL UNIQUE,
      member_id INT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      issue_date DATE NULL,
      due_date DATE NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'emise',
      notes TEXT NULL,
      created_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_invoice_status (status),
      INDEX idx_invoice_member (member_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS trainings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,
      icon VARCHAR(80) NOT NULL DEFAULT 'GraduationCap',
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT '',
      level VARCHAR(100) NOT NULL DEFAULT '',
      format VARCHAR(100) NOT NULL DEFAULT '',
      duration VARCHAR(100) NOT NULL DEFAULT '',
      next_session VARCHAR(100) NOT NULL DEFAULT '',
      description TEXT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_training_active (active),
      INDEX idx_training_category (category),
      INDEX idx_training_sort (sort_order)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS training_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      training_id INT NULL,
      training_title VARCHAR(255) NOT NULL DEFAULT '',
      full_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(50) NULL,
      organization VARCHAR(191) NULL,
      profile VARCHAR(100) NULL,
      notes TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'nouvelle',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE SET NULL,
      INDEX idx_registration_training (training_id),
      INDEX idx_registration_status (status),
      INDEX idx_registration_email (email)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS consents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(191) NULL,
      categories JSON NOT NULL,
      ip VARCHAR(45) NULL,
      user_agent VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_consent_email (email),
      INDEX idx_consent_created (created_at)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      subject VARCHAR(191) NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      consent_contact TINYINT(1) NOT NULL DEFAULT 0,
      consent_newsletter TINYINT(1) NOT NULL DEFAULT 0,
      ip VARCHAR(45) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'lu',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_contact_email (email),
      INDEX idx_contact_created (created_at)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      consent_newsletter TINYINT(1) NOT NULL DEFAULT 1,
      consent_source VARCHAR(100) NOT NULL DEFAULT 'site',
      ip VARCHAR(45) NULL,
      subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at DATETIME NULL,
      INDEX idx_subscriber_email (email)
    ) ENGINE=InnoDB
  `);

  for (const [index, training] of DEFAULT_TRAININGS.entries()) {
    await conn.execute(
      `INSERT IGNORE INTO trainings
       (slug, icon, title, category, level, format, duration, next_session, description, active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        training.slug,
        training.icon,
        training.title,
        training.category,
        training.level,
        training.format,
        training.duration,
        training.next_session,
        training.description,
        index + 1,
      ]
    );
  }
  await conn.end();
}


