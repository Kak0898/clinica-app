import { z } from 'zod'

export const crearDoctorSchema = z.object({
  nombre:          z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellido:        z.string().min(2, 'Mínimo 2 caracteres').max(100),
  avatarIniciales: z.string().length(2, 'Exactamente 2 caracteres').toUpperCase(),
  avatarColor:     z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
  avatarColorText: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
  especialidadId:  z.number().int().positive('ID de especialidad inválido'),
})

export const actualizarDoctorSchema = crearDoctorSchema.partial().extend({
  activo: z.boolean().optional(),
})

// Schema para HorarioDoctor
export const crearHorarioSchema = z.object({
  diaSemana:        z.number().int().min(1).max(5, 'Solo días hábiles (1=Lun a 5=Vie)'),
  horaInicio:       z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  horaFin:          z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  intervaloMinutos: z.number().int().min(15).max(60).default(30),
}).refine(data => data.horaInicio < data.horaFin, {
  message: 'horaInicio debe ser anterior a horaFin',
  path: ['horaInicio'],
})

export type CrearDoctorDTO      = z.infer<typeof crearDoctorSchema>
export type ActualizarDoctorDTO = z.infer<typeof actualizarDoctorSchema>
export type CrearHorarioDTO     = z.infer<typeof crearHorarioSchema>
