FROM node:18-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 5173

# Configurar variables de entorno específicas para Vite
ENV HOST=0.0.0.0
ENV PORT=5173

# Iniciar el servidor de desarrollo de Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 
