# Pesito - Gestor de Finanzas Personales

## Configuración Centralizada

Este proyecto ahora utiliza un sistema de configuración centralizado que facilita el despliegue en diferentes entornos.

### Estructura del Proyecto

```
pesito/
├── .env                 # Variables de entorno centralizadas
├── .env.example         # Ejemplo de configuración
├── setup-env.js         # Script para generar archivos .env
├── package.json         # Scripts y dependencias raíz
├── docker-compose.yml   # Configuración de Docker
├── client/              # Frontend (React + Vite)
│   ├── src/             # Código fuente del frontend
│   └── ...
└── server/              # Backend (Node.js)
    ├── src/             # Código fuente del backend
    └── ...
```

## Instrucciones de Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/pesito.git
cd pesito
```

2. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tu configuración
# Especialmente la variable HOST_IP con tu IP o dominio
```

3. Instala las dependencias y configura el entorno:
```bash
npm install
npm run setup-env
```

4. Inicia los servicios:
```bash
npm start
```

## Comandos Disponibles

- `npm run setup-env`: Genera los archivos .env para cliente y servidor
- `npm start`: Configura el entorno y levanta los contenedores
- `npm run stop`: Detiene todos los contenedores
- `npm run restart`: Reinicia todos los contenedores
- `npm run logs`: Muestra logs de todos los servicios
- `npm run frontend-logs`: Muestra solo logs del frontend
- `npm run backend-logs`: Muestra solo logs del backend
- `npm run mysql-logs`: Muestra solo logs de la base de datos

## Adaptación a Diferentes Entornos

Para desplegar la aplicación en un nuevo servidor, simplemente:

1. Actualiza la variable `HOST_IP` en el archivo `.env` con la IP o dominio del nuevo servidor
2. Ejecuta `npm run setup-env` para regenerar los archivos de configuración
3. Ejecuta `npm start` para levantar los servicios

## Desarrollo Local

Para desarrollo local, configura `HOST_IP=localhost` en el archivo `.env`.

## Contribuir

Si deseas contribuir al proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b mi-nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -am 'Añade nueva funcionalidad'`)
4. Sube tus cambios (`git push origin mi-nueva-funcionalidad`)
5. Crea un Pull Request
