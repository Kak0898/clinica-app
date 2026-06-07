import { Request, Response, NextFunction } from 'express'
import * as service from '../services/especialidades'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const soloActivas = req.query.todas !== 'true'
    const data = await service.listarEspecialidades(soloActivas)
    res.json(data)
  } catch (err) { next(err) }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.obtenerEspecialidad(Number(req.params.id))
    res.json(data)
  } catch (err) { next(err) }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.crearEspecialidad(req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.actualizarEspecialidad(Number(req.params.id), req.body)
    res.json(data)
  } catch (err) { next(err) }
}

export async function desactivar(req: Request, res: Response, next: NextFunction) {
  try {
    await service.desactivarEspecialidad(Number(req.params.id))
    res.status(204).send()
  } catch (err) { next(err) }
}
