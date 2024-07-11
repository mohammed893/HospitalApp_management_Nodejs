const express = require('express');
const router = express.Router();
const appointmentController = require('./appointments.controller');

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.get('/id/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.get('/today/:doctor_id' ,appointmentController.getTodayAppointmentsByDoctor)
module.exports = router;