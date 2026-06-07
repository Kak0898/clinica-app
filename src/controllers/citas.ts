import { Request, Response, NextFunction } from 'express'
import * as service from '../services/citas'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const { doctorId, fecha, estado } = req.query
    res.json(await service.listarCitas({
      doctorId: doctorId ? Number(doctorId) : undefined,
      fecha:    fecha    as string | undefined,
      estado:   estado   as string | undefined,
    }))
  } catch (err) { next(err) }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.obtenerCita(Number(req.params.id)))
  } catch (err) { next(err) }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.crearCita(req.body))
  } catch (err) { next(err) }
}

export async function cancelar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.cancelarCita(Number(req.params.id)))
  } catch (err) { next(err) }
}
