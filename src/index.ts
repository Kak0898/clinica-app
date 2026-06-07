import 'dotenv/config'
import app from './app'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT ?? 3000

async function main() {
  // Verificar conexión a la BD antes de levantar
  await prisma.$connect()
  console.log('✅ Conectado a PostgreSQL')

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`)
  })
}

main().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err)
  process.exit(1)
})
