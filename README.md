RESTAURANTE-SIS

Sistema web para la gestión de un restaurante, desarrollado como proyecto académico para la asignatura Sistemas Paralelos.

Información del proyecto

Proyecto: RESTAURANTE-SIS

Asignatura: Sistemas Paralelos

Docente: Ing. Elias Cassal Baldiviezo

Año: 2026

Arquitectura: Frontend + Backend + PostgreSQL

Contenedores: Docker Compose

ORM: Prisma

Base de datos: PostgreSQL 15

1. Descripción del proyecto

RESTAURANTE-SIS es un sistema web orientado a la gestión de las principales operaciones de un restaurante.

El sistema busca centralizar la administración de usuarios, clientes, reservas, mesas, menú, pedidos, ventas, inventario, proveedores e informes.

La solución está organizada mediante una arquitectura de tres componentes principales:

                    RESTAURANTE-SIS
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   +-------------+  +-------------+  +-------------+
   |  FRONTEND   |  |   BACKEND   |  |  POSTGRESQL |
   | React/Vite  |  | Node/Express|  | PostgreSQL  |
   | Puerto 5173 |  | Puerto 3000 |  | Puerto 5433 |
   +-------------+  +-------------+  +-------------+
                           |
                           |
                         Prisma
                           |
                           v
                     Base de datos

Esta arquitectura permite separar la presentación, la lógica de aplicación y la persistencia de los datos.

2. Objetivo

Implementar un entorno de desarrollo multi-contenedor para RESTAURANTE-SIS utilizando Docker Compose, PostgreSQL y Prisma ORM, aplicando principios de arquitectura, persistencia, seguridad, control de versiones y utilización de agentes mediante skills.

El proyecto también busca demostrar la utilización de SysLab 2.0 como parte del proceso de organización y desarrollo del sistema.

3. Requerimientos funcionales
RF01: Gestión de usuarios

El sistema debe permitir registrar, iniciar sesión y gestionar usuarios.

RF02: Gestión de clientes

El sistema debe permitir registrar y gestionar clientes.

RF03: Gestión de reservas

El sistema debe permitir registrar, modificar y cancelar reservas.

RF04: Gestión de mesas

El sistema debe permitir gestionar las mesas del restaurante.

RF05: Gestión del menú

El sistema debe permitir registrar y gestionar categorías y platos del menú.

RF06: Gestión de pedidos

El sistema debe permitir registrar y gestionar pedidos.

RF07: Gestión de ventas

El sistema debe permitir registrar y gestionar ventas.

RF08: Gestión de inventario

El sistema debe permitir controlar el inventario de productos e insumos.

RF09: Gestión de proveedores

El sistema debe permitir registrar y gestionar proveedores.

RF10: Gestión de informes

El sistema debe permitir generar y consultar informes.

4. Requerimientos no funcionales
RNF01: Autenticación

El sistema debe contar con autenticación para controlar el acceso.

RNF02: Usabilidad

El sistema debe ser fácil de utilizar y contar con una interfaz intuitiva.

RNF03: Rendimiento

El sistema debe responder de manera adecuada a las operaciones realizadas.

RNF04: Integridad de datos

El sistema debe mantener la integridad y consistencia de los datos.

RNF05: Compatibilidad

El sistema debe ser compatible con los principales navegadores web.

RNF06: Diseño adaptable

El sistema debe adaptarse a diferentes tamaños de pantalla.

RNF07: Mantenibilidad

El sistema debe contar con una estructura que facilite su mantenimiento y futuras modificaciones.

5. Historias de usuario
HU01 - Gestión de usuarios

Como administrador, quiero gestionar los usuarios del sistema, para controlar el acceso a las diferentes funcionalidades.

HU02 - Gestión de clientes

Como usuario del sistema, quiero registrar y gestionar clientes, para mantener organizada su información.

HU03 - Gestión de reservas

Como usuario del sistema, quiero registrar y gestionar reservas, para organizar las reservas del restaurante.

HU04 - Gestión de mesas

Como usuario del sistema, quiero gestionar las mesas, para conocer su disponibilidad.

HU05 - Gestión del menú

Como administrador, quiero gestionar categorías y platos, para mantener actualizado el menú del restaurante.

HU06 - Gestión de pedidos

Como usuario del sistema, quiero registrar pedidos, para controlar las órdenes de los clientes.

HU07 - Gestión de ventas

Como usuario del sistema, quiero registrar las ventas, para llevar un control de las operaciones realizadas.

HU08 - Gestión de inventarios

Como administrador, quiero controlar el inventario, para conocer la disponibilidad de productos e insumos.

HU09 - Gestión de proveedores

Como administrador, quiero gestionar los proveedores, para mantener organizada la información de abastecimiento.

HU10 - Reportes

Como administrador, quiero consultar informes, para obtener información sobre las operaciones del restaurante.

6. Tecnologías utilizadas
Frontend
React
Vite
JavaScript
HTML5
CSS
Backend
Node.js 22
Express
CORS
dotenv
Persistencia
PostgreSQL 15
Prisma ORM 6
Prisma Client
Prisma Migrate
Seed inicial
Infraestructura
Docker
Docker Compose
Node.js Alpine
Control de versiones
Git
GitHub
Conventional Commits
Agentes
TasteSkill
Skills personalizadas
Reglas de arquitectura para SysLab 2.0
7. Arquitectura del sistema

El proyecto utiliza tres servicios principales:

+-----------------------+
|       FRONTEND        |
|     React + Vite      |
|      Puerto 5173      |
+-----------+-----------+
            |
            | HTTP
            v
+-----------------------+
|        BACKEND        |
|    Node.js + Express  |
|      Puerto 3000      |
+-----------+-----------+
            |
            | Prisma ORM
            v
+-----------------------+
|      POSTGRESQL       |
|     PostgreSQL 15     |
|      Puerto 5432      |
+-----------------------+

Desde el equipo anfitrión, PostgreSQL está expuesto mediante el puerto:

5433

Dentro de la red de Docker, el backend se conecta utilizando:

db:5432
8. Frontend

El frontend utiliza React con Vite.

Su responsabilidad principal es proporcionar la interfaz de usuario y permitir la interacción con las funcionalidades del sistema.

Ubicación:

frontend/

Archivos principales:

frontend/
├── src/
│   └── main.jsx
├── .env.example
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
└── vite.config.mjs

Puerto:

5173

Acceso:

http://localhost:5173
9. Backend

El backend utiliza Node.js y Express para proporcionar los servicios de la aplicación.

Ubicación:

backend/

Archivos principales:

backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── .env.example
├── Dockerfile
├── index.js
├── package.json
└── package-lock.json

Puerto:

3000

Acceso:

http://localhost:3000
10. Endpoints iniciales

El backend cuenta con un endpoint principal:

GET /

Permite verificar que la API se encuentra funcionando.

También se dispone de:

GET /health

Este endpoint permite comprobar el estado del servicio backend.

Ejemplo:

curl http://localhost:3000/

Respuesta esperada:

{
  "message": "API RESTAURANTE-SIS funcionando",
  "status": "ok"
}

Para verificar el estado:

curl http://localhost:3000/health

Respuesta esperada:

{
  "status": "ok",
  "service": "backend"
}
11. Base de datos

El proyecto utiliza PostgreSQL 15 como sistema de gestión de base de datos.

Configuración utilizada en Docker:

Base de datos: restaurante_db
Usuario: restaurante
Puerto interno: 5432
Puerto externo: 5433

La base de datos se ejecuta en un contenedor independiente.

12. Prisma ORM

Prisma se utiliza como ORM para gestionar la comunicación entre el backend y PostgreSQL.

El esquema principal está ubicado en:

backend/prisma/schema.prisma

El proyecto utiliza Prisma 6.

El esquema contiene las entidades principales del sistema:

Usuario
Cliente
Reserva
Mesa
Categoria
Plato
Pedido
DetallePedido
Venta
Proveedor
Inventario

Las relaciones y restricciones definidas en Prisma permiten mantener la integridad de la información almacenada.

13. Migraciones

Las migraciones se encuentran almacenadas en:

backend/prisma/migrations/

La migración inicial fue generada para PostgreSQL.

Para comprobar el estado de las migraciones:

sudo docker compose exec backend npx prisma migrate status

Para ejecutar una migración durante el desarrollo:

sudo docker compose exec backend npx prisma migrate dev --name init

El proyecto cuenta con una migración inicial denominada:

20260909174742_init
14. Seed inicial

El proyecto incorpora un seed para cargar información inicial en la base de datos.

Archivo:

backend/prisma/seed.js

Para ejecutar el seed:

sudo docker compose exec backend node prisma/seed.js

El proceso crea o verifica información inicial relacionada con:

Usuario administrador.
Categoría de platos.
Plato inicial.
Mesas.
Cliente.
Proveedor.
Producto de inventario.

Ejemplo de información inicial:

Usuario:
admin@restaurante.local

Rol:
ADMIN

Categoría:
Platos Principales

Plato:
Pollo a la Plancha

Precio:
35.00
15. Docker Compose

La infraestructura del proyecto está definida mediante:

docker-compose.yml

Se utilizan tres servicios:

db
backend
frontend
Servicio PostgreSQL
Imagen: postgres:15-alpine
Puerto externo: 5433
Puerto interno: 5432
Servicio Backend
Puerto externo: 3000
Puerto interno: 3000
Servicio Frontend
Puerto externo: 5173
Puerto interno: 5173
16. Ejecución del proyecto
Paso 1 - Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd RESTAURANTE-SIS
Paso 2 - Configurar variables de entorno

Backend:

cp backend/.env.example backend/.env

Frontend:

cp frontend/.env.example frontend/.env
Paso 3 - Construir los contenedores
sudo docker compose up --build -d
Paso 4 - Verificar los contenedores
sudo docker compose ps

Deben aparecer:

restaurante_backend
restaurante_frontend
restaurante_db

La base de datos debe mostrar un estado saludable.

Paso 5 - Verificar las migraciones
sudo docker compose exec backend npx prisma migrate status
Paso 6 - Ejecutar el seed
sudo docker compose exec backend node prisma/seed.js
Paso 7 - Acceder al sistema

Frontend:

http://localhost:5173

Backend:

http://localhost:3000

Health Check:

http://localhost:3000/health
17. Variables de entorno

Para evitar almacenar información de configuración directamente en el código, el proyecto utiliza variables de entorno.

Backend

Archivo:

backend/.env

Ejemplo:

DATABASE_URL="postgresql://restaurante:restaurante_dev@db:5432/restaurante_db?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

Plantilla:

backend/.env.example
Frontend

Archivo:

frontend/.env

Ejemplo:

VITE_API_URL="http://localhost:3000"

Plantilla:

frontend/.env.example

Los archivos .env reales están excluidos del control de versiones.

18. Seguridad y configuración

El archivo .gitignore evita que información sensible sea incorporada accidentalmente al repositorio.

Entre los elementos excluidos se encuentran:

node_modules/
.env
.env.*
dist/
build/
coverage/
*.log

Se permite versionar únicamente las plantillas:

.env.example

De esta manera se puede documentar la configuración necesaria sin almacenar archivos de entorno locales.

19. Skills y agentes

El proyecto incorpora una estructura de skills para apoyar el desarrollo mediante agentes.

Ubicación:

agente/.agents/skills/

Skills utilizadas:

design-taste-frontend/
backend-rest/
prisma-postgresql/
syslab-architecture/
design-taste-frontend

Skill utilizada como referencia para orientar el desarrollo de la interfaz frontend.

backend-rest

Skill personalizada para definir criterios relacionados con el desarrollo del backend REST.

Contempla aspectos como:

Organización del backend.
Endpoints REST.
Validaciones.
Códigos HTTP.
Manejo de errores.
Variables de entorno.
Seguridad.
Integración con Prisma.
prisma-postgresql

Skill orientada a la persistencia utilizando:

PostgreSQL.
Prisma ORM.
Prisma Client.
Migraciones.
Seed.
Relaciones.
Restricciones.
Integridad de datos.
syslab-architecture

Skill orientada a la arquitectura del proyecto bajo SysLab 2.0.

Establece criterios para:

Separación frontend/backend/base de datos.
Docker Compose.
Comunicación entre servicios.
Variables de entorno.
Persistencia.
Mantenibilidad.
20. Reglas del agente

El archivo:

agente/rules.md

contiene reglas para orientar el desarrollo del proyecto.

Las reglas consideran:

Arquitectura.
Backend.
Persistencia.
PostgreSQL.
Seguridad.
Variables de entorno.
Agentes y skills.
Requerimientos funcionales.
Docker.
Calidad del código.
Control de versiones.

Estas reglas buscan mantener una estructura coherente durante el desarrollo del sistema.

21. Estructura completa del proyecto
RESTAURANTE-SIS/
│
├── agente/
│   ├── .agents/
│   │   └── skills/
│   │       ├── design-taste-frontend/
│   │       ├── backend-rest/
│   │       ├── prisma-postgresql/
│   │       └── syslab-architecture/
│   │
│   ├── rules.md
│   └── skills-lock.json
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20260909174742_init/
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.mjs
│
├── .gitignore
├── docker-compose.yml
└── README.md
22. Convenciones de Git

El proyecto utiliza Conventional Commits para mantener organizado el historial de cambios.

Los principales tipos utilizados son:

feat:
fix:
docs:
chore:

Ejemplos:

feat(backend): definir esquema de prisma y script de seed inicial

chore(agente): incorporar skills de tasteskill y reglas de arquitectura syslab 2.0

feat(docker): configurar entorno multi-contenedor con docker-compose

feat(db): migrar esquema a postgresql y ejecutar script de seed
23. Historial actual de commits

El proyecto cuenta con los siguientes commits principales:

965535d feat(db): migrar esquema a postgresql y ejecutar script de seed
38ee997 feat(docker): configurar entorno multi-contenedor con docker-compose
b7153eb chore(agente): incorporar skills de tasteskill y reglas de arquitectura syslab 2.0
e24ce77 feat(backend): definir esquema de prisma y script de seed inicial

Estos commits representan las principales etapas de desarrollo:

Definición del modelo de datos y seed.
Incorporación de skills y reglas del agente.
Configuración de Docker Compose.
Migración y preparación de PostgreSQL.
24. Comandos útiles
Ver estado de Git
git status
Ver historial
git log --oneline
Ver los últimos commits
git log --oneline -5
Ver estado de Docker
sudo docker compose ps
Ver logs de todos los servicios
sudo docker compose logs
Ver logs del backend
sudo docker compose logs backend
Ver logs del frontend
sudo docker compose logs frontend
Ver logs de PostgreSQL
sudo docker compose logs db
Detener los servicios
sudo docker compose down
Reconstruir y levantar los servicios
sudo docker compose up --build -d
Ejecutar comandos dentro del backend
sudo docker compose exec backend <comando>
25. Evidencias de la práctica

La implementación del proyecto contempla seis evidencias principales.

Evidencia 1 - Estructura inicial

Se demuestra la estructura inicial del proyecto mediante:

tree

En Windows:

tree /F

La evidencia muestra las carpetas:

backend/
frontend/
agente/

y los archivos package.json.

Evidencia 2 - Prisma

Se demuestra la configuración del esquema de Prisma mediante:

backend/prisma/schema.prisma

También se muestra el historial Git relacionado con la creación del esquema.

Commit:

feat(backend): definir esquema de prisma y script de seed inicial
Evidencia 3 - Skills y reglas

Se demuestra la estructura del directorio:

agente/

incluyendo las skills de TasteSkill, las skills personalizadas y:

rules.md

Commit:

chore(agente): incorporar skills de tasteskill y reglas de arquitectura syslab 2.0
Evidencia 4 - Docker Compose

Se demuestra que los tres servicios están ejecutándose mediante:

sudo docker compose ps

Servicios:

restaurante_frontend
restaurante_backend
restaurante_db

Commit:

feat(docker): configurar entorno multi-contenedor con docker-compose
Evidencia 5 - Migración y seed

Se demuestra la ejecución de Prisma:

sudo docker compose exec backend npx prisma migrate dev --name init

y:

sudo docker compose exec backend node prisma/seed.js

La evidencia debe mostrar que la base de datos se encuentra sincronizada y que el seed finalizó correctamente.

Commit:

feat(db): migrar esquema a postgresql y ejecutar script de seed
Evidencia 6 - Repositorio GitHub

La evidencia final debe demostrar:

Repositorio público.
Código fuente.
Historial de commits.
README renderizado.
Documentación del proyecto.

Commit correspondiente:

docs(readme): completar documentacion del proyecto y guia de ejecucion
26. Verificación final

Para verificar que todos los servicios están funcionando:

sudo docker compose ps

Para verificar PostgreSQL:

sudo docker compose exec backend npx prisma migrate status

Para verificar el backend:

curl http://localhost:3000/health

Para verificar el frontend:

http://localhost:5173

El entorno esperado es:

+-----------------------+
|       FRONTEND        |
|       :5173           |
|       RUNNING         |
+-----------+-----------+
            |
            v
+-----------------------+
|        BACKEND        |
|       :3000           |
|       RUNNING         |
+-----------+-----------+
            |
            v
+-----------------------+
|      POSTGRESQL       |
|       :5432           |
|       HEALTHY         |
+-----------------------+
27. Consideraciones para producción

El entorno actual está orientado al desarrollo y a la práctica académica.

Para un despliegue productivo se deberían incorporar medidas adicionales como:

Contraseñas seguras.
Gestión de secretos.
HTTPS.
Autenticación completa.
Autorización basada en roles.
Validación de entradas.
Manejo centralizado de errores.
Registro de eventos.
Monitoreo.
Backups de PostgreSQL.
Políticas de seguridad para contenedores.
Configuración de recursos.
Variables de entorno específicas para producción.
28. Conclusiones

El proyecto RESTAURANTE-SIS permite demostrar la implementación de una arquitectura multi-contenedor para un sistema de gestión de restaurante.

La separación entre frontend, backend y PostgreSQL permite organizar las responsabilidades de cada componente y facilita el mantenimiento del sistema.

Docker Compose permite ejecutar los diferentes servicios de manera coordinada, mientras que PostgreSQL proporciona la persistencia de los datos.

Prisma ORM facilita la definición del modelo de datos, la generación del cliente de acceso a datos y la administración de migraciones.

La incorporación de skills y reglas para agentes permite establecer criterios de desarrollo relacionados con la arquitectura, backend, persistencia, seguridad y mantenimiento.

Finalmente, el uso de Git y Conventional Commits permite mantener un historial de cambios organizado y facilita el seguimiento de las diferentes etapas del desarrollo.

El entorno implementado constituye una base para continuar desarrollando las funcionalidades completas del sistema de gestión de restaurante.
