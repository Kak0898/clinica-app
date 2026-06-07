import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Limpiar en orden por FK ──────────────────────────────
  await prisma.cita.deleteMany()
  await prisma.horarioDoctor.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.especialidad.deleteMany()

  // ── Especialidades ───────────────────────────────────────
  const [medGral, pediatria, cardiologia, traumatologia, dermatologia, ginecologia] =
    await Promise.all([
      prisma.especialidad.create({ data: { nombre: 'Medicina General', descripcion: 'Consulta general',       icono: 'ti-stethoscope' } }),
      prisma.especialidad.create({ data: { nombre: 'Pediatría',         descripcion: '0 a 15 años',           icono: 'ti-baby-carriage' } }),
      prisma.especialidad.create({ data: { nombre: 'Cardiología',       descripcion: 'Corazón y circulación', icono: 'ti-heart-rate-monitor' } }),
      prisma.especialidad.create({ data: { nombre: 'Traumatología',     descripcion: 'Huesos y articulaciones', icono: 'ti-bone' } }),
      prisma.especialidad.create({ data: { nombre: 'Dermatología',      descripcion: 'Piel y tejidos',        icono: 'ti-microscope' } }),
      prisma.especialidad.create({ data: { nombre: 'Ginecología',       descripcion: 'Salud femenina',        icono: 'ti-gender-female' } }),
    ])

  console.log('✅ Especialidades creadas')

  // ── Doctores ─────────────────────────────────────────────
  const doctores = await Promise.all([
    // Medicina General
    prisma.doctor.create({ data: { nombre: 'Andrea', apellido: 'Muñoz',   avatarIniciales: 'AM', avatarColor: '#B5D4F4', avatarColorText: '#0C447C', especialidadId: medGral.id } }),
    prisma.doctor.create({ data: { nombre: 'Carlos', apellido: 'Reyes',   avatarIniciales: 'CR', avatarColor: '#C0DD97', avatarColorText: '#27500A', especialidadId: medGral.id } }),
    // Pediatría
    prisma.doctor.create({ data: { nombre: 'Lorena', apellido: 'Vidal',   avatarIniciales: 'LV', avatarColor: '#FAC775', avatarColorText: '#633806', especialidadId: pediatria.id } }),
    prisma.doctor.create({ data: { nombre: 'Matías', apellido: 'Ortiz',   avatarIniciales: 'MO', avatarColor: '#F4C0D1', avatarColorText: '#721E3E', especialidadId: pediatria.id } }),
    // Cardiología
    prisma.doctor.create({ data: { nombre: 'Roberto',   apellido: 'Silva', avatarIniciales: 'RS', avatarColor: '#CECBF6', avatarColorText: '#3C3489', especialidadId: cardiologia.id } }),
    prisma.doctor.create({ data: { nombre: 'Francisca', apellido: 'Pino',  avatarIniciales: 'FP', avatarColor: '#9FE1CB', avatarColorText: '#085041', especialidadId: cardiologia.id } }),
    // Traumatología
    prisma.doctor.create({ data: { nombre: 'Héctor',    apellido: 'Morales', avatarIniciales: 'HM', avatarColor: '#FAC775', avatarColorText: '#633806', especialidadId: traumatologia.id } }),
    // Dermatología
    prisma.doctor.create({ data: { nombre: 'Valentina', apellido: 'Cruz',  avatarIniciales: 'VC', avatarColor: '#F5C4B3', avatarColorText: '#712B13', especialidadId: dermatologia.id } }),
    // Ginecología
    prisma.doctor.create({ data: { nombre: 'Camila',    apellido: 'Torres', avatarIniciales: 'CT', avatarColor: '#F4C0D1', avatarColorText: '#4B1528', especialidadId: ginecologia.id } }),
  ])

  console.log('✅ Doctores creados')

  // ── Horarios (Lun-Vie para todos) ─────────────────────────
  const diasHabiles = [1, 2, 3, 4, 5] // 1=Lun … 5=Vie

  await Promise.all(
    doctores.flatMap(doc =>
      diasHabiles.map(dia =>
        prisma.horarioDoctor.create({
          data: {
            doctorId:          doc.id,
            diaSemana:         dia,
            horaInicio:        '09:00',
            horaFin:           '17:00',
            intervaloMinutos:  30,
          },
        })
      )
    )
  )

  // Admin por defecto
  const { crearAdmin } = await import('../src/services/auth')
  const adminExiste = await prisma.admin.findUnique({ where: { email: 'admin@clinica.com' } })
  if (!adminExiste) {
    await crearAdmin('Administrador', 'admin@clinica.com', 'admin123')
    console.log('✅ Admin creado — email: admin@clinica.com / pass: admin123')
  }

  console.log('✅ Horarios creados')
  console.log('🎉 Seed completado')


}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
