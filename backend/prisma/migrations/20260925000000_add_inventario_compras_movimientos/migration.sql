-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TipoMovimientoInventario" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "inventario" ADD COLUMN IF NOT EXISTS "precioVenta" DECIMAL(10,2);
ALTER TABLE "inventario" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "inventario" ADD COLUMN IF NOT EXISTS "categoriaId" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "compras" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "proveedorId" INTEGER,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "detalles_compra" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER NOT NULL,
    "inventarioId" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalles_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "inventarioId" INTEGER NOT NULL,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "stockAnterior" DECIMAL(10,2) NOT NULL,
    "stockPosterior" DECIMAL(10,2) NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,
    "compraId" INTEGER,
    "pedidoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventario_categoriaId_idx" ON "inventario"("categoriaId");
CREATE INDEX IF NOT EXISTS "compras_proveedorId_idx" ON "compras"("proveedorId");
CREATE INDEX IF NOT EXISTS "compras_usuarioId_idx" ON "compras"("usuarioId");
CREATE INDEX IF NOT EXISTS "compras_fecha_idx" ON "compras"("fecha");
CREATE INDEX IF NOT EXISTS "detalles_compra_compraId_idx" ON "detalles_compra"("compraId");
CREATE INDEX IF NOT EXISTS "detalles_compra_inventarioId_idx" ON "detalles_compra"("inventarioId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_inventarioId_idx" ON "movimientos_inventario"("inventarioId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_usuarioId_idx" ON "movimientos_inventario"("usuarioId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_compraId_idx" ON "movimientos_inventario"("compraId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_pedidoId_idx" ON "movimientos_inventario"("pedidoId");
CREATE INDEX IF NOT EXISTS "movimientos_inventario_fecha_idx" ON "movimientos_inventario"("fecha");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "inventario" ADD CONSTRAINT "inventario_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "compras" ADD CONSTRAINT "compras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "detalles_compra" ADD CONSTRAINT "detalles_compra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "detalles_compra" ADD CONSTRAINT "detalles_compra_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
