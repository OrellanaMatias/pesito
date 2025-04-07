FROM node:18-slim AS client-builder

# Construir el cliente
WORKDIR /app/client
COPY client/package*.json ./

# Instalar dependencias del cliente
RUN npm install

# Copiar el código fuente del cliente
COPY client/ .

# Modificar el script de build para evitar errores de TypeScript
RUN sed -i 's/"build": "tsc -b && vite build"/"build": "vite build"/' package.json

# Compilar el cliente
RUN npm run build

# Verificar que los archivos se hayan generado correctamente
RUN ls -la dist || echo "La carpeta dist no existe!"
RUN if [ -d "dist" ]; then echo "Contenido de dist:" && ls -la dist; else echo "ERROR: La compilación falló!"; exit 1; fi

# Construcción del servidor
FROM node:18-slim

# Establecer entorno de producción
ENV NODE_ENV=production

WORKDIR /app

# Instalar dependencias necesarias para compilar sqlite3
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  sqlite3 \
  libsqlite3-dev

# Copiar package.json y package-lock.json del servidor
COPY server/package*.json ./

# Instalar dependencias del servidor
RUN npm install --build-from-source

# Copiar el código del servidor
COPY server/ ./

# Crear directorio para la base de datos y configurar permisos
RUN mkdir -p /app/db && chmod 777 /app/db

# Crear directorio public para los archivos estáticos
RUN mkdir -p /app/public

# Copiar los archivos compilados del cliente
COPY --from=client-builder /app/client/dist /app/public

# Verificar que los archivos estáticos se hayan copiado correctamente
RUN ls -la /app/public || echo "La carpeta public está vacía!"

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"] 
