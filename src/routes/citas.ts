import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { crearCitaSchema } from '../schemas/citas'
import * as ctrl from '../controllers/citas'

const router = Router()

router.get('/',             ctrl.listar)
router.get('/:id',          ctrl.obtener)
router.post('/',            validate(crearCitaSchema), ctrl.crear)
router.put('/:id/cancelar', ctrl.cancelar)

export default router
