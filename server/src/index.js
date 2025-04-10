import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupDatabase } from './database/mysql-setup.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';
import geminiRoutes from './routes/gemini.js';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de variables de entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Permitir conexiones desde cualquier interfaz de red

// Middlewares
app.use(cors({
  origin: '*', // Permitir solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ruta de salud para verificar que el servidor está respondiendo
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Inicialización de la aplicación
const initializeApp = async () => {
  try {
    // Configurar base de datos MySQL
    console.log('Iniciando configuración de la base de datos...');
    await setupDatabase();
    console.log('Base de datos MySQL configurada correctamente');

    // Rutas API
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/gemini', geminiRoutes);
    app.use('/api/admin', adminRoutes);
    
    // Servir archivos estáticos del cliente (frontend)
    // Usar una ruta absoluta dentro del contenedor para asegurar que los archivos estáticos se encuentren
    const staticPath = process.env.NODE_ENV === 'production' 
      ? '/app/public'
      : path.join(__dirname, '../../public');
    console.log('Ruta de archivos estáticos:', staticPath);
    app.use(express.static(staticPath));
    
    // Ruta para todas las demás solicitudes (SPA route handling)
    app.get('*', (req, res) => {
      // Solo envía el index.html para rutas que no sean /api
      if (!req.path.startsWith('/api/')) {
        console.log('Solicitando index.html para:', req.path);
        res.sendFile(path.join(staticPath, 'index.html'));
      } else {
        res.status(404).json({ error: 'Ruta API no encontrada' });
      }
    });
    
    // Iniciar servidor
    app.listen(PORT, HOST, () => {
      console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
      console.log(`Para acceder desde otros dispositivos en la red local, usa la IP de este dispositivo`);
      console.log(`Sirviendo archivos estáticos desde: ${staticPath}`);
    });
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1); // Salir con código de error
  }
};

// Iniciar la aplicación
initializeApp();

// Manejo de errores para evitar que el servidor se caiga
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
}); 
