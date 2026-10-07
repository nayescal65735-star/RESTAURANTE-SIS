const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/auth');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed completo y seguro de RESTAURANTE-SIS...');

  // 1. Usuarios por rol
  const usuariosData = [
    {
      nombre: 'Administrador Demo',
      email: 'admin@restaurante.com',
      password: hashPassword('Admin123!'),
      rol: 'ADMIN',
      activo: true,
    },
    {
      nombre: 'Administrador General',
      email: 'admin@restaurante.local',
      password: hashPassword('admin123'),
      rol: 'ADMIN',
      activo: true,
    },
    {
      nombre: 'Juan Mesero',
      email: 'mesero@restaurante.local',
      password: hashPassword('mesero123'),
      rol: 'MESERO',
      activo: true,
    },
    {
      nombre: 'Carlos Cocinero',
      email: 'cocina@restaurante.local',
      password: hashPassword('cocina123'),
      rol: 'COCINERO',
      activo: true,
    },
    {
      nombre: 'María Cajera',
      email: 'caja@restaurante.local',
      password: hashPassword('caja123'),
      rol: 'CAJERO',
      activo: true,
    },
  ];

  const usuarios = [];
  for (const u of usuariosData) {
    const usuario = await prisma.usuario.upsert({
      where: { email: u.email },
      update: { nombre: u.nombre, rol: u.rol, activo: u.activo, password: u.password },
      create: u,
    });
    usuarios.push(usuario);
  }
  console.log(`✓ ${usuarios.length} usuarios sincronizados.`);

  // 2. Categorías
  const categoriasData = [
    { nombre: 'Platos Principales', descripcion: 'Especialidades culinarias de la casa' },
    { nombre: 'Hamburguesas y Snacks', descripcion: 'Hamburguesas artesanales y porciones' },
    { nombre: 'Pizzas y Pastas', descripcion: 'Pizzas al horno y pastas tradicionales' },
    { nombre: 'Bebidas y Refrescos', descripcion: 'Jugos naturales, gaseosas y cervezas' },
    { nombre: 'Postres', descripcion: 'Dulces, helados y tartas caseras' },
  ];

  const categorias = [];
  for (const cat of categoriasData) {
    const c = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: { descripcion: cat.descripcion, activo: true },
      create: { ...cat, activo: true },
    });
    categorias.push(c);
  }
  console.log(`✓ ${categorias.length} categorías sincronizadas.`);

  // 3. Platos por categoría
  const platosData = [
    // Platos Principales
    {
      nombre: 'Pollo a la Plancha',
      descripcion: 'Pechuga tierna a la plancha con arroz blanco, papas fritas y ensalada fresca',
      precio: 35.00,
      categoria: 'Platos Principales',
    },
    {
      nombre: 'Pollo a la Broaster',
      descripcion: 'Crujiente pollo broaster acompañado de papas fritas, plátano frito y salsa tártara',
      precio: 40.00,
      categoria: 'Platos Principales',
    },
    {
      nombre: 'Lomo Saltado',
      descripcion: 'Trozos de lomo fino salteados al wok con cebolla, tomate y papas fritas',
      precio: 48.00,
      categoria: 'Platos Principales',
    },
    {
      nombre: 'Silpancho Cochabambino',
      descripcion: 'Carne apanada sobre arroz y papas doradas, con huevo frito y ensalada de tomate',
      precio: 38.00,
      categoria: 'Platos Principales',
    },
    {
      nombre: 'Pique Macho Especial',
      descripcion: 'Lomo en cubos, salchichas, huevo duro, papas fritas, cebolla, locoto y tomate',
      precio: 65.00,
      categoria: 'Platos Principales',
    },

    // Hamburguesas y Snacks
    {
      nombre: 'Hamburguesa Clásica',
      descripcion: 'Carne artesanal de 180g, queso cheddar, lechuga, tomate y salsa especial',
      precio: 30.00,
      categoria: 'Hamburguesas y Snacks',
    },
    {
      nombre: 'Hamburguesa Doble Queso & Bacon',
      descripcion: 'Doble carne de 150g, queso cheddar derretido, tocino crocante y cebolla caramelizada',
      precio: 45.00,
      categoria: 'Hamburguesas y Snacks',
    },
    {
      nombre: 'Salchipapa Suprema',
      descripcion: 'Porción generosa de papas fritas, salchichas frankfurt y mix de salsas',
      precio: 25.00,
      categoria: 'Hamburguesas y Snacks',
    },

    // Pizzas y Pastas
    {
      nombre: 'Pizza Familiar Mozzarella & Jamón',
      descripcion: 'Masa artesanal a la piedra, salsa de tomate casera, queso mozzarella y jamón',
      precio: 65.00,
      categoria: 'Pizzas y Pastas',
    },
    {
      nombre: 'Pizza Pepperoni Especial',
      descripcion: 'Abundante queso mozzarella fundido con rodajas de pepperoni premium y orégano',
      precio: 70.00,
      categoria: 'Pizzas y Pastas',
    },
    {
      nombre: 'Fettuccine Alfredo con Pollo',
      descripcion: 'Pasta artesanal en cremosa salsa Alfredo con tiras de pechuga a la parrilla',
      precio: 42.00,
      categoria: 'Pizzas y Pastas',
    },

    // Bebidas y Refrescos
    {
      nombre: 'Jugo Natural de Maracuyá (1L)',
      descripcion: 'Jarra de 1 litro de jugo natural fresco de maracuyá',
      precio: 18.00,
      categoria: 'Bebidas y Refrescos',
    },
    {
      nombre: 'Limonada Frozen Menta & Jengibre',
      descripcion: 'Limonada frappé refrescante con hierbabuena fresca',
      precio: 15.00,
      categoria: 'Bebidas y Refrescos',
    },
    {
      nombre: 'Gaseosa 2L Personalizable',
      descripcion: 'Botella de 2 litros bien helada (Coca Cola / Sprite / Fanta)',
      precio: 16.00,
      categoria: 'Bebidas y Refrescos',
    },
    {
      nombre: 'Cerveza Huari Tradicional (620ml)',
      descripcion: 'Cerveza lager tradicional boliviana servida a temperatura ideal',
      precio: 22.00,
      categoria: 'Bebidas y Refrescos',
    },

    // Postres
    {
      nombre: 'Torta Tres Leches',
      descripcion: 'Bizcocho húmedo bañado en tres tipos de leche con merengue suizo y canela',
      precio: 18.00,
      categoria: 'Postres',
    },
    {
      nombre: 'Copa Helada Artesanal',
      descripcion: '3 bolas de helado artesanal con salsa de chocolate, crema chantilly y barquillos',
      precio: 20.00,
      categoria: 'Postres',
    },
  ];

  for (const p of platosData) {
    const cat = categorias.find((c) => c.nombre === p.categoria);
    if (cat) {
      const existing = await prisma.plato.findFirst({
        where: { nombre: p.nombre },
      });
      if (existing) {
        await prisma.plato.update({
          where: { id: existing.id },
          data: {
            descripcion: p.descripcion,
            precio: p.precio,
            disponible: true,
            categoriaId: cat.id,
          },
        });
      } else {
        await prisma.plato.create({
          data: {
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            disponible: true,
            categoriaId: cat.id,
          },
        });
      }
    }
  }
  console.log(`✓ Platos del menú sincronizados.`);

  // 4. Mesas (8 mesas de salón)
  const mesasData = [
    { numero: 1, capacidad: 4, estado: 'DISPONIBLE' },
    { numero: 2, capacidad: 2, estado: 'DISPONIBLE' },
    { numero: 3, capacidad: 4, estado: 'DISPONIBLE' },
    { numero: 4, capacidad: 6, estado: 'DISPONIBLE' },
    { numero: 5, capacidad: 4, estado: 'DISPONIBLE' },
    { numero: 6, capacidad: 2, estado: 'DISPONIBLE' },
    { numero: 7, capacidad: 8, estado: 'DISPONIBLE' },
    { numero: 8, capacidad: 4, estado: 'DISPONIBLE' },
  ];

  for (const m of mesasData) {
    await prisma.mesa.upsert({
      where: { numero: m.numero },
      update: { capacidad: m.capacidad },
      create: m,
    });
  }
  console.log('✓ 8 mesas verificadas.');

  // 5. Clientes
  const clientesData = [
    { nombre: 'Cliente General', telefono: '70000000', email: 'cliente@restaurante.local' },
    { nombre: 'María López', telefono: '71234567', email: 'maria.lopez@gmail.com' },
    { nombre: 'Carlos Pérez', telefono: '72345678', email: 'carlos.perez@hotmail.com' },
    { nombre: 'Ana García', telefono: '73456789', email: 'ana.garcia@gmail.com' },
    { nombre: 'Roberto Gómez', telefono: '74567890', email: 'roberto.gomez@yahoo.com' },
  ];

  const clientes = [];
  for (const c of clientesData) {
    let cliente = await prisma.cliente.findFirst({
      where: { email: c.email },
    });
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: c });
    }
    clientes.push(cliente);
  }
  console.log(`✓ ${clientes.length} clientes sincronizados.`);

  // 6. Proveedores
  const proveedoresData = [
    {
      nombre: 'Avícola Sofía S.A.',
      contacto: 'Lic. Fernando Rojas',
      telefono: '70011223',
      email: 'ventas@sofia.bo',
      direccion: 'Parque Industrial Mza 12, Santa Cruz',
      activo: true,
    },
    {
      nombre: 'Distribuidora Bebidas El Valle',
      contacto: 'Carlos Montero',
      telefono: '70022334',
      email: 'pedidos@elvalle.com.bo',
      direccion: 'Av. Banzer 4to Anillo',
      activo: true,
    },
    {
      nombre: 'Lácteos y Quesos del Oriente',
      contacto: 'Patricia Vaca',
      telefono: '70033445',
      email: 'contacto@lacteosoriente.bo',
      direccion: 'Av. Santos Dumont 3er Anillo',
      activo: true,
    },
    {
      nombre: 'Verduras y Hortalizas del Campo',
      contacto: 'Mario Terrazas',
      telefono: '70044556',
      email: 'agricola.campo@gmail.com',
      direccion: 'Mercado Abasto Mayorista',
      activo: true,
    },
  ];

  const proveedores = [];
  for (const p of proveedoresData) {
    let prov = await prisma.proveedor.findFirst({
      where: { nombre: p.nombre },
    });
    if (!prov) {
      prov = await prisma.proveedor.create({ data: p });
    }
    proveedores.push(prov);
  }
  console.log(`✓ ${proveedores.length} proveedores sincronizados.`);

  // 7. Inventario
  const inventarioData = [
    {
      nombre: 'Pechuga de Pollo Fresca',
      descripcion: 'Pechuga deshuesada para milanesas y filetes',
      unidad: 'kg',
      stock: 45.50,
      stockMinimo: 15.00,
      precioCompra: 24.50,
      proveedorIndex: 0,
    },
    {
      nombre: 'Carne de Res de Primera (Lomo)',
      descripcion: 'Lomo fino para pique y silpancho',
      unidad: 'kg',
      stock: 28.00,
      stockMinimo: 10.00,
      precioCompra: 42.00,
      proveedorIndex: 0,
    },
    {
      nombre: 'Queso Mozzarella en Barra',
      descripcion: 'Queso para pizzas y gratinados',
      unidad: 'kg',
      stock: 4.50, // Stock bajo a propósito para demostración
      stockMinimo: 10.00,
      precioCompra: 38.00,
      proveedorIndex: 2,
    },
    {
      nombre: 'Papas Seleccionadas',
      descripcion: 'Papas para freír y guarniciones',
      unidad: 'bolsa 50kg',
      stock: 6.00,
      stockMinimo: 3.00,
      precioCompra: 120.00,
      proveedorIndex: 3,
    },
    {
      nombre: 'Aceite Vegetal Refinado',
      descripcion: 'Bidón de aceite para cocina',
      unidad: 'bidón 20L',
      stock: 2.00, // Stock bajo a propósito
      stockMinimo: 5.00,
      precioCompra: 180.00,
      proveedorIndex: 1,
    },
    {
      nombre: 'Gaseosas Surtidas 2L',
      descripcion: 'Packs de gaseosas para venta directa',
      unidad: 'pack x 6',
      stock: 25.00,
      stockMinimo: 8.00,
      precioCompra: 72.00,
      proveedorIndex: 1,
    },
  ];

  for (const inv of inventarioData) {
    const prov = proveedores[inv.proveedorIndex] || proveedores[0];
    const existing = await prisma.inventario.findFirst({
      where: { nombre: inv.nombre },
    });
    if (!existing) {
      await prisma.inventario.create({
        data: {
          nombre: inv.nombre,
          descripcion: inv.descripcion,
          unidad: inv.unidad,
          stock: inv.stock,
          stockMinimo: inv.stockMinimo,
          precioCompra: inv.precioCompra,
          proveedorId: prov ? prov.id : null,
        },
      });
    }
  }
  console.log(`✓ Inventario sincronizado con alertas de stock.`);

  // 8. Reservas de demostración
  const mesa3 = await prisma.mesa.findFirst({ where: { numero: 3 } });
  const mesa6 = await prisma.mesa.findFirst({ where: { numero: 6 } });
  const clienteMaria = clientes.find((c) => c.email === 'maria.lopez@gmail.com') || clientes[0];
  const clienteCarlos = clientes.find((c) => c.email === 'carlos.perez@hotmail.com') || clientes[0];

  const reservasCount = await prisma.reserva.count();
  if (reservasCount === 0 && mesa3 && mesa6) {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    await prisma.reserva.create({
      data: {
        fecha: hoy,
        cantidad: 4,
        estado: 'CONFIRMADA',
        observacion: 'Cumpleaños familiar, mesa decorada',
        clienteId: clienteMaria.id,
        mesaId: mesa3.id,
      },
    });

    await prisma.reserva.create({
      data: {
        fecha: manana,
        cantidad: 2,
        estado: 'PENDIENTE',
        observacion: 'Cena de negocios',
        clienteId: clienteCarlos.id,
        mesaId: mesa6.id,
      },
    });
    console.log('✓ 2 reservas de prueba creadas.');
  }

  // 9. Pedidos y ventas de demostración iniciales (para poblar dashboard)
  const pedidosCount = await prisma.pedido.count();
  if (pedidosCount === 0) {
    const adminUser = usuarios[0];
    const allPlatos = await prisma.plato.findMany();
    const plato1 = allPlatos.find((p) => p.nombre === 'Pollo a la Broaster') || allPlatos[0];
    const plato2 = allPlatos.find((p) => p.nombre === 'Jugo Natural de Maracuyá (1L)') || allPlatos[1];
    const plato3 = allPlatos.find((p) => p.nombre === 'Hamburguesa Clásica') || allPlatos[0];

    // Pedido 1: Pagado con Venta
    const pedido1 = await prisma.pedido.create({
      data: {
        estado: 'ENTREGADO',
        observacion: 'Servido con salsas extra',
        usuarioId: adminUser.id,
        clienteId: clienteMaria.id,
        mesaId: 1,
        detalles: {
          create: [
            { platoId: plato1.id, cantidad: 2, precio: plato1.precio },
            { platoId: plato2.id, cantidad: 1, precio: plato2.precio },
          ],
        },
      },
      include: { detalles: true },
    });

    const total1 = Number(plato1.precio) * 2 + Number(plato2.precio) * 1;
    await prisma.venta.create({
      data: {
        total: total1,
        metodoPago: 'QR',
        estado: 'PAGADA',
        pedidoId: pedido1.id,
        clienteId: clienteMaria.id,
        usuarioId: adminUser.id,
      },
    });

    // Pedido 2: En preparación en Mesa 2
    const mesa2 = await prisma.mesa.findFirst({ where: { numero: 2 } });
    if (mesa2) {
      await prisma.mesa.update({
        where: { id: mesa2.id },
        data: { estado: 'OCUPADA' },
      });
    }

    await prisma.pedido.create({
      data: {
        estado: 'EN_PREPARACION',
        observacion: 'Sin cebolla en la hamburguesa',
        usuarioId: adminUser.id,
        clienteId: clienteCarlos.id,
        mesaId: 2,
        detalles: {
          create: [
            { platoId: plato3.id, cantidad: 2, precio: plato3.precio },
          ],
        },
      },
    });

    console.log('✓ Pedidos y ventas demostrativos iniciales creados.');
  }

  console.log('Seed completado exitosamente.');
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
