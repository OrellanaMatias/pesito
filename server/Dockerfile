FROM node:18-slim

WORKDIR /app

# Instalar dependencias necesarias para compilar sqlite3
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  sqlite3 \
  libsqlite3-dev

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar cache e instalar sqlite3 con la opción de recompilación forzada
RUN npm cache clean --force && \
  npm install --build-from-source

# No montar node_modules desde el host, usar los del contenedor
# Copiar el resto del código
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/db && chmod 777 /app/db

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
