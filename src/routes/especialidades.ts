import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { crearEspecialidadSchema, actualizarEspecialidadSchema } from '../schemas/especialidades'
import * as ctrl from '../controllers/especialidades'

const router = Router()

router.get('/',      ctrl.listar)
router.get('/:id',   ctrl.obtener)
router.post('/',     validate(crearEspecialidadSchema),       ctrl.crear)
router.put('/:id',   validate(actualizarEspecialidadSchema),  ctrl.actualizar)
router.delete('/:id', ctrl.desactivar)

export default router
