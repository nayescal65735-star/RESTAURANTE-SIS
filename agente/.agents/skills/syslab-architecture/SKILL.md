# Arquitectura SysLab 2.0 - RESTAURANTE-SIS

## Propósito

Establecer reglas de arquitectura para el entorno multi-contenedor del proyecto RESTAURANTE-SIS.

## Arquitectura

El sistema debe mantener tres componentes principales:

1. Frontend
2. Backend
3. PostgreSQL

Estos componentes deben poder ejecutarse mediante Docker Compose.

## Reglas

1. El backend debe comunicarse con PostgreSQL mediante Prisma.
2. PostgreSQL debe ejecutarse como un servicio independiente.
3. El frontend debe comunicarse con el backend mediante HTTP.
4. Cada componente debe tener responsabilidades claramente separadas.
5. La configuración específica del entorno debe utilizar variables de entorno.
6. Los secretos no deben almacenarse en el repositorio.
7. Los servicios deben poder levantarse mediante Docker Compose.
8. El backend debe poder ejecutar migraciones Prisma dentro de su contenedor.
9. El seed inicial debe ejecutarse contra la base de datos PostgreSQL.
10. Los cambios importantes deben registrarse mediante commits Conventional Commits.
11. La arquitectura debe facilitar futuras modificaciones y mantenimiento.
12. Las funcionalidades deben corresponder a los requisitos funcionales definidos para RESTAURANTE-SIS.
