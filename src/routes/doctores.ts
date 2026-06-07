import { Router } from 'express'
import { validate } from '../middlewares/validate'
import { crearDoctorSchema, actualizarDoctorSchema, crearHorarioSchema } from '../schemas/doctores'
import * as ctrl from '../controllers/doctores'

const router = Router()

router.get('/',               ctrl.listar)
router.get('/:id',            ctrl.obtener)
router.get('/:id/slots',      ctrl.obtenerSlots)        // GET /api/doctores/:id/slots?fecha=YYYY-MM-DD
router.post('/',              validate(crearDoctorSchema),       ctrl.crear)
router.post('/:id/horarios',  validate(crearHorarioSchema),      ctrl.crearHorario)
router.put('/:id',            validate(actualizarDoctorSchema),  ctrl.actualizar)
router.delete('/:id',         ctrl.desactivar)

export default router
