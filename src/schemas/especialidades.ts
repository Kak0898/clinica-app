import { z } from 'zod'

export const crearEspecialidadSchema = z.object({
  nombre:      z.string().min(3, 'Mínimo 3 caracteres').max(100),
  descripcion: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  icono:       z.string().min(2, 'Icono requerido').max(50),
})

export const actualizarEspecialidadSchema = crearEspecialidadSchema.partial().extend({
  activo: z.boolean().optional(),
})

export type CrearEspecialidadDTO    = z.infer<typeof crearEspecialidadSchema>
export type ActualizarEspecialidadDTO = z.infer<typeof actualizarEspecialidadSchema>
