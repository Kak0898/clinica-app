import { z } from 'zod'

// Validación dígito verificador RUT chileno
function validarRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const dv  = clean.slice(-1)
  const num = parseInt(clean.slice(0, -1))
  if (isNaN(num)) return false
  let sum = 0, mult = 2, tmp = num
  while (tmp > 0) {
    sum += (tmp % 10) * mult
    tmp  = Math.floor(tmp / 10)
    mult = mult === 7 ? 2 : mult + 1
  }
  const calc     = 11 - (sum % 11)
  const expected = calc === 11 ? '0' : calc === 10 ? 'K' : String(calc)
  return dv === expected
}

export const crearCitaSchema = z.object({
  doctorId:         z.number().int().positive(),
  especialidadId:   z.number().int().positive(),
  fecha:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  hora:             z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  pacienteNombre:   z.string().min(3).max(150),
  pacienteRut:      z.string().refine(validarRut, { message: 'RUT inválido' }),
  pacienteTelefono: z.string().min(9).max(20),
  pacienteEmail:    z.string().email('Correo inválido'),
  prevision:        z.string().optional().default('No indicada'),
})

export const cancelarCitaSchema = z.object({
  motivo: z.string().max(255).optional(),
})

export type CrearCitaDTO   = z.infer<typeof crearCitaSchema>
export type CancelarCitaDTO = z.infer<typeof cancelarCitaSchema>
