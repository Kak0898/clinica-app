import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errores = err.issues.map(e => ({
          campo:   e.path.map(p => String(p)).join('.'),
          mensaje: e.message,
        }))
        return res.status(400).json({ error: 'Datos inválidos', errores })
      }
      next(err)
    }
  }
}