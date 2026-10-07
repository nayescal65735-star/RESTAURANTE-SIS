const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { verifyToken } = require('../utils/auth');

// Helper para obtener el usuario responsable de la operación
async function resolveUsuarioId(req, explicitUserId) {
  if (explicitUserId) {
    const parsed = parseInt(explicitUserId, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Intentar obtener desde header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      return decoded.id;
    }
  }

  // Fallback: primer usuario activo existente en el sistema
  const defaultUser = await prisma.usuario.findFirst({ where: { activo: true }, select: { id: true } });
  return defaultUser ? defaultUser.id : null;
}

const itemInclude = {
  proveedor: {
    select: { id: true, nombre: true, telefono: true, contacto: true, email: true },
  },
  categoria: {
    select: { id: true, nombre: true },
  },
};

// =========================================================================
// 1. GET /api/inventario - Listar todos los productos/insumos de inventario
// =========================================================================
router.get('/', async (req, res, next) => {
  try {
    const { bajoStock, categoriaId, proveedorId, activo, q } = req.query;

    const where = {};

    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId, 10);
    }
    if (proveedorId) {
      where.proveedorId = parseInt(proveedorId, 10);
    }
    if (activo !== undefined && activo !== 'all') {
      where.activo = activo === 'true' || activo === true;
    }
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }

    const inventario = await prisma.inventario.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: itemInclude,
    });

    let data = inventario.map((item) => {
      const stockNum = Number(item.stock);
      const stockMinNum = Number(item.stockMinimo);
      const precioCompraNum = Number(item.precioCompra);
      return {
        ...item,
        stock: stockNum,
        stockMinimo: stockMinNum,
        precioCompra: precioCompraNum,
        precioVenta: item.precioVenta ? Number(item.precioVenta) : null,
        alertaBajoStock: stockNum <= stockMinNum,
        valorInventario: Number((stockNum * precioCompraNum).toFixed(2)),
      };
    });

    if (bajoStock === 'true') {
      data = data.filter((item) => item.alertaBajoStock);
    }

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. GET /api/inventario/stock-bajo - Productos con stock actual <= mínimo
// =========================================================================
router.get('/stock-bajo', async (req, res, next) => {
  try {
    const inventario = await prisma.inventario.findMany({
      where: { activo: true },
      orderBy: { stock: 'asc' },
      include: itemInclude,
    });

    const lowStockItems = inventario
      .map((item) => {
        const stockNum = Number(item.stock);
        const stockMinNum = Number(item.stockMinimo);
        return {
          ...item,
          stock: stockNum,
          stockMinimo: stockMinNum,
          precioCompra: Number(item.precioCompra),
          precioVenta: item.precioVenta ? Number(item.precioVenta) : null,
          alertaBajoStock: stockNum <= stockMinNum,
          deficit: Number((stockMinNum - stockNum).toFixed(2)),
        };
      })
      .filter((item) => item.alertaBajoStock);

    res.json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 3. GET /api/inventario/resumen - Métricas consolidadas del módulo
// =========================================================================
router.get('/resumen', async (req, res, next) => {
  try {
    const [items, totalMovimientos, totalCompras, comprasList] = await Promise.all([
      prisma.inventario.findMany({
        where: { activo: true },
        select: { stock: true, stockMinimo: true, precioCompra: true },
      }),
      prisma.movimientoInventario.count(),
      prisma.compra.count(),
      prisma.compra.findMany({ select: { total: true } }),
    ]);

    let totalItems = items.length;
    let itemsBajoStock = 0;
    let valorTotalInventario = 0;

    for (const item of items) {
      const stock = Number(item.stock);
      const stockMin = Number(item.stockMinimo);
      const precio = Number(item.precioCompra);
      if (stock <= stockMin) {
        itemsBajoStock++;
      }
      valorTotalInventario += stock * precio;
    }

    const totalGastadoCompras = comprasList.reduce((acc, c) => acc + Number(c.total), 0);

    res.json({
      success: true,
      data: {
        totalItems,
        itemsBajoStock,
        valorTotalInventario: Number(valorTotalInventario.toFixed(2)),
        totalMovimientos,
        totalCompras,
        totalGastadoCompras: Number(totalGastadoCompras.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 4. GET /api/inventario/movimientos - Historial general de movimientos
// =========================================================================
router.get('/movimientos', async (req, res, next) => {
  try {
    const { inventarioId, tipo, limit } = req.query;
    const where = {};

    if (inventarioId) {
      where.inventarioId = parseInt(inventarioId, 10);
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const take = limit ? parseInt(limit, 10) : 100;

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take,
      include: {
        inventario: {
          select: { id: true, nombre: true, unidad: true, categoria: { select: { nombre: true } } },
        },
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        compra: {
          select: { id: true, total: true, proveedor: { select: { id: true, nombre: true } } },
        },
        pedido: {
          select: { id: true, mesa: { select: { numero: true } } },
        },
      },
    });

    res.json({ success: true, data: movimientos });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 5. GET /api/inventario/compras - Listar compras registradas
// =========================================================================
router.get('/compras', async (req, res, next) => {
  try {
    const { proveedorId, limit } = req.query;
    const where = {};

    if (proveedorId) {
      where.proveedorId = parseInt(proveedorId, 10);
    }

    const take = limit ? parseInt(limit, 10) : 50;

    const compras = await prisma.compra.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take,
      include: {
        proveedor: {
          select: { id: true, nombre: true, contacto: true, telefono: true },
        },
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        detalles: {
          include: {
            inventario: {
              select: { id: true, nombre: true, unidad: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: compras });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 6. GET /api/inventario/compras/:id - Detalle de una compra específica
// =========================================================================
router.get('/compras/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const compra = await prisma.compra.findUnique({
      where: { id },
      include: {
        proveedor: true,
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        detalles: {
          include: {
            inventario: {
              select: { id: true, nombre: true, unidad: true, stock: true },
            },
          },
        },
        movimientos: true,
      },
    });

    if (!compra) {
      return res.status(404).json({ success: false, error: 'Registro de compra no encontrado' });
    }

    res.json({ success: true, data: compra });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 7. POST /api/inventario/compras - REGISTRO TRANSACCIONAL DE COMPRA
// =========================================================================
router.post('/compras', async (req, res, next) => {
  try {
    const { proveedorId, observacion, usuarioId, fecha, items, productos, detalles } = req.body;

    const rawItems = items || productos || detalles;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debe incluir al menos un producto en la compra',
      });
    }

    // Validar productos y cantidades
    const parsedItems = [];
    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const invId = parseInt(item.inventarioId || item.id, 10);
      const cant = parseFloat(item.cantidad);
      const precio = parseFloat(item.precioUnitario !== undefined ? item.precioUnitario : item.precio);

      if (isNaN(invId) || invId <= 0) {
        return res.status(400).json({
          success: false,
          error: `Ítem #${i + 1}: Producto de inventario inválido`,
        });
      }
      if (isNaN(cant) || cant <= 0) {
        return res.status(400).json({
          success: false,
          error: `Ítem #${i + 1}: La cantidad debe ser un número mayor a 0`,
        });
      }
      if (isNaN(precio) || precio < 0) {
        return res.status(400).json({
          success: false,
          error: `Ítem #${i + 1}: El precio unitario debe ser igual o mayor a 0`,
        });
      }

      parsedItems.push({
        inventarioId: invId,
        cantidad: cant,
        precioUnitario: precio,
        subtotal: Number((cant * precio).toFixed(2)),
      });
    }

    const finalUsuarioId = await resolveUsuarioId(req, usuarioId);
    const parsedProveedorId = proveedorId ? parseInt(proveedorId, 10) : null;
    const compraFecha = fecha ? new Date(fecha) : new Date();

    // Total acumulado
    const totalCompra = parsedItems.reduce((acc, it) => acc + it.subtotal, 0);

    // Transacción atómica completa con Prisma
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro de Compra
      const nuevaCompra = await tx.compra.create({
        data: {
          fecha: compraFecha,
          observacion: observacion ? observacion.trim() : null,
          total: totalCompra,
          proveedorId: parsedProveedorId,
          usuarioId: finalUsuarioId,
        },
      });

      // 2. Procesar cada detalle, actualizar stock y crear movimientos
      const detallesCreados = [];
      const movimientosCreados = [];

      for (const item of parsedItems) {
        // Obtener estado actual del producto en inventario
        const invDb = await tx.inventario.findUnique({
          where: { id: item.inventarioId },
        });

        if (!invDb) {
          throw new Error(`El producto con ID #${item.inventarioId} no existe en el inventario`);
        }

        const stockAnterior = Number(invDb.stock);
        const stockPosterior = Number((stockAnterior + item.cantidad).toFixed(2));

        // a) Crear detalle de compra
        const detalle = await tx.detalleCompra.create({
          data: {
            compraId: nuevaCompra.id,
            inventarioId: item.inventarioId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          },
        });
        detallesCreados.push(detalle);

        // b) Actualizar stock y último precio de compra del producto
        const updateData = {
          stock: stockPosterior,
          precioCompra: item.precioUnitario > 0 ? item.precioUnitario : invDb.precioCompra,
        };
        // Si no tenía proveedor y la compra tiene uno, vincularlo
        if (!invDb.proveedorId && parsedProveedorId) {
          updateData.proveedorId = parsedProveedorId;
        }

        await tx.inventario.update({
          where: { id: item.inventarioId },
          data: updateData,
        });

        // c) Crear movimiento de inventario ENTRADA
        const motivoMov = observacion
          ? `Compra #${nuevaCompra.id}: ${observacion.trim()}`
          : `Reposición / Compra #${nuevaCompra.id}`;

        const movimiento = await tx.movimientoInventario.create({
          data: {
            inventarioId: item.inventarioId,
            tipo: 'ENTRADA',
            cantidad: item.cantidad,
            stockAnterior: stockAnterior,
            stockPosterior: stockPosterior,
            motivo: motivoMov,
            fecha: compraFecha,
            usuarioId: finalUsuarioId,
            compraId: nuevaCompra.id,
          },
        });
        movimientosCreados.push(movimiento);
      }

      // Retornar compra con relaciones
      return tx.compra.findUnique({
        where: { id: nuevaCompra.id },
        include: {
          proveedor: true,
          usuario: { select: { id: true, nombre: true, email: true, rol: true } },
          detalles: {
            include: {
              inventario: { select: { id: true, nombre: true, unidad: true, stock: true } },
            },
          },
          movimientos: true,
        },
      });
    });

    res.status(201).json({
      success: true,
      data: resultado,
      message: `Compra #${resultado.id} registrada exitosamente. Stock de ${parsedItems.length} producto(s) actualizado.`,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 8. POST /api/inventario/entrada - Entrada manual de stock
// =========================================================================
router.post('/entrada', async (req, res, next) => {
  try {
    const { inventarioId, cantidad, motivo, usuarioId } = req.body;

    const parsedId = parseInt(inventarioId, 10);
    const parsedCant = parseFloat(cantidad);

    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({ success: false, error: 'ID de producto inválido' });
    }
    if (isNaN(parsedCant) || parsedCant <= 0) {
      return res.status(400).json({ success: false, error: 'La cantidad a ingresar debe ser mayor a 0' });
    }

    const finalUsuarioId = await resolveUsuarioId(req, usuarioId);

    const resultado = await prisma.$transaction(async (tx) => {
      const invDb = await tx.inventario.findUnique({
        where: { id: parsedId },
      });

      if (!invDb) {
        throw new Error('Producto de inventario no encontrado');
      }

      const stockAnterior = Number(invDb.stock);
      const stockPosterior = Number((stockAnterior + parsedCant).toFixed(2));

      // Actualizar stock
      const updatedItem = await tx.inventario.update({
        where: { id: parsedId },
        data: { stock: stockPosterior },
        include: itemInclude,
      });

      // Crear movimiento
      const movimiento = await tx.movimientoInventario.create({
        data: {
          inventarioId: parsedId,
          tipo: 'ENTRADA',
          cantidad: parsedCant,
          stockAnterior,
          stockPosterior,
          motivo: motivo ? motivo.trim() : 'Entrada manual de stock',
          fecha: new Date(),
          usuarioId: finalUsuarioId,
        },
      });

      return { item: updatedItem, movimiento };
    });

    res.json({
      success: true,
      data: resultado.item,
      movimiento: resultado.movimiento,
      message: `Entrada de ${parsedCant} ${resultado.item.unidad} registrada correctamente. Nuevo stock: ${resultado.item.stock}`,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 9. POST /api/inventario/salida - Salida manual / merma de stock
// =========================================================================
router.post('/salida', async (req, res, next) => {
  try {
    const { inventarioId, cantidad, motivo, usuarioId } = req.body;

    const parsedId = parseInt(inventarioId, 10);
    const parsedCant = parseFloat(cantidad);

    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({ success: false, error: 'ID de producto inválido' });
    }
    if (isNaN(parsedCant) || parsedCant <= 0) {
      return res.status(400).json({ success: false, error: 'La cantidad a retirar debe ser mayor a 0' });
    }

    const finalUsuarioId = await resolveUsuarioId(req, usuarioId);

    const resultado = await prisma.$transaction(async (tx) => {
      const invDb = await tx.inventario.findUnique({
        where: { id: parsedId },
      });

      if (!invDb) {
        throw new Error('Producto de inventario no encontrado');
      }

      const stockAnterior = Number(invDb.stock);

      if (stockAnterior < parsedCant) {
        throw new Error(
          `Stock insuficiente para "${invDb.nombre}". Stock disponible: ${stockAnterior} ${invDb.unidad}, cantidad solicitada: ${parsedCant} ${invDb.unidad}`
        );
      }

      const stockPosterior = Number((stockAnterior - parsedCant).toFixed(2));

      // Actualizar stock
      const updatedItem = await tx.inventario.update({
        where: { id: parsedId },
        data: { stock: stockPosterior },
        include: itemInclude,
      });

      // Crear movimiento
      const movimiento = await tx.movimientoInventario.create({
        data: {
          inventarioId: parsedId,
          tipo: 'SALIDA',
          cantidad: parsedCant,
          stockAnterior,
          stockPosterior,
          motivo: motivo ? motivo.trim() : 'Salida manual / consumo de stock',
          fecha: new Date(),
          usuarioId: finalUsuarioId,
        },
      });

      return { item: updatedItem, movimiento };
    });

    res.json({
      success: true,
      data: resultado.item,
      movimiento: resultado.movimiento,
      message: `Salida de ${parsedCant} ${resultado.item.unidad} registrada. Nuevo stock: ${resultado.item.stock}`,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 10. POST /api/inventario/ajuste - Ajuste / corrección física de stock
// =========================================================================
router.post('/ajuste', async (req, res, next) => {
  try {
    const { inventarioId, nuevoStock, motivo, usuarioId } = req.body;

    const parsedId = parseInt(inventarioId, 10);
    const parsedNuevoStock = parseFloat(nuevoStock);

    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({ success: false, error: 'ID de producto inválido' });
    }
    if (isNaN(parsedNuevoStock) || parsedNuevoStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'El nuevo stock debe ser un número igual o mayor a 0',
      });
    }
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Debe ingresar un motivo u observación para justificar el ajuste de stock',
      });
    }

    const finalUsuarioId = await resolveUsuarioId(req, usuarioId);

    const resultado = await prisma.$transaction(async (tx) => {
      const invDb = await tx.inventario.findUnique({
        where: { id: parsedId },
      });

      if (!invDb) {
        throw new Error('Producto de inventario no encontrado');
      }

      const stockAnterior = Number(invDb.stock);
      const stockPosterior = Number(parsedNuevoStock.toFixed(2));
      const diferencia = Number((stockPosterior - stockAnterior).toFixed(2));

      // Actualizar stock
      const updatedItem = await tx.inventario.update({
        where: { id: parsedId },
        data: { stock: stockPosterior },
        include: itemInclude,
      });

      // Crear movimiento de tipo AJUSTE
      const diffSign = diferencia >= 0 ? `+${diferencia}` : `${diferencia}`;
      const motivoFinal = `${motivo.trim()} (${diffSign} ${invDb.unidad})`;

      const movimiento = await tx.movimientoInventario.create({
        data: {
          inventarioId: parsedId,
          tipo: 'AJUSTE',
          cantidad: Math.abs(diferencia),
          stockAnterior,
          stockPosterior,
          motivo: motivoFinal,
          fecha: new Date(),
          usuarioId: finalUsuarioId,
        },
      });

      return { item: updatedItem, movimiento };
    });

    res.json({
      success: true,
      data: resultado.item,
      movimiento: resultado.movimiento,
      message: `Stock de "${resultado.item.nombre}" ajustado a ${resultado.item.stock} ${resultado.item.unidad}`,
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 11. GET /api/inventario/:id - Obtener un producto por ID con historial
// =========================================================================
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    const item = await prisma.inventario.findUnique({
      where: { id },
      include: {
        ...itemInclude,
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 20,
          include: {
            usuario: { select: { id: true, nombre: true, rol: true } },
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Producto de inventario no encontrado' });
    }

    const stockNum = Number(item.stock);
    const stockMinNum = Number(item.stockMinimo);

    res.json({
      success: true,
      data: {
        ...item,
        stock: stockNum,
        stockMinimo: stockMinNum,
        precioCompra: Number(item.precioCompra),
        precioVenta: item.precioVenta ? Number(item.precioVenta) : null,
        alertaBajoStock: stockNum <= stockMinNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 12. GET /api/inventario/:id/movimientos - Movimientos de un producto
// =========================================================================
router.get('/:id/movimientos', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where: { inventarioId: id },
      orderBy: { fecha: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, email: true, rol: true } },
        compra: { select: { id: true, total: true, proveedor: { select: { nombre: true } } } },
        pedido: { select: { id: true, mesa: { select: { numero: true } } } },
      },
    });

    res.json({ success: true, data: movimientos });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 13. POST /api/inventario - Crear nuevo producto de inventario
// =========================================================================
router.post('/', async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      unidad,
      stock,
      stockMinimo,
      precioCompra,
      precioVenta,
      proveedorId,
      categoriaId,
      activo,
      usuarioId,
    } = req.body;

    if (!nombre || !unidad || stock === undefined || stockMinimo === undefined || precioCompra === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, unidad, stock inicial, stock mínimo y precio de compra son obligatorios',
      });
    }

    const nombreNormalizado = nombre.trim();
    if (!nombreNormalizado) {
      return res.status(400).json({ success: false, error: 'El nombre del producto no puede estar vacío' });
    }

    // Validación de duplicados por nombre
    const existente = await prisma.inventario.findFirst({
      where: {
        nombre: {
          equals: nombreNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        error: `El producto "${existente.nombre}" ya existe en el inventario (ID #${existente.id}, Stock actual: ${existente.stock} ${existente.unidad}). Para añadir más unidades o reponer inventario, utiliza la opción "Registrar Compra / Reponer stock" en lugar de crear un producto duplicado.`,
      });
    }

    const initialStock = parseFloat(stock);
    const parsedStockMin = parseFloat(stockMinimo);
    const parsedPrecioCompra = parseFloat(precioCompra);

    if (isNaN(initialStock) || initialStock < 0) {
      return res.status(400).json({ success: false, error: 'El stock debe ser mayor o igual a 0' });
    }
    if (isNaN(parsedStockMin) || parsedStockMin < 0) {
      return res.status(400).json({ success: false, error: 'El stock mínimo debe ser mayor o igual a 0' });
    }
    if (isNaN(parsedPrecioCompra) || parsedPrecioCompra < 0) {
      return res.status(400).json({ success: false, error: 'El precio de compra debe ser mayor o igual a 0' });
    }

    const finalUsuarioId = await resolveUsuarioId(req, usuarioId);

    const nuevo = await prisma.$transaction(async (tx) => {
      const item = await tx.inventario.create({
        data: {
          nombre: nombreNormalizado,
          descripcion: descripcion ? descripcion.trim() : null,
          unidad: unidad.trim(),
          stock: initialStock,
          stockMinimo: parsedStockMin,
          precioCompra: parsedPrecioCompra,
          precioVenta: precioVenta !== undefined && precioVenta !== '' ? parseFloat(precioVenta) : null,
          proveedorId: proveedorId ? parseInt(proveedorId, 10) : null,
          categoriaId: categoriaId ? parseInt(categoriaId, 10) : null,
          activo: activo !== undefined ? Boolean(activo) : true,
        },
        include: itemInclude,
      });

      // Si se crea con stock inicial > 0, registrar movimiento de entrada inicial
      if (initialStock > 0) {
        await tx.movimientoInventario.create({
          data: {
            inventarioId: item.id,
            tipo: 'ENTRADA',
            cantidad: initialStock,
            stockAnterior: 0,
            stockPosterior: initialStock,
            motivo: 'Inventario inicial de apertura',
            fecha: new Date(),
            usuarioId: finalUsuarioId,
          },
        });
      }

      return item;
    });

    res.status(201).json({
      success: true,
      data: nuevo,
      message: 'Producto de inventario creado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 14. PATCH /api/inventario/:id - Actualizar datos del producto
// =========================================================================
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    const {
      nombre,
      descripcion,
      unidad,
      stockMinimo,
      precioCompra,
      precioVenta,
      proveedorId,
      categoriaId,
      activo,
    } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) {
      const nombreNormalizado = nombre.trim();
      if (!nombreNormalizado) {
        return res.status(400).json({ success: false, error: 'El nombre del producto no puede estar vacío' });
      }

      const duplicate = await prisma.inventario.findFirst({
        where: {
          id: { not: id },
          nombre: { equals: nombreNormalizado, mode: 'insensitive' },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: `Ya existe otro insumo registrado con el nombre "${duplicate.nombre}" (ID #${duplicate.id}).`,
        });
      }

      dataToUpdate.nombre = nombreNormalizado;
    }
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion ? descripcion.trim() : null;
    if (unidad !== undefined) dataToUpdate.unidad = unidad.trim();
    if (stockMinimo !== undefined) dataToUpdate.stockMinimo = parseFloat(stockMinimo);
    if (precioCompra !== undefined) dataToUpdate.precioCompra = parseFloat(precioCompra);
    if (precioVenta !== undefined) {
      dataToUpdate.precioVenta = precioVenta !== '' && precioVenta !== null ? parseFloat(precioVenta) : null;
    }
    if (proveedorId !== undefined) {
      dataToUpdate.proveedorId = proveedorId ? parseInt(proveedorId, 10) : null;
    }
    if (categoriaId !== undefined) {
      dataToUpdate.categoriaId = categoriaId ? parseInt(categoriaId, 10) : null;
    }
    if (activo !== undefined) {
      dataToUpdate.activo = Boolean(activo);
    }

    const updated = await prisma.inventario.update({
      where: { id },
      data: dataToUpdate,
      include: itemInclude,
    });

    res.json({ success: true, data: updated, message: 'Producto de inventario actualizado' });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 15. DELETE /api/inventario/:id - Eliminar o desactivar producto
// =========================================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    // Verificar si tiene movimientos o compras asociadas
    const [movCount, detCount] = await Promise.all([
      prisma.movimientoInventario.count({ where: { inventarioId: id } }),
      prisma.detalleCompra.count({ where: { inventarioId: id } }),
    ]);

    if (movCount > 0 || detCount > 0) {
      // Desactivación segura para preservar integridad histórica
      await prisma.inventario.update({
        where: { id },
        data: { activo: false },
      });
      return res.json({
        success: true,
        message: 'El producto cuenta con historial de movimientos y fue marcado como INACTIVO para proteger los datos históricos.',
      });
    }

    await prisma.inventario.delete({ where: { id } });
    res.json({ success: true, message: 'Producto eliminado del inventario' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
