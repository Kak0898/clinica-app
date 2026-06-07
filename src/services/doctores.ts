import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { CrearDoctorDTO, ActualizarDoctorDTO, CrearHorarioDTO } from '../schemas/doctores'

export async function listarDoctores(especialidadId?: number) {
  return prisma.doctor.findMany({
    where: {
      activo: true,
      ...(especialidadId ? { especialidadId } : {}),
    },
    include: { especialidad: true },
    orderBy: { apellido: 'asc' },
  })
}

export async function obtenerDoctor(id: number) {
  const doc = await prisma.doctor.findUnique({
    where:   { id },
    include: { especialidad: true, horarios: true },
  })
  if (!doc) throw new AppError('Doctor no encontrado', 404)
  return doc
}

export async function crearDoctor(data: CrearDoctorDTO) {
  // Verificar que la especialidad existe
  const esp = await prisma.especialidad.findUnique({ where: { id: data.especialidadId } })
  if (!esp) throw new AppError('Especialidad no encontrada', 404)
  return prisma.doctor.create({ data, include: { especialidad: true } })
}

export async function actualizarDoctor(id: number, data: ActualizarDoctorDTO) {
  await obtenerDoctor(id)
  return prisma.doctor.update({
    where:   { id },
    data,
    include: { especialidad: true },
  })
}

export async function desactivarDoctor(id: number) {
  await obtenerDoctor(id)
  return prisma.doctor.update({ where: { id }, data: { activo: false } })
}

// ── Horarios ──────────────────────────────────────────────

export async function crearHorario(doctorId: number, data: CrearHorarioDTO) {
  await obtenerDoctor(doctorId)
  return prisma.horarioDoctor.create({ data: { ...data, doctorId } })
}

// ── Slots disponibles ─────────────────────────────────────
// Dado un doctorId y una fecha, devuelve los slots del horario
// del doctor ese día de semana, minus los ya ocupados por citas.

export async function obtenerSlots(doctorId: number, fechaStr: string) {
  await obtenerDoctor(doctorId)

  const fecha   = new Date(fechaStr + 'T00:00:00')  // evitar timezone issues
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay() // 1=Lun...7=Dom (usamos 1-5)

  // Buscar horario del doctor ese día
  const horario = await prisma.horarioDoctor.findUnique({
    where: { doctorId_diaSemana: { doctorId, diaSemana } },
  })

  if (!horario || !horario.activo) {
    return { fecha: fechaStr, slots: [] }
  }

  // Generar todos los slots del rango
  const todos = generarSlots(horario.horaInicio, horario.horaFin, horario.intervaloMinutos)

  // Buscar citas ya tomadas ese día
  const citasTomadas = await prisma.cita.findMany({
    where: {
      doctorId,
      fecha:  fecha,
      estado: { not: 'CANCELADA' },
    },
    select: { hora: true },
  })

  const horasTomadas = new Set(citasTomadas.map((c: { hora: string }) => c.hora))

  const slots = todos.map(hora => ({
    hora,
    disponible: !horasTomadas.has(hora),
  }))

  return { fecha: fechaStr, slots }
}

// Genera array de horas ["09:00", "09:30", ...] dado un rango
function generarSlots(inicio: string, fin: string, intervalo: number): string[] {
  const slots: string[] = []
  let [h, m] = inicio.split(':').map(Number)
  const [hFin, mFin] = fin.split(':').map(Number)
  const finMinutos = hFin * 60 + mFin

  while (h * 60 + m < finMinutos) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += intervalo
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60 }
  }

  return slots
}
