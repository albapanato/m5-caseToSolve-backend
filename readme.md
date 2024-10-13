# Films - Backend

## Descripción

El backend de esta aplicación es responsable de proporcionar la lógica y funcionalidad necesaria para el correcto funcionamiento de la aplicación. Está construido utilizando tecnologías como Node.js, Express.js y MongoDB.

## Características principales

- Gestión de usuarios: El backend permite el registro y autenticación de usuarios. También proporciona endpoints para la gestión de perfiles de usuario.
- Gestión de productos: El backend permite la creación, lectura, actualización y eliminación de películas. También proporciona endpoints para la búsqueda y filtrado de películas.

## Configuración previa

Antes de ejecutar la aplicación, debes tener instalado Node.js: [Descargar e instalar Node.js](https://nodejs.org)

Para disponer de la base de datos MongoDB necesitaras una cuneta en [Atlas MongoDB](https://www.mongodb.com/es/cloud/atlas/register) y configurar las variables de entorno en el archivo .env

Para disponer del almacenamiento de archivos necesitaras una cuenta en [Firebase Cloud Storage](https://firebase.google.com/products/storage?hl=es). Con tu APIKey debes configurar las variables de entorno en el archivo .env y el resto de los datos de configuración en el archivo config.js.

## Configuración

Una vez que haya instalado las dependencias, siga estos pasos para configurar y ejecutar el backend:

1. Clone el repositorio: `git clone https://github.com/...`
2. Navegue al directorio del proyecto: `cd back-inmune`
3. Elimina el directorio .git: `rm -rf .git`
4. Crea tu propio repositorio: `git init`
5. Haz un commit inicial: `git add .` y `git commit -m "Initial commit"`
6. Vincula tu repositorio remoto: `git remote add origin ...`
   IMPORTANTE: El link a este repositorio será la única forma de que entregues tu trabajo
7. Instale las dependencias: `npm install`
8. Configure las variables de entorno: Cree un archivo `.env` en el directorio raíz del proyecto y configure las variables de entorno necesarias. Consulte el archivo `.env.sample` para obtener una lista de las variables requeridas.
9. Inicie el servidor: `npm start`

Ya tienes instalado y configurado

- editorconfig
- eslint
- prettier
- jest con módulos ESM

Sólo te queda hacer los test. Puedes redefinir los scripts de test en el package.json si lo necesitas.
