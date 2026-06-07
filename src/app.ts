import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { errorHandler } from './middlewares/errorHandler'
import { authMiddleware } from './middlewares/authMiddleware'
import especialidadesRouter from './routes/especialidades'
import authRouter from './routes/auth'
import doctoresRouter from './routes/doctores'
import citasRouter from './routes/citas'

const app = express()

// ── Middlewares globales ──────────────────────────────────
app.use(helmet())             // headers de seguridad
app.use(cors())               // permite requests del frontend
app.use(express.json())       // parsea body JSON

// ── Rutas ─────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/especialidades', especialidadesRouter)
app.use('/api/doctores',       doctoresRouter)
app.use('/api/citas',          citasRouter)

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// ── Error handler global (siempre al final) ───────────────
app.use(errorHandler)

export default app
