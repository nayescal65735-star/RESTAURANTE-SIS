# Proyecto de Sistemas Paralelos — RESTAURANTE-SIS

**Estudiante:** Nayeli Escalante Gudiño
**RU:** e124890
**CI:** 10730062

**Docente:** Ing. Elias Cassal Baldiviezo

**Asignatura:** Sistemas Paralelos

**Arquitectura Base:** SysLab 2.0

---

## Descripción del Proyecto

**RESTAURANTE-SIS** es un sistema web desarrollado para la asignatura **Sistemas Paralelos**, basado en la arquitectura técnica **SysLab 2.0**.

El sistema está orientado a centralizar y facilitar la gestión de las principales operaciones de un restaurante, permitiendo administrar usuarios, clientes, mesas, reservas, categorías, platos y pedidos.

La solución utiliza una arquitectura distribuida compuesta por **Frontend, Backend y PostgreSQL**, ejecutados mediante **Docker Compose**, además de incorporar reglas y skills de un agente de IA para apoyar el desarrollo bajo la arquitectura SysLab 2.0.

---

# Arquitectura de Tecnologías

| Componente    | Tecnología                                         |
| ------------- | -------------------------------------------------- |
| Frontend      | React + Vite                                       |
| Backend       | Node.js + Express                                  |
| Base de datos | PostgreSQL 15                                      |
| ORM           | Prisma                                             |
| Contenedores  | Docker + Docker Compose                            |
| Agente de IA  | TasteSkill + Skills personalizadas para SysLab 2.0 |

La arquitectura está organizada en los siguientes componentes principales:

* **Frontend:** interfaz web para la interacción con el sistema.
* **Backend:** API REST encargada de la lógica de negocio.
* **PostgreSQL:** almacenamiento persistente de la información.
* **Prisma:** ORM utilizado para modelar y gestionar la base de datos.
* **Docker Compose:** orquestación de los servicios.
* **Agente de IA:** conjunto de reglas y skills utilizadas durante el desarrollo.

---

# Estructura del Repositorio

```text
RESTAURANTE-SIS/
│
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
│   ├── src/
│   │   ├── prisma.js
│   │   ├── routes/
│   │   └── utils/
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
```

---

# Cómo ejecutar el proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/nayescal65735-star/RESTAURANTE-SIS.git
cd RESTAURANTE-SIS
```

## 2. Configurar las variables de entorno

Crear los archivos `.env` correspondientes en `backend/` y `frontend/`, tomando como referencia los archivos `.env.example`.

No se deben subir al repositorio credenciales, contraseñas ni información sensible.

## 3. Construir y ejecutar los contenedores

```bash
sudo docker compose up --build -d
```

## 4. Verificar los servicios

```bash
sudo docker compose ps
```

Los principales servicios corresponden a:

* Backend
* Frontend
* PostgreSQL

## 5. Acceder al sistema

**Backend:**

```text
http://localhost:3000
```

**Frontend:**

```text
http://localhost:5173
```

---

# Requerimientos Funcionales

| ID   | Requerimiento                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------- |
| RF01 | El sistema debe permitir gestionar usuarios y sus roles.                                                 |
| RF02 | El sistema debe permitir registrar y consultar clientes.                                                 |
| RF03 | El sistema debe permitir gestionar reservas de mesas.                                                    |
| RF04 | El sistema debe permitir gestionar las mesas disponibles y ocupadas.                                     |
| RF05 | El sistema debe permitir gestionar categorías y platos del menú.                                         |
| RF06 | El sistema debe permitir registrar pedidos y sus detalles.                                               |
| RF07 | El sistema debe permitir registrar ventas y consultar su información.                                    |
| RF08 | El sistema debe mostrar información resumida de ventas, pedidos, mesas y clientes mediante el dashboard. |

---

# Requerimientos No Funcionales

| ID    | Requerimiento                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| RNF01 | **Usabilidad:** la interfaz debe ser sencilla e intuitiva para los usuarios.                                             |
| RNF02 | **Rendimiento:** el sistema debe responder de manera adecuada a las operaciones realizadas.                              |
| RNF03 | **Seguridad:** el acceso a la información debe estar protegido mediante mecanismos de autenticación y control de acceso. |
| RNF04 | **Integridad:** la información almacenada en PostgreSQL debe mantener relaciones y restricciones consistentes.           |
| RNF05 | **Disponibilidad:** los servicios deben poder ejecutarse de forma conjunta mediante Docker Compose.                      |
| RNF06 | **Compatibilidad:** la aplicación debe funcionar correctamente en navegadores web modernos.                              |
| RNF07 | **Mantenibilidad:** el código debe estar organizado de forma modular para facilitar futuras modificaciones.              |
| RNF08 | **Portabilidad:** el sistema debe poder desplegarse en diferentes entornos mediante contenedores Docker.                 |

---

# Historias de Usuario

## Módulo de Clientes y Reservas

**HU01** – Como usuario, quiero registrar clientes, para mantener actualizada la información de las personas que utilizan el restaurante.

**HU02** – Como usuario, quiero registrar reservas de mesas, para organizar la atención de los clientes.

## Módulo de Menú y Pedidos

**HU03** – Como administrador, quiero gestionar categorías y platos, para mantener actualizado el menú del restaurante.

**HU04** – Como empleado, quiero registrar pedidos de los clientes, para llevar el control de los productos solicitados.

**HU05** – Como empleado, quiero consultar el estado de las mesas, para conocer cuáles están disponibles u ocupadas.

## Módulo de Ventas

**HU06** – Como empleado, quiero registrar las ventas, para llevar un control de los ingresos del restaurante.

## Módulo de Usuarios y Reportes

**HU07** – Como administrador, quiero gestionar usuarios y roles, para controlar el acceso a las funciones del sistema.

**HU08** – Como administrador, quiero visualizar información resumida de ventas, pedidos, mesas y clientes, para conocer el estado general del restaurante.

---

# Criterios de Aceptación

Los siguientes criterios permiten verificar objetivamente el cumplimiento de las historias de usuario y requerimientos funcionales del sistema.

## CA01 — Gestión de Usuarios y Roles

Relacionado con **RF01 / HU07**.

* El sistema debe permitir iniciar sesión mediante credenciales válidas.
* El sistema debe rechazar credenciales incorrectas.
* El sistema debe permitir registrar usuarios cuando se cuente con los permisos correspondientes.
* El sistema debe permitir asignar roles a los usuarios.
* El sistema debe permitir consultar los usuarios registrados.
* El sistema debe permitir editar la información de un usuario.
* El sistema debe permitir activar o desactivar usuarios cuando corresponda.
* Las funciones administrativas deben estar restringidas a usuarios con los permisos necesarios.
* Un usuario no autorizado no debe poder acceder directamente a endpoints protegidos.

---

## CA02 — Gestión de Clientes

Relacionado con **RF02 / HU01**.

* El sistema debe permitir registrar un cliente con la información requerida.
* El sistema debe validar los campos obligatorios antes de guardar la información.
* El sistema debe impedir registros que incumplan las restricciones definidas.
* El sistema debe permitir consultar la lista de clientes.
* El sistema debe permitir buscar clientes.
* El sistema debe permitir editar la información de un cliente.
* El sistema debe permitir eliminar o desactivar un cliente cuando corresponda.
* Los cambios realizados deben persistir correctamente en PostgreSQL.
* Las operaciones realizadas desde el frontend deben comunicarse correctamente con el backend.

---

## CA03 — Gestión de Reservas

Relacionado con **RF03 / HU02**.

* El sistema debe permitir registrar una reserva.
* Una reserva debe estar asociada a un cliente.
* Una reserva debe permitir seleccionar una mesa cuando corresponda.
* El sistema debe registrar fecha y hora de la reserva.
* El sistema debe validar la información obligatoria.
* El sistema debe evitar conflictos de reservas para una misma mesa y horario.
* El sistema debe permitir consultar las reservas existentes.
* El sistema debe permitir modificar una reserva.
* El sistema debe permitir cancelar una reserva.
* El estado de una reserva debe mantenerse correctamente en la base de datos.

---

## CA04 — Gestión de Mesas

Relacionado con **RF04 / HU05**.

* El sistema debe mostrar las mesas registradas.
* El sistema debe identificar las mesas disponibles.
* El sistema debe identificar las mesas ocupadas.
* El sistema debe permitir actualizar el estado de una mesa según las operaciones realizadas.
* Una mesa ocupada no debe aparecer como disponible para una nueva asignación incompatible.
* El estado de las mesas debe mantenerse actualizado después de registrar o finalizar operaciones relacionadas.
* La información mostrada en el frontend debe corresponder con la información almacenada en PostgreSQL.

---

## CA05 — Gestión de Categorías y Platos

Relacionado con **RF05 / HU03**.

* El administrador debe poder registrar categorías.
* El administrador debe poder consultar categorías.
* El administrador debe poder modificar categorías.
* El administrador debe poder registrar platos.
* Cada plato debe poder asociarse a una categoría.
* El sistema debe permitir consultar los platos registrados.
* El sistema debe permitir modificar la información de un plato.
* El sistema debe permitir controlar la disponibilidad de los platos.
* Los cambios realizados deben persistir correctamente.

---

## CA06 — Gestión de Pedidos

Relacionado con **RF06 / HU04**.

* El sistema debe permitir crear un pedido.
* El pedido debe registrar los productos solicitados.
* El pedido debe registrar las cantidades correspondientes.
* El sistema debe calcular correctamente los importes de los detalles del pedido.
* El sistema debe calcular el total del pedido.
* El pedido debe poder asociarse a una mesa o cliente cuando corresponda.
* El sistema debe permitir consultar los pedidos registrados.
* El sistema debe permitir actualizar el estado de un pedido.
* Los datos del pedido deben almacenarse correctamente en PostgreSQL.
* Los errores de validación deben mostrarse al usuario de forma comprensible.

---

## CA07 — Gestión de Ventas

Relacionado con **RF07 / HU06**.

* El sistema debe permitir registrar una venta.
* Una venta debe almacenar la información necesaria para identificar la operación.
* El sistema debe registrar los productos o conceptos asociados a la venta.
* El sistema debe calcular correctamente el total de la venta.
* El sistema debe permitir consultar las ventas registradas.
* La información de una venta debe mantenerse persistente en PostgreSQL.
* El sistema debe evitar registrar operaciones incompletas que incumplan las restricciones de la base de datos.
* La información de ventas debe estar disponible para las consultas del dashboard.

---

## CA08 — Dashboard y Resumen de Información

Relacionado con **RF08 / HU08**.

* El sistema debe mostrar un resumen general de la operación del restaurante.
* El dashboard debe mostrar información relacionada con ventas.
* El dashboard debe mostrar información relacionada con pedidos.
* El dashboard debe mostrar información relacionada con mesas.
* El dashboard debe mostrar información relacionada con clientes.
* Los datos mostrados deben provenir de la información registrada en el sistema.
* La información debe actualizarse cuando existan nuevos registros relevantes.
* El dashboard debe presentar la información de manera comprensible para el usuario.

---

# Criterios de Aceptación de Integración

Además de los criterios específicos de cada módulo, el sistema completo debe cumplir los siguientes criterios:

### CA09 — Comunicación Frontend–Backend

* El frontend debe comunicarse con el backend mediante la API REST.
* Las operaciones de consulta deben devolver información correctamente.
* Las operaciones de creación deben persistir la información.
* Las operaciones de modificación deben actualizar los registros correspondientes.
* Las operaciones de eliminación o desactivación deben ejecutarse según las reglas del sistema.
* Los errores provenientes del backend deben manejarse correctamente en el frontend.

### CA10 — Persistencia de Datos

* La información registrada debe almacenarse en PostgreSQL.
* Los datos deben permanecer disponibles después de reiniciar los servicios.
* Las relaciones entre entidades deben respetar el esquema definido mediante Prisma.
* Las restricciones de integridad deben ser aplicadas correctamente.
* Las migraciones de Prisma deben poder ejecutarse sin inconsistencias.

### CA11 — Autenticación y Autorización

* Las rutas protegidas deben requerir autenticación.
* Los usuarios deben acceder únicamente a las funcionalidades correspondientes a su rol.
* Las credenciales no deben almacenarse directamente en el código fuente.
* Las variables sensibles deben manejarse mediante variables de entorno.
* Las solicitudes no autorizadas deben recibir una respuesta de error adecuada.

### CA12 — Docker y Despliegue

* El proyecto debe poder iniciarse mediante Docker Compose.
* Los servicios de frontend, backend y PostgreSQL deben poder ejecutarse conjuntamente.
* El backend debe poder comunicarse con PostgreSQL dentro de la red de Docker.
* El frontend debe poder comunicarse con el backend.
* Los servicios deben poder verificarse mediante `docker compose ps`.
* El sistema debe poder reconstruirse mediante:

```bash
docker compose up --build -d
```

### CA13 — Manejo de Errores

* El sistema debe validar los datos ingresados por el usuario.
* Los errores deben mostrar mensajes comprensibles.
* El backend debe manejar errores de base de datos.
* Las solicitudes a endpoints inexistentes deben devolver respuestas apropiadas.
* El sistema no debe finalizar inesperadamente ante errores controlables.
* Las operaciones fallidas no deben generar registros inconsistentes.

### CA14 — Interfaz de Usuario

* Las pantallas principales deben ser accesibles desde la navegación del sistema.
* Los formularios deben identificar claramente los campos requeridos.
* Las acciones de registrar, editar, consultar y eliminar deben ser distinguibles.
* El usuario debe recibir confirmación cuando una operación se complete correctamente.
* El usuario debe recibir información cuando una operación no pueda completarse.
* La interfaz debe mantener una presentación consistente entre módulos.

---

# Matriz de Trazabilidad

| Historia de Usuario | Requerimiento | Criterios de Aceptación |
| ------------------- | ------------- | ----------------------- |
| HU01                | RF02          | CA02                    |
| HU02                | RF03          | CA03                    |
| HU03                | RF05          | CA05                    |
| HU04                | RF06          | CA06                    |
| HU05                | RF04          | CA04                    |
| HU06                | RF07          | CA07                    |
| HU07                | RF01          | CA01                    |
| HU08                | RF08          | CA08                    |

Los criterios **CA09–CA14** corresponden a criterios transversales de integración, persistencia, seguridad, despliegue, manejo de errores e interfaz.

---

# Tecnologías y Componentes

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express
* API REST

### Base de Datos

* PostgreSQL 15
* Prisma ORM
* Migraciones Prisma
* Seed de datos

### Infraestructura

* Docker
* Docker Compose

### Inteligencia Artificial

* TasteSkill
* Skills personalizadas
* Arquitectura SysLab 2.0

---

# Objetivo Académico

El proyecto tiene como finalidad aplicar los conceptos estudiados en la asignatura **Sistemas Paralelos**, utilizando una arquitectura distribuida basada en servicios independientes y comunicación entre componentes.

RESTAURANTE-SIS permite demostrar la integración de:

* Aplicaciones web.
* APIs REST.
* Bases de datos relacionales.
* ORM.
* Contenedores.
* Arquitecturas distribuidas.
* Autenticación y autorización.
* Persistencia de información.
* Modularización del software.
* Automatización del despliegue.
* Uso de herramientas y agentes de inteligencia artificial durante el desarrollo.

---

# Estado del Proyecto

El proyecto se encuentra en desarrollo y cuenta con módulos funcionales para la gestión de:

* Usuarios y roles.
* Clientes.
* Reservas.
* Mesas.
* Categorías.
* Platos.
* Pedidos.
* Ventas.
* Dashboard.

Los criterios de aceptación definidos en este documento sirven como base para verificar funcionalmente cada módulo y la integración general del sistema.
