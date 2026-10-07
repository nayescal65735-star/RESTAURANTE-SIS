const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{5,20}$/;

// Helper para validar datos de cliente
function ejecutarValidacionCliente(cliente) {
  const errors = [];

  if (!cliente.nombre || !cliente.nombre.trim()) {
    errors.push('El nombre del cliente es obligatorio.');
  } else if (cliente.nombre.trim().length < 2) {
    errors.push('El nombre del cliente debe tener al menos 2 caracteres.');
  }

  if (cliente.email && cliente.email.trim()) {
    if (!EMAIL_REGEX.test(cliente.email.trim())) {
      errors.push('El correo electrónico no tiene un formato válido (ejemplo: usuario@correo.com).');
    }
  }

  if (cliente.telefono && cliente.telefono.trim()) {
    const tel = cliente.telefono.trim();
    if (tel.length < 5) {
      errors.push('El número de teléfono debe tener al menos 5 dígitos.');
    } else if (!PHONE_REGEX.test(tel)) {
      errors.push('El número de teléfono contiene caracteres no permitidos.');
    }
  }

  return {
    esValido: errors.length === 0,
    errors,
  };
}

// GET /api/clientes (con búsqueda opcional ?q=, ?activo=, ?validado=)
router.get('/', async (req, res, next) => {
  try {
    const { q, activo, validado } = req.query;
    const where = {};

    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { telefono: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (activo !== undefined && activo !== 'all') {
      where.activo = activo === 'true' || activo === true;
    }

    if (validado !== undefined && validado !== 'all') {
      where.validado = validado === 'true' || validado === true;
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    res.json({ success: true, data: clientes, count: clientes.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        reservas: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        ventas: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
});

// POST /api/clientes - Registrar nuevo cliente (interno o desde pedidos/reservas)
router.post('/', async (req, res, next) => {
  try {
    const { nombre, telefono, email, activo } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre del cliente es obligatorio' });
    }

    const nombreLimpio = nombre.trim();
    const telefonoLimpio = telefono ? telefono.trim() : null;
    const emailLimpio = email && email.trim() ? email.trim().toLowerCase() : null;

    if (emailLimpio && !EMAIL_REGEX.test(emailLimpio)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del correo electrónico es inválido (ejemplo: usuario@correo.com)',
      });
    }

    if (telefonoLimpio && telefonoLimpio.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'El número de teléfono debe tener al menos 5 dígitos',
      });
    }

    // Validar si el email ya existe
    if (emailLimpio) {
      const emailExistente = await prisma.cliente.findFirst({
        where: { email: { equals: emailLimpio, mode: 'insensitive' } },
      });
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: `Ya existe un cliente registrado con el correo "${emailLimpio}" (${emailExistente.nombre})`,
        });
      }
    }

    const nuevo = await prisma.cliente.create({
      data: {
        nombre: nombreLimpio,
        telefono: telefonoLimpio,
        email: emailLimpio,
        activo: activo !== undefined ? Boolean(activo) : true,
        validado: false,
      },
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    res.status(201).json({ success: true, data: nuevo, message: 'Cliente registrado correctamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/clientes/:id - Actualizar datos del cliente (nombre, teléfono, email, activo, validado)
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
    }

    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    const { nombre, telefono, email, activo, validado } = req.body;
    const dataToUpdate = {};

    if (nombre !== undefined) {
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ success: false, error: 'El nombre del cliente no puede estar vacío' });
      }
      dataToUpdate.nombre = nombre.trim();
    }

    if (telefono !== undefined) {
      const telefonoLimpio = telefono ? telefono.trim() : null;
      if (telefonoLimpio && telefonoLimpio.length < 5) {
        return res.status(400).json({
          success: false,
          error: 'El número de teléfono debe tener al menos 5 dígitos',
        });
      }
      dataToUpdate.telefono = telefonoLimpio;
    }

    if (email !== undefined) {
      const emailLimpio = email && email.trim() ? email.trim().toLowerCase() : null;
      if (emailLimpio) {
        if (!EMAIL_REGEX.test(emailLimpio)) {
          return res.status(400).json({
            success: false,
            error: 'El formato del correo electrónico es inválido (ejemplo: usuario@correo.com)',
          });
        }

        // Validar que otro cliente no tenga este email
        const emailDuplicado = await prisma.cliente.findFirst({
          where: {
            id: { not: id },
            email: { equals: emailLimpio, mode: 'insensitive' },
          },
        });

        if (emailDuplicado) {
          return res.status(400).json({
            success: false,
            error: `El correo "${emailLimpio}" ya pertenece a otro cliente registrado (${emailDuplicado.nombre})`,
          });
        }
      }
      dataToUpdate.email = emailLimpio;
    }

    if (activo !== undefined) {
      dataToUpdate.activo = Boolean(activo);
    }

    if (validado !== undefined) {
      dataToUpdate.validado = Boolean(validado);
    }

    const updated = await prisma.cliente.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    res.json({ success: true, data: updated, message: 'Cliente actualizado correctamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/clientes/:id/toggle - Activar o Desactivar cliente
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    const nuevoEstado = !cliente.activo;

    const updated = await prisma.cliente.update({
      where: { id },
      data: { activo: nuevoEstado },
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    res.json({
      success: true,
      data: updated,
      message: nuevoEstado
        ? `Cliente "${updated.nombre}" activado exitosamente`
        : `Cliente "${updated.nombre}" desactivado exitosamente`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/clientes/:id/validar - Ejecutar validación de datos del cliente
router.post('/:id/validar', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    const { esValido, errors } = ejecutarValidacionCliente(cliente);

    const updated = await prisma.cliente.update({
      where: { id },
      data: { validado: esValido },
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    if (esValido) {
      res.json({
        success: true,
        validado: true,
        data: updated,
        message: `El cliente "${updated.nombre}" cumple satisfactoriamente con todos los datos requeridos.`,
      });
    } else {
      res.json({
        success: true,
        validado: false,
        errors,
        data: updated,
        message: `Observaciones en cliente "${updated.nombre}": ${errors.join(' ')}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clientes/:id - Eliminación segura preservando integridad histórica
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cliente inválido' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pedidos: true, reservas: true, ventas: true },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    }

    const totalHistorial = (cliente._count?.pedidos || 0) + (cliente._count?.reservas || 0) + (cliente._count?.ventas || 0);

    if (totalHistorial > 0) {
      return res.status(400).json({
        success: false,
        error: `No es posible eliminar al cliente "${cliente.nombre}" porque cuenta con historial asociado (${cliente._count?.pedidos || 0} pedidos, ${cliente._count?.reservas || 0} reservas, ${cliente._count?.ventas || 0} ventas). Para proteger la integridad de los registros contables e históricos, puedes desactivarlo en su lugar.`,
        canDeactivate: true,
      });
    }

    await prisma.cliente.delete({ where: { id } });
    res.json({ success: true, message: `Cliente "${cliente.nombre}" eliminado permanentemente` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
