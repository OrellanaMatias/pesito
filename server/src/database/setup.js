import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir la ruta por defecto dentro del contenedor
const defaultDbPath = process.env.DB_PATH || join(__dirname, '../../db/pesito.db');

// Asegurar que la carpeta de la base de datos exista
const dbFolder = dirname(defaultDbPath);
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

export const db = new sqlite3.Database(defaultDbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos', err.message);
  } else {
    console.log(`Conectado a la base de datos SQLite en: ${defaultDbPath}`);
  }
});

export const setupDatabase = () => {
  console.log('Configurando la base de datos...');

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    const defaultCategories = [
      { name: 'Comida', type: 'expense' },
      { name: 'Transporte', type: 'expense' },
      { name: 'Vivienda', type: 'expense' },
      { name: 'Entretenimiento', type: 'expense' },
      { name: 'Servicios', type: 'expense' },
      { name: 'Salud', type: 'expense' },
      { name: 'Educación', type: 'expense' },
      { name: 'Otros gastos', type: 'expense' },
      { name: 'Salario', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Regalos', type: 'income' },
      { name: 'Inversiones', type: 'income' },
      { name: 'Otros ingresos', type: 'income' }
    ];

    db.get(`SELECT COUNT(*) as count FROM categories`, (err, row) => {
      if (err) {
        console.error('Error al verificar categorías:', err.message);
      } else if (row.count === 0) {
        const insertStmt = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
        
        defaultCategories.forEach(category => {
          insertStmt.run(category.name, category.type);
        });
        
        insertStmt.finalize();
        console.log('Categorías predeterminadas insertadas');
      }
    });
  });
}; 
