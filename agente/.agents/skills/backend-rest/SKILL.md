# Backend REST - RESTAURANTE-SIS

## Propósito

Establecer criterios para desarrollar el backend REST del sistema de gestión de restaurante.

## Stack

- Node.js
- Express
- JavaScript
- Prisma ORM
- PostgreSQL
- Docker

## Reglas

1. Organizar el backend por responsabilidades.
2. Separar rutas, controladores, servicios y acceso a datos cuando el proyecto crezca.
3. Validar los datos recibidos desde el cliente.
4. Utilizar códigos HTTP apropiados.
5. No exponer contraseñas ni datos sensibles en las respuestas.
6. Manejar errores de forma consistente.
7. Mantener las operaciones de persistencia mediante Prisma.
8. Utilizar variables de entorno para configuración.
9. Evitar credenciales escritas directamente en el código.
10. Mantener compatibilidad con ejecución dentro de Docker.
11. Aplicar control de acceso según el rol del usuario.
12. Mantener endpoints relacionados con los requisitos funcionales del sistema.

## Requisitos funcionales considerados

- Usuarios
- Clientes
- Reservas
- Mesas
- Categorías
- Platos
- Pedidos
- Ventas
- Inventario
- Proveedores
- Reportes
