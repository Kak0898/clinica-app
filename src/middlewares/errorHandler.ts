import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Error controlado (lanzado con AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Error de Prisma: registro duplicado
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un registro con ese valor único' })
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' })
    }
  }

  // Error genérico — no exponer detalles en producción
  console.error('❌ Error no controlado:', err)
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  return res.status(500).json({ error: message })
}
