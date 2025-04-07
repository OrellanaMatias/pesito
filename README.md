# Pesito - Aplicación de Finanzas Personales

Pesito es una aplicación moderna de finanzas personales que te permite gestionar tus gastos e ingresos a través de una interfaz de chat natural, utilizando inteligencia artificial para categorizar automáticamente tus transacciones.

## Instalación con Docker (Recomendado)

La forma más sencilla de utilizar Pesito es usando Docker:

```bash
# Opción 1: Docker Run
docker run -d -p 3000:3000 -v $(pwd)/data:/app/db --name pesito orellanamatias/pesito:latest

# En Windows PowerShell:
docker run -d -p 3000:3000 -v ${PWD}/data:/app/db --name pesito orellanamatias/pesito:latest
```

⚠️ **Importante**: El mapeo de puertos con `-p 3000:3000` es obligatorio para poder acceder a la aplicación. El primer número puede cambiarse si necesitas usar otro puerto en tu máquina host.

O usando Docker Compose:

```bash
# Opción 2: Docker Compose
# Crear un archivo docker-compose.yml con este contenido:
version: '3.8'

services:
  pesito:
    image: orellanamatias/pesito:latest
    container_name: pesito
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/db
    environment:
      - NODE_ENV=production

# Luego ejecutar:
docker-compose up -d
```

Una vez instalado, accede a la aplicación en: http://localhost:3000

## Características

- 💬 Registra transacciones a través de una interfaz de chat natural
- 🧠 Utiliza IA (Google Gemini) para categorizar automáticamente transacciones
- 📊 Visualiza resúmenes financieros con gráficos interactivos
- 🏷️ Administra categorías personalizadas para gastos e ingresos
- 🌙 Soporte para tema claro y oscuro
- 💲 Cambio de moneda (USD/ARS)
- 📱 Diseño responsivo para móviles y escritorio

## Persistencia de datos

Todos tus datos se almacenan localmente en el directorio `./data` que está montado como volumen en el contenedor Docker. Esto asegura que tus datos persistan entre reinicios del contenedor.

## Actualización

Para actualizar a la última versión:

```bash
docker pull orellanamatias/pesito:latest
docker stop pesito
docker rm pesito
docker run -d -p 3000:3000 -v $(pwd)/data:/app/db --name pesito orellanamatias/pesito:latest
```

O si usas Docker Compose:

```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

## Tecnologías

- Frontend: React con TypeScript, Tailwind CSS
- Backend: Node.js con Express
- Base de datos: SQLite
- IA: Google Gemini API

## Configuración de la IA (opcional)

Para utilizar las funciones de inteligencia artificial:

1. Obtén una API key de [Google AI Studio](https://aistudio.google.com/app/apikey)
2. En la aplicación, ve a Configuración > Integración con IA
3. Ingresa tu API key y haz clic en "Probar API key"
4. Activa el interruptor "Usar IA para clasificar transacciones"
