import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { loginSchema, crearAdminSchema } from '../schemas/auth'
import { authMiddleware } from '../middlewares/authMiddleware'
import * as ctrl from '../controllers/auth'

const router = Router()

// Pública
router.post('/login', validate(loginSchema), ctrl.login)

// Protegidas — requieren JWT
router.get('/admins',      authMiddleware, ctrl.listarAdmins)
router.post('/admins',     authMiddleware, validate(crearAdminSchema), ctrl.crearAdmin)
router.delete('/admins/:id', authMiddleware, ctrl.desactivarAdmin)

export default router