
const { pool } = require('../../configs/DataBase_conf');
const asyncHandler = require('../../utils/asyncHandler');
const {checkConflicts , deleteConflictingAppointments} = require('../TimeSlots/TimeSlots.controller');

// Show all appointments for a doctor with option future or all
const getAppointmentsForDoctor = asyncHandler(async (req, res) => {
  const { doctor_id } = req.params;
  const { future } = req.query; // Get the optional 'future' query parameter

  try {
      let queryText;
      const queryParams = [doctor_id];

      if (future === 'true') {
          queryText = 'SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date >= CURRENT_DATE';
      } else {
          queryText = 'SELECT * FROM appointments WHERE doctor_id = $1';
      }

      const { rows } = await pool.query(queryText, queryParams);
      res.json(rows);
  } catch (err) {
      console.error('Error fetching appointments for doctor:', err);
      res.status(500).json({ error: 'Server error' });
  }
});

// Cancel an appointment by doctor with appointmentId
const cancelAppointmentByDoctor = asyncHandler(async (req, res) => {
    const { appointment_id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [appointment_id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.status(200).json(updatedSlot.rows[0]);
    } catch (err) {
        console.error('Error canceling appointment by doctor:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM doctors');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get doctor by ID
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor_id = req.params.doctor_id;

    try {
        const result = await pool.query('SELECT * FROM doctors WHERE doctor_id = $1', [doctor_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new doctor
const createDoctor = asyncHandler(async (req, res) => {
    const { name, specialization, qualification , experience , email , phone , working_hours } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO doctors (name, specialization, qualification, experience, email, phone, working_hours) VALUES ($1, $2, $3 , $4 , $5 , $6 , $7) RETURNING *',
            [name, specialization, qualification , experience , email , phone , working_hours]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a doctor by ID

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor_id = req.params.doctor_id;
  const updates = req.body; // Object containing the fields to update

  try {
      // Check if the updates object is empty
      if (Object.keys(updates).length === 0) {
          return res.status(400).json({ error: 'No fields provided to update' });
      }

      // Prepare the dynamic query parts
      const fields = [];
      const values = [];
      let index = 1;

      // Loop through the updates object to construct the query dynamically
      for (const [key, value] of Object.entries(updates)) {
          fields.push(`${key} = $${index++}`);
          values.push(value);
      }

      values.push(doctor_id); //last push for last index 

      const queryText = `
          UPDATE doctors
          SET ${fields.join(', ')}
          WHERE doctor_id = $${index} 
          RETURNING *
      `;

      const result = await pool.query(queryText, values);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Doctor not found' });
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


// Delete a doctor by ID
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor_id = req.params.doctor_id;
  const { force } = req.body || false; // Default force to false if req.body is undefined or falsy
  const currentDate = new Date();

  try {
      if (force) {
          // Forceful deletion: delete conflicting appointments first
          await deleteConflictingAppointments(doctor_id, currentDate);

          // Now delete the doctor
          const result = await pool.query('DELETE FROM doctors WHERE doctor_id = $1 RETURNING *', [doctor_id]);

          if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Doctor not found' });
          }

          return res.status(200).json({ message: 'Doctor deleted successfully' });
      }

      // Regular deletion: check for conflicts before proceeding
      const conflicts = await checkConflicts(doctor_id, currentDate);

      if (conflicts.length > 0) {
          return res.status(400).json({ conflict: true, appointments: conflicts });
      }

      // No conflicts, proceed with deletion
      const result = await pool.query('DELETE FROM doctors WHERE doctor_id = $1 RETURNING *', [doctor_id]);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Doctor not found' });
      }

      res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
    getAppointmentsForDoctor,
    cancelAppointmentByDoctor,
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};