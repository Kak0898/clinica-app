import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const crearAdminSchema = z.object({
  nombre:   z.string().min(2, 'Mínimo 2 caracteres'),
  email:    z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type LoginDTO      = z.infer<typeof loginSchema>
export type CrearAdminDTO = z.infer<typeof crearAdminSchema>