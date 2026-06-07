import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { CrearCitaDTO } from '../schemas/citas'
import { obtenerSlots } from './doctores'

function generarCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin caracteres ambiguos
  let code = 'CL-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function listarCitas(filtros?: { doctorId?: number; fecha?: string; estado?: string }) {
  return prisma.cita.findMany({
    where: {
      ...(filtros?.doctorId ? { doctorId: filtros.doctorId }          : {}),
      ...(filtros?.estado   ? { estado: filtros.estado as any }       : {}),
      ...(filtros?.fecha    ? { fecha: new Date(filtros.fecha + 'T00:00:00') } : {}),
    },
    include: { doctor: true, especialidad: true },
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
  })
}

export async function obtenerCita(id: number) {
  const cita = await prisma.cita.findUnique({
    where:   { id },
    include: { doctor: true, especialidad: true },
  })
  if (!cita) throw new AppError('Cita no encontrada', 404)
  return cita
}

export async function crearCita(data: CrearCitaDTO) {
  const { doctorId, especialidadId, fecha, hora, ...paciente } = data

  // Verificar que el slot esté disponible
  const { slots } = await obtenerSlots(doctorId, fecha)
  const slot = slots.find(s => s.hora === hora)

  if (!slot)              throw new AppError('El horario no existe para ese doctor ese día', 400)
  if (!slot.disponible)   throw new AppError('El horario seleccionado ya está reservado', 409)

  // Generar código único (reintentar si colisiona)
  let codigoConfirmacion = ''
  let intentos = 0
  while (intentos < 5) {
    const candidato = generarCodigo()
    const existe = await prisma.cita.findUnique({ where: { codigoConfirmacion: candidato } })
    if (!existe) { codigoConfirmacion = candidato; break }
    intentos++
  }
  if (!codigoConfirmacion) throw new AppError('Error generando código, intenta de nuevo', 500)

  return prisma.cita.create({
    data: {
      doctorId,
      especialidadId,
      fecha: new Date(fecha + 'T00:00:00'),
      hora,
      codigoConfirmacion,
      ...paciente,
    },
    include: { doctor: true, especialidad: true },
  })
}

export async function cancelarCita(id: number) {
  const cita = await obtenerCita(id)
  if (cita.estado === 'CANCELADA')   throw new AppError('La cita ya está cancelada', 400)
  if (cita.estado === 'COMPLETADA')  throw new AppError('No se puede cancelar una cita completada', 400)
  return prisma.cita.update({
    where: { id },
    data:  { estado: 'CANCELADA' },
  })
}
