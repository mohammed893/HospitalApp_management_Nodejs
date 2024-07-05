// appointments.js

const asyncHandler = require('../../utils/asyncHandler');
const {pool} = require('../../configs/DataBase_conf');

// @desc    Create a new appointment
// @route   POST /appointments
// @access  Public
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor_id, patient_id, appointment_date, start_time, end_time, status, type, notes, slot_id } = req.body;

  try {
    // Check if the slot is available in time_slots
    const slotCheck = await pool.query(
      `SELECT * FROM time_slots 
       WHERE slot_id = $1 AND doctor_id = $2 AND is_available = true`,
      [slot_id, doctor_id]
    );

    if (slotCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    // Check for overlapping appointments
    const appointmentCheck = await pool.query(
      `SELECT * FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 
       AND slot_id = $3`,
      [doctor_id, appointment_date, slot_id]
    );

    if (appointmentCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Appointment conflict' });
    }

    // If both checks pass, proceed to create the appointment
    const result = await pool.query(
      'INSERT INTO appointments (doctor_id, patient_id, appointment_date, start_time, end_time, status, type, notes, slot_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [doctor_id, patient_id, appointment_date, start_time, end_time, status, type, notes, slot_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get all appointments for a doctor
// @route   GET /appointments/doctor/:doctor_id
// @access  Public
const getAppointmentsByDoctor = asyncHandler(async (req, res) => {
  const doctor_id = req.params.doctor_id;

  try {
    const result = await pool.query('SELECT * FROM appointments WHERE doctor_id = $1', [doctor_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
const getAppointments = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get a specific appointment by ID
// @route   GET /appointments/:appointment_id
// @access  Public
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment_id = req.params.appointment_id;

  try {
    const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [appointment_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Update an appointment by ID
// @route   PUT /appointments/:appointment_id
// @access  Public
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment_id = req.params.appointment_id;
  const { appointment_date, start_time, end_time, status, type, notes } = req.body;

  try {
    const result = await pool.query(
      'UPDATE appointments SET appointment_date = $1, start_time = $2, end_time = $3, status = $4, type = $5, notes = $6 WHERE appointment_id = $7 RETURNING *',
      [appointment_date, start_time, end_time, status, type, notes, appointment_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Delete an appointment by ID
// @route   DELETE /appointments/:appointment_id
// @access  Public
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment_id = req.params.appointment_id;

  try {
    const result = await pool.query('DELETE FROM appointments WHERE appointment_id = $1 RETURNING *', [appointment_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  createAppointment,
  getAppointmentsByDoctor,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointments
};