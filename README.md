Proyecto de Sistemas Paralelos — RESTAURANTE-SIS

Estudiante: Nayeli Escalante Gudiño - RU:e124890/ CI: 10730062

Docente: Ing. Elias Cassal Baldiviezo

Asignatura: Sistemas Paralelos

Arquitectura Base: SysLab 2.0

Proyecto desarrollado para la asignatura Sistemas Paralelos, aplicando la arquitectura técnica de SysLab 2.0 (Backend + Frontend + PostgreSQL + Prisma + Agente de IA). RESTAURANTE-SIS está orientado a la gestión de las operaciones principales de un restaurante.

Descripción general

RESTAURANTE-SIS busca centralizar la gestión de un restaurante mediante una aplicación web, permitiendo organizar información relacionada con mesas, clientes, pedidos, productos y ventas.

El proyecto utiliza una arquitectura distribuida compuesta por Frontend, Backend y PostgreSQL, ejecutados mediante Docker Compose.

Arquitectura de Tecnologías
Backend: Node.js + Express
Frontend: React + Vite
Base de datos: PostgreSQL 15 con Prisma ORM
Despliegue: Docker Compose (3 contenedores: backend, frontend y base de datos)
Agente de IA: reglas y skills de TasteSkill y personalizadas para SysLab 2.0

Estructura del Repositorio


RESTAURANTE-SIS/

├── agente/

│   ├── .agents/

│   │   └── skills/

│   │       ├── design-taste-frontend/

│   │       ├── backend-rest/

│   │       ├── prisma-postgresql/

│   │       └── syslab-architecture/

│   ├── rules.md

│   └── skills-lock.json

│

├── backend/

│   ├── index.js

│   ├── Dockerfile

│   ├── package.json

│   └── prisma/

│       ├── migrations/

│       ├── schema.prisma

│       └── seed.js

│

├── frontend/

│   ├── src/

│   ├── Dockerfile

│   └── package.json

│

├── docker-compose.yml

└── README.md







