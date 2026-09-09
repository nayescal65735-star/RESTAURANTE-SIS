# Prisma PostgreSQL - RESTAURANTE-SIS

## Propósito

Definir las reglas para trabajar con Prisma ORM y PostgreSQL en RESTAURANTE-SIS.

## Stack

- PostgreSQL
- Prisma ORM 6
- Prisma Client
- Node.js

## Reglas

1. El proveedor de Prisma debe ser PostgreSQL.
2. La conexión debe utilizar DATABASE_URL.
3. No almacenar credenciales de PostgreSQL directamente en el código.
4. El esquema principal debe permanecer en prisma/schema.prisma.
5. Las modificaciones estructurales de la base de datos deben realizarse mediante migraciones Prisma.
6. Utilizar Prisma Client para las operaciones de persistencia.
7. Mantener relaciones e integridad referencial entre entidades.
8. Utilizar índices cuando sean necesarios para consultas frecuentes.
9. Utilizar restricciones únicas para datos que no deben duplicarse.
10. Los datos iniciales deben mantenerse en prisma/seed.js.
11. El seed debe poder ejecutarse de forma repetible sin generar duplicados innecesarios.
12. Las credenciales y archivos .env no deben incluirse en Git.
13. La base de datos debe ejecutarse como servicio PostgreSQL dentro de Docker Compose.
