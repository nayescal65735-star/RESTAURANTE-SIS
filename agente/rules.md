# Reglas de arquitectura y desarrollo - RESTAURANTE-SIS

## Propósito

Este documento establece las reglas que deben seguir los agentes y desarrolladores durante la construcción de RESTAURANTE-SIS.

## Arquitectura

El proyecto utiliza una arquitectura multi-contenedor compuesta por:

- Frontend
- Backend
- PostgreSQL

Docker Compose será utilizado para coordinar los servicios.

## Backend

El backend utiliza:

- Node.js
- Express
- Prisma ORM
- PostgreSQL

El código debe mantenerse organizado y separado por responsabilidades.

## Persistencia

Prisma ORM será la capa de acceso a datos.

El esquema de base de datos debe mantenerse en:

prisma/schema.prisma

Los datos iniciales deben mantenerse en:

prisma/seed.js

Las modificaciones del esquema deben realizarse mediante migraciones Prisma.

## Base de datos

PostgreSQL será el motor de base de datos.

La conexión debe utilizar:

DATABASE_URL

Las credenciales no deben escribirse directamente en el código fuente.

## Seguridad

No se deben almacenar:

- Contraseñas reales
- Tokens
- Claves privadas
- Credenciales de producción
- Archivos .env

Los archivos de configuración sensibles deben permanecer fuera del control de versiones.

## Agentes y skills

Los agentes deben:

1. Respetar la arquitectura definida.
2. Utilizar las skills disponibles.
3. Evitar modificar componentes sin considerar sus dependencias.
4. Mantener la integridad del modelo Prisma.
5. Evitar duplicar funcionalidades existentes.
6. Validar los cambios antes de considerarlos terminados.

## Requisitos funcionales

La arquitectura debe permitir implementar:

- Gestión de usuarios
- Gestión de clientes
- Reservas
- Mesas
- Categorías
- Platos
- Pedidos
- Ventas
- Inventario
- Proveedores
- Reportes

## Control de versiones

Los cambios importantes deben utilizar Conventional Commits en español.

Prefijos permitidos:

- feat:
- fix:
- docs:
- chore:

Ejemplo:

feat(backend): agregar endpoint de reservas

## Docker

Los servicios deben poder ejecutarse mediante Docker Compose.

El backend debe poder conectarse al servicio PostgreSQL utilizando el nombre del servicio de Docker.

## Calidad

Antes de finalizar un cambio importante se debe verificar:

- Sintaxis
- Dependencias
- Configuración
- Integridad de Prisma
- Compatibilidad con Docker
- Ausencia de secretos
- Estado de Git
