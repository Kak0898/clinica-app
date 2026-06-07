import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AdminPayload {
  id:     number
  email:  string
  nombre: string
}

// Extiende Request para tener req.admin disponible
declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' })

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}