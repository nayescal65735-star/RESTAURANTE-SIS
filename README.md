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

Cómo ejecutar el proyecto

Clonar el repositorio.

Crear los archivos .env correspondientes en backend/ y frontend/ tomando como referencia los archivos .env.example.

Ejecutar:

sudo docker compose up --build -d

sudo docker compose ps

Backend: http://localhost:3000

Frontend: http://localhost:5173

Requerimientos Funcionales (RF)

ID	Requerimiento

RF01	El sistema debe permitir gestionar usuarios y sus roles.

RF02	El sistema debe permitir registrar y consultar clientes.

RF03	El sistema debe permitir gestionar reservas de mesas.

RF04	El sistema debe permitir gestionar las mesas disponibles y ocupadas.

RF05	El sistema debe permitir gestionar categorías y platos del menú.

RF06	El sistema debe permitir registrar pedidos y sus detalles.

RF07	El sistema debe permitir registrar ventas y consultar su información.

RF08	El sistema debe permitir gestionar productos del inventario.

RF09	El sistema debe permitir registrar y consultar proveedores.

RF10	El sistema debe mostrar información resumida de ventas, pedidos, mesas y clientes mediante el dashboard.

Requerimientos No Funcionales (RNF)

ID	Requerimiento

RNF01	Usabilidad: la interfaz debe ser sencilla e intuitiva para los usuarios.

RNF02	Rendimiento: el sistema debe responder de manera adecuada a las operaciones realizadas.

RNF03	Seguridad: el acceso a la información debe estar protegido mediante mecanismos de autenticación y control de 
acceso.

RNF04	Integridad: la información almacenada en PostgreSQL debe mantener relaciones y restricciones consistentes.

RNF05	Disponibilidad: los servicios deben poder ejecutarse de forma conjunta mediante Docker Compose.

RNF06	Compatibilidad: la aplicación debe funcionar correctamente en navegadores web modernos.

RNF07	Mantenibilidad: el código debe estar organizado de forma modular para facilitar futuras modificaciones.

RNF08	Portabilidad: el sistema debe poder desplegarse en diferentes entornos mediante contenedores Docker.

Historias de Usuario

Módulo de Clientes y Reservas

HU01 – Como usuario, quiero registrar clientes, para mantener actualizada la información de las personas que 
utilizan el restaurante.

HU02 – Como usuario, quiero registrar reservas de mesas, para organizar la atención de los clientes.

Módulo de Menú y Pedidos

HU03 – Como administrador, quiero gestionar categorías y platos, para mantener actualizado el menú del restaurante.

HU04 – Como empleado, quiero registrar pedidos de los clientes, para llevar el control de los productos solicitados.

HU05 – Como empleado, quiero consultar el estado de las mesas, para conocer cuáles están disponibles u ocupadas.

Módulo de Ventas e Inventario

HU06 – Como empleado, quiero registrar las ventas, para llevar un control de los ingresos del restaurante.

HU07 – Como administrador, quiero gestionar el inventario, para controlar la disponibilidad de productos.

HU08 – Como administrador, quiero consultar proveedores, para mantener organizada la información de abastecimiento.

Módulo de Usuarios y Reportes

HU09 – Como administrador, quiero gestionar usuarios y roles, para controlar el acceso a las funciones del sistema.

HU10 – Como administrador, quiero visualizar información resumida de ventas, pedidos, mesas y clientes, para conocer el estado general del restaurante.





