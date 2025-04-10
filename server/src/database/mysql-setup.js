import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer configuración de la base de datos desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pesito',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Configuración de MySQL:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

// Crear un pool de conexiones para mejor rendimiento
let pool;

// Función para ejecutar consultas que no se pueden preparar (como USE, CREATE DATABASE)
const executeSimpleQuery = async (sql) => {
  try {
    // Crear conexión directa sin usar prepared statements
    const connection = await pool.getConnection();
    try {
      await connection.query(sql);
      console.log(`Consulta directa ejecutada: ${sql}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`Error al ejecutar consulta directa: ${sql}`, error.message);
    throw error;
  }
};

// Función para esperar a que la base de datos esté disponible
const waitForDatabase = async (retries = 10, delay = 5000) => {
  let attempts = 0;
  
  while (attempts < retries) {
    try {
      console.log(`Intento de conexión a MySQL (${attempts + 1}/${retries})...`);
      
      // Intentar establecer una conexión simple
      const tempConfig = {
        ...dbConfig,
        database: undefined // No especificar base de datos para comprobar si el servidor está disponible
      };
      
      const tempPool = await mysql.createPool(tempConfig);
      const [rows] = await tempPool.execute('SELECT 1');
      await tempPool.end();
      
      if (rows && rows.length > 0) {
        console.log('Conexión a MySQL establecida correctamente');
        return true;
      }
    } catch (error) {
      console.error(`Error al conectar con MySQL (intento ${attempts + 1}/${retries}):`, error.message);
      
      if (attempts === retries - 1) {
        throw error; // Propagar el error si es el último intento
      }
      
      // Esperar antes del siguiente intento
      console.log(`Esperando ${delay/1000} segundos para volver a intentar...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    attempts++;
  }
  
  throw new Error(`No se pudo conectar a MySQL después de ${retries} intentos`);
};

// Función para establecer conexión a la base de datos
export const connectToDatabase = async () => {
  try {
    // Esperar a que la base de datos esté disponible
    await waitForDatabase();
    
    // Primero crear un pool sin especificar la base de datos
    const rootConfig = {
      ...dbConfig,
      database: undefined
    };
    
    pool = await mysql.createPool(rootConfig);
    console.log('Pool de conexiones inicial creado correctamente');
    
    // Verificar si la base de datos existe y crearla si es necesario
    try {
      // Usar una consulta directa para verificar si existe la base de datos
      const [databases] = await pool.execute(`SHOW DATABASES LIKE '${dbConfig.database}'`);
      
      if (databases.length === 0) {
        console.log(`Creando base de datos '${dbConfig.database}'...`);
        await executeSimpleQuery(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`Base de datos '${dbConfig.database}' creada correctamente`);
      } else {
        console.log(`Base de datos '${dbConfig.database}' ya existe`);
      }
      
    } catch (error) {
      console.error('Error al verificar/crear la base de datos:', error.message);
      throw error;
    }
    
    // Cerrar el pool inicial y crear uno nuevo con la base de datos especificada
    await pool.end();
    
    // Crear el pool final con la base de datos seleccionada
    pool = await mysql.createPool(dbConfig);
    console.log(`Pool de conexiones para '${dbConfig.database}' creado correctamente`);
    
    return pool;
  } catch (error) {
    console.error('Error al conectar con la base de datos MySQL:', error.message);
    throw error;
  }
};

// Función para ejecutar consultas SQL
export const query = async (sql, params) => {
  try {
    if (!pool) await connectToDatabase();
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error al ejecutar consulta SQL:', error.message);
    console.error('Consulta:', sql);
    console.error('Parámetros:', params);
    throw error;
  }
};

// Configurar las tablas de la base de datos
export const setupDatabase = async () => {
  try {
    console.log('Configurando la base de datos MySQL...');
    
    // Asegurar que tenemos una conexión
    if (!pool) await connectToDatabase();
    
    // Crear tabla de categorías usando pool.execute directamente
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        type ENUM('income', 'expense') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla categories creada o ya existente');

    // Crear tabla de transacciones usando pool.execute directamente
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        type ENUM('income', 'expense') NOT NULL,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    console.log('Tabla transactions creada o ya existente');

    // Definir categorías predeterminadas
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

    // Verificar si ya existen categorías
    const [existingCategories] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    
    // Si no hay categorías, insertar las predeterminadas
    if (existingCategories[0].count === 0) {
      console.log('Insertando categorías predeterminadas...');
      
      for (const category of defaultCategories) {
        await pool.execute(
          'INSERT INTO categories (name, type) VALUES (?, ?)',
          [category.name, category.type]
        );
      }
      
      console.log('Categorías predeterminadas insertadas');
    } else {
      console.log(`Ya existen ${existingCategories[0].count} categorías en la base de datos`);
    }

    console.log('Configuración de la base de datos MySQL completada');
  } catch (error) {
    console.error('Error durante la configuración de la base de datos:', error.message);
    throw error;
  }
}; 
