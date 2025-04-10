#!/usr/bin/env node

/**
 * Script para generar archivos .env en los directorios client y server
 * a partir del archivo .env en el directorio raíz
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno del archivo .env raíz
const rootEnvPath = path.resolve(process.cwd(), '.env');
let envVars = {};

try {
  if (fs.existsSync(rootEnvPath)) {
    const parsed = dotenv.parse(fs.readFileSync(rootEnvPath));
    envVars = parsed;
    console.log('Variables cargadas del archivo .env raíz');
  } else {
    console.warn('Archivo .env no encontrado en el directorio raíz. Se usará .env.example');
    const exampleEnvPath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(exampleEnvPath)) {
      const parsed = dotenv.parse(fs.readFileSync(exampleEnvPath));
      envVars = parsed;
      console.log('Variables cargadas del archivo .env.example');
    } else {
      console.error('No se encontró archivo .env ni .env.example');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('Error al cargar variables de entorno:', error);
  process.exit(1);
}

// Generar .env para el cliente
const clientEnvContent = `# Archivo generado automáticamente - No editar manualmente
# Generado el: ${new Date().toISOString()}

# Variables de entorno para el cliente
VITE_API_URL=http://${envVars.HOST_IP}:${envVars.BACKEND_PORT}/api
VITE_API_PORT=${envVars.BACKEND_PORT}
NODE_ENV=${envVars.NODE_ENV}
`;

// Generar .env para el servidor
const serverEnvContent = `# Archivo generado automáticamente - No editar manualmente
# Generado el: ${new Date().toISOString()}

# Variables de servidor
PORT=${envVars.BACKEND_PORT}
HOST=0.0.0.0
NODE_ENV=${envVars.NODE_ENV}

# Variables de base de datos
DB_HOST=mysql
DB_PORT=3306
DB_USER=${envVars.MYSQL_USER}
DB_PASSWORD=${envVars.MYSQL_PASSWORD}
DB_NAME=${envVars.MYSQL_DATABASE}

# Configuración CORS
CORS_ORIGIN=http://${envVars.HOST_IP}:${envVars.FRONTEND_PORT}
`;

// Escribir archivos
try {
  const clientEnvPath = path.resolve(process.cwd(), 'client', '.env');
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log(`Archivo .env generado para el cliente en ${clientEnvPath}`);

  const serverEnvPath = path.resolve(process.cwd(), 'server', '.env');
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log(`Archivo .env generado para el servidor en ${serverEnvPath}`);

  console.log('Configuración completada con éxito');
} catch (error) {
  console.error('Error al escribir archivos .env:', error);
  process.exit(1);
} 
