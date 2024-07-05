const express = require('express');
const {pool} = require('../../configs/DataBase_conf'); // assuming you have a db module to manage the pool
const asyncHandler = require('../../utils/asyncHandler');

// Generate slots dynamically for a doctor
const generateSlots = asyncHandler(async (req, res) => {
    const { doctor_id, start_time, end_time, slot_duration_minutes, activation_date, force } = req.body;

    try {
        // Check for conflicts with existing appointments after activation_date
        const conflictCheck = await pool.query(
            `SELECT *
             FROM appointments
             WHERE doctor_id = $1
               AND appointment_date >= $2
              `,
            [doctor_id, activation_date]
        );

        // Handle conflicts if any
        if (conflictCheck.rows.length > 0 && !force) {
            return res.status(400).json({ conflict: true, appointments: conflictCheck.rows });
        }

        // If force is true, delete conflicting appointments
        if (force) {
            await pool.query(
                `DELETE FROM appointments
                 WHERE doctor_id = $1
                   AND appointment_date >= $2
                   `,
                [doctor_id, activation_date]
            );
        }

        // Begin slot generation process
        let currentStartTime = new Date(`1970-01-01T${start_time}`);
        const endTime = new Date(`1970-01-01T${end_time}`);
        const slotDurationMs = slot_duration_minutes * 60 * 1000;
        const slots = [];

        // Generate slots iteratively
        while (currentStartTime < endTime) {
            const slotEndTime = new Date(currentStartTime.getTime() + slotDurationMs);

            // Insert slot into time_slots table
            const queryText = `
                INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [
                doctor_id,
                activation_date,
                currentStartTime.toLocaleTimeString(),
                slotEndTime.toLocaleTimeString(),
                true
            ];
            const result = await pool.query(queryText, values);
            slots.push(result.rows[0]);

            currentStartTime = slotEndTime; // Move to the next slot time
        }

        // Return generated slots
        res.status(201).json(slots);
    } catch (error) {
        console.error('Error generating slots:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update doctor's slots
const updateSlotAvailability = asyncHandler(async (req, res) => {
  const { slot_id, is_available, force = false } = req.body;

  try {
      if (force) {
          // Delete future appointments using the slot
          await pool.query(
              `DELETE FROM appointments
               WHERE slot_id = $1 AND appointment_date > CURRENT_DATE`,
              [slot_id]
          );
      } else {
          // Check for future appointments using the slot
          const futureAppointmentsQuery = await pool.query(
              `SELECT * FROM appointments
               WHERE slot_id = $1 AND appointment_date > CURRENT_DATE`,
              [slot_id]
          );

          if (futureAppointmentsQuery.rows.length > 0) {
              return res.status(400).json({ error: 'Cannot update slot with future appointments' });
          }
      }

      // Update the slot availability
      const updateQuery = `
          UPDATE time_slots
          SET is_available = $1
          WHERE slot_id = $2
          RETURNING *
      `;
      const updateValues = [is_available, slot_id];
      const updatedSlot = await pool.query(updateQuery, updateValues);

      res.status(200).json(updatedSlot.rows[0]);
  } catch (error) {
      console.error('Error updating slot availability:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

// Show all appointments for a doctor
const getAppointmentsForDoctor = asyncHandler(async (req, res) => {
  const { doctor_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM appointments WHERE doctor_id = $1', [doctor_id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Cancel an appointment by doctor
const cancelAppointmentByDoctor = asyncHandler(async (req, res) => {
  const { appointment_id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [appointment_id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
const getAllDoctors = asyncHandler(async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM doctors');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
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
  
  // @desc    Create a new doctor
  // @route   POST /doctors
  // @access  Public
const createDoctor = asyncHandler(async (req, res) => {
    const { name, specialty, contact_info } = req.body;
  
    try {
      const result = await pool.query(
        'INSERT INTO doctors (name, specialty, contact_info) VALUES ($1, $2, $3) RETURNING *',
        [name, specialty, contact_info]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // @desc    Update a doctor by ID
  // @route   PUT /doctors/:doctor_id
  // @access  Public
  const updateDoctor = asyncHandler(async (req, res) => {
    const doctor_id = req.params.doctor_id;
    const { name, specialty, contact_info } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE doctors SET name = $1, specialty = $2, contact_info = $3 WHERE doctor_id = $4 RETURNING *',
        [name, specialty, contact_info, doctor_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // @desc    Delete a doctor by ID
  // @route   DELETE /doctors/:doctor_id
  // @access  Public
  const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor_id = req.params.doctor_id;
  
    try {
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
  generateSlots,
  updateSlots,
  getAppointmentsForDoctor,
  cancelAppointmentByDoctor,
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};