// doctors.js

const express = require('express');
const router = express.Router();
const doctorsController = require('./doctors.controllers');
const TimeSlots = require('../TimeSlots/TimeSlots.controller');

// Routes
router.get('/', doctorsController.getAllDoctors);
router.get('/:doctor_id', doctorsController.getDoctorById);
router.post('/', doctorsController.createDoctor);
router.put('/:doctor_id', doctorsController.updateDoctor);
router.delete('/:doctor_id', doctorsController.deleteDoctor);
router.post('/generate-slots', TimeSlots.generateSlots);
router.get('/:doctor_id/appointments', doctorsController.getAppointmentsForDoctor);
router.patch('/SlotAvailability' , TimeSlots.updateSlotAvailability);
router.delete('/appointments/:appointment_id', doctorsController.cancelAppointmentByDoctor)
router.get('/getSlots/:doctor_id',doctorsController.getSlotsForDoctor);
module.exports = router;