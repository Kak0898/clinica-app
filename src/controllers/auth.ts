import { Request, Response, NextFunction } from 'express'
import * as service from '../services/auth'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.login(req.body))
  } catch (err) { next(err) }
}

export async function crearAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, email, password } = req.body
    const admin = await service.crearAdmin(nombre, email, password)
    res.status(201).json(admin)
  } catch (err) { next(err) }
}

export async function listarAdmins(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.listarAdmins())
  } catch (err) { next(err) }
}

export async function desactivarAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    await service.desactivarAdmin(Number(req.params.id))
    res.status(204).send()
  } catch (err) { next(err) }
}