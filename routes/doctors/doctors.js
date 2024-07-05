// doctors.js

const express = require('express');
const router = express.Router();
const doctorsController = require('./doctors.controllers');

// Routes
router.get('/', doctorsController.getAllDoctors);
router.get('/:doctor_id', doctorsController.getDoctorById);
router.post('/', doctorsController.createDoctor);
router.put('/:doctor_id', doctorsController.updateDoctor);
router.delete('/:doctor_id', doctorsController.deleteDoctor);
router.post('/generate-slots', doctorsController.generateSlots);
router.put('/update-slots', doctorsController.updateSlots);
router.get('/:doctor_id/appointments', doctorsController.getAppointmentsForDoctor);
router.delete('/appointments/:appointment_id', doctorsController.cancelAppointmentByDoctor)
module.exports = router;