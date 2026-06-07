import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { LoginDTO } from '../schemas/auth'

export async function login(data: LoginDTO) {
  const admin = await prisma.admin.findUnique({
    where: { email: data.email },
  })

  if (!admin || !admin.activo)
    throw new AppError('Credenciales inválidas', 401)

  const passwordOk = await bcrypt.compare(data.password, admin.password)
  if (!passwordOk)
    throw new AppError('Credenciales inválidas', 401)

  const token = jwt.sign(
    { id: admin.id, email: admin.email, nombre: admin.nombre },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' } as any
  )

  return {
    token,
    admin: { id: admin.id, nombre: admin.nombre, email: admin.email },
  }
}

export async function crearAdmin(nombre: string, email: string, password: string) {
  const hash = await bcrypt.hash(password, 10)
  return prisma.admin.create({
    data: { nombre, email, password: hash },
    select: { id: true, nombre: true, email: true, createdAt: true },
  })
}

export async function listarAdmins() {
  return prisma.admin.findMany({
    where:   { activo: true },
    select:  { id: true, nombre: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function desactivarAdmin(id: number) {
  const admin = await prisma.admin.findUnique({ where: { id } })
  if (!admin)        throw new AppError('Admin no encontrado', 404)
  if (!admin.activo) throw new AppError('Admin ya está desactivado', 400)
  return prisma.admin.update({
    where:  { id },
    data:   { activo: false },
    select: { id: true, nombre: true, email: true },
  })
}