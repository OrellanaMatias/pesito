FROM node:18-slim

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  default-libmysqlclient-dev

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar cache e instalar dependencias
RUN npm cache clean --force && \
  npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
