import { Request, Response, NextFunction } from 'express'
import * as service from '../services/doctores'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const especialidadId = req.query.especialidadId ? Number(req.query.especialidadId) : undefined
    res.json(await service.listarDoctores(especialidadId))
  } catch (err) { next(err) }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.obtenerDoctor(Number(req.params.id)))
  } catch (err) { next(err) }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.crearDoctor(req.body))
  } catch (err) { next(err) }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.actualizarDoctor(Number(req.params.id), req.body))
  } catch (err) { next(err) }
}

export async function desactivar(req: Request, res: Response, next: NextFunction) {
  try {
    await service.desactivarDoctor(Number(req.params.id))
    res.status(204).send()
  } catch (err) { next(err) }
}

export async function obtenerSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { fecha } = req.query
    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({ error: 'Parámetro fecha requerido (YYYY-MM-DD)' })
    }
    res.json(await service.obtenerSlots(Number(id), fecha))
  } catch (err) { next(err) }
}

export async function crearHorario(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.crearHorario(Number(req.params.id), req.body))
  } catch (err) { next(err) }
}
