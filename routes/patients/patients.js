const express = require('express');
const router = express.Router();
const {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    getAppointmentsByPatientId,
    
} = require('./patients.controllers');

// GET all patients
router.get('/', getPatients);

// GET a single patient by ID
router.get('/:id',getPatientById);

// CREATE a new patient
router.post('/Add', createPatient);

// UPDATE a patient by ID
router.put('/:id', updatePatient);

// DELETE a patient by ID
router.delete('/:id', deletePatient);

router.get('/appointments/:id' ,getAppointmentsByPatientId )

module.exports = router;