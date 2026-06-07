import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { CrearEspecialidadDTO, ActualizarEspecialidadDTO } from '../schemas/especialidades'

export async function listarEspecialidades(soloActivas = true) {
  return prisma.especialidad.findMany({
    where:   soloActivas ? { activo: true } : {},
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { doctores: true } } },
  })
}

export async function obtenerEspecialidad(id: number) {
  const esp = await prisma.especialidad.findUnique({
    where:   { id },
    include: { doctores: { where: { activo: true } } },
  })
  if (!esp) throw new AppError('Especialidad no encontrada', 404)
  return esp
}

export async function crearEspecialidad(data: CrearEspecialidadDTO) {
  return prisma.especialidad.create({ data })
}

export async function actualizarEspecialidad(id: number, data: ActualizarEspecialidadDTO) {
  await obtenerEspecialidad(id) // lanza 404 si no existe
  return prisma.especialidad.update({ where: { id }, data })
}

export async function desactivarEspecialidad(id: number) {
  await obtenerEspecialidad(id)
  return prisma.especialidad.update({
    where: { id },
    data:  { activo: false },
  })
}
