const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de RESTAURANTE-SIS...');

  // Usuario administrador
  const admin = await prisma.usuario.upsert({
    where: {
      email: 'admin@restaurante.local',
    },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@restaurante.local',
      password: 'admin123',
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log(`Usuario creado: ${admin.email}`);

  // Categoría
  const categoria = await prisma.categoria.upsert({
    where: {
      nombre: 'Platos Principales',
    },
    update: {},
    create: {
      nombre: 'Platos Principales',
      descripcion: 'Platos principales del restaurante',
      activo: true,
    },
  });

  console.log(`Categoría creada: ${categoria.nombre}`);

  // Plato
  let plato = await prisma.plato.findFirst({
    where: {
      nombre: 'Pollo a la Plancha',
    },
  });

  if (!plato) {
    plato = await prisma.plato.create({
      data: {
        nombre: 'Pollo a la Plancha',
        descripcion: 'Pollo a la plancha acompañado de guarnición',
        precio: 35.00,
        disponible: true,
        categoriaId: categoria.id,
      },
    });
  }

  console.log(`Plato creado: ${plato.nombre}`);

  // Mesas
  for (let numero = 1; numero <= 5; numero++) {
    await prisma.mesa.upsert({
      where: {
        numero,
      },
      update: {},
      create: {
        numero,
        capacidad: 4,
        estado: 'DISPONIBLE',
      },
    });
  }

  console.log('5 mesas creadas/verificadas.');

  // Cliente
  let cliente = await prisma.cliente.findFirst({
    where: {
      email: 'cliente@restaurante.local',
    },
  });

  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nombre: 'Cliente General',
        telefono: '70000000',
        email: 'cliente@restaurante.local',
      },
    });
  }

  console.log(`Cliente creado: ${cliente.nombre}`);

  // Proveedor
  let proveedor = await prisma.proveedor.findFirst({
    where: {
      nombre: 'Proveedor General',
    },
  });

  if (!proveedor) {
    proveedor = await prisma.proveedor.create({
      data: {
        nombre: 'Proveedor General',
        contacto: 'Encargado de ventas',
        telefono: '70000001',
        email: 'proveedor@restaurante.local',
        direccion: 'Santa Cruz de la Sierra',
        activo: true,
      },
    });
  }

  console.log(`Proveedor creado: ${proveedor.nombre}`);

  // Inventario
  let inventario = await prisma.inventario.findFirst({
    where: {
      nombre: 'Pollo',
    },
  });

  if (!inventario) {
    inventario = await prisma.inventario.create({
      data: {
        nombre: 'Pollo',
        descripcion: 'Pollo para preparación de platos',
        unidad: 'kg',
        stock: 50.00,
        stockMinimo: 10.00,
        precioCompra: 28.00,
        proveedorId: proveedor.id,
      },
    });
  }

  console.log(`Producto de inventario creado: ${inventario.nombre}`);

  console.log('Seed completado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
