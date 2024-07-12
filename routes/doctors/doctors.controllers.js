
const { pool } = require('../../configs/DataBase_conf');
const asyncHandler = require('../../utils/asyncHandler');
const {checkConflicts , deleteConflictingAppointments} = require('../TimeSlots/TimeSlots.controller');


const checkDoctorExists = async (doctor_id) => {
    const query = 'SELECT COUNT(*) FROM doctors WHERE doctor_id = $1';
    const result = await pool.query(query, [doctor_id]);
    return parseInt(result.rows[0].count) > 0;
};


// Show all appointments for a doctor with option future or all
const getAppointmentsForDoctor = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;
    const { future } = req.query; // Get the optional 'future' query parameter

    try {
        let queryText;
        const queryParams = [doctor_id];

        if (future === 'true') {
            queryText = `
                SELECT a.*, p.firstname, p.email, p.phonenumber
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                WHERE a.doctor_id = $1 AND a.appointment_date >= CURRENT_DATE
            `;
        } else {
            queryText = `
                SELECT a.*, p.firstname, p.email, p.phonenumber
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                WHERE a.doctor_id = $1
            `;
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
        res.status(200).json('Deleted');
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
            'INSERT INTO doctors (firstname, specialization, qualification, experience, email, phone, working_hours) VALUES ($1, $2, $3 , $4 , $5 , $6 , $7) RETURNING *',
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
    const doctorExistenceCheck = await checkDoctorExists(doctor_id);
    if(!doctorExistenceCheck){
        return res.status(404).json({ error: 'Doctor not found' });
    }
      if (force) {
          // Forceful deletion: delete conflicting appointments first
          await deleteConflictingAppointments(doctor_id, currentDate);

          // Now delete the doctor
          const result = await pool.query('DELETE FROM doctors WHERE doctor_id = $1 RETURNING *', [doctor_id]);

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
// View all active and future slots for a specific doctor
const getSlotsForDoctor = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;

    try {
        //Check for the doctor first 
        const doctorExistenceCheck = await checkDoctorExists(doctor_id);
        if (!doctorExistenceCheck) {
            return res.status(404).json({ error: `Doctor with ID ${doctor_id} not found` });
        }
        // Fetch active slots (is_available = true)
        const activeQuery = `
            SELECT * FROM time_slots
            WHERE doctor_id = $1 AND is_available = true
            ORDER BY date, start_time
        `;
        const activeSlots = await pool.query(activeQuery, [doctor_id]);

        // Fetch future slots (is_available = false and date >= CURRENT_DATE)
        const futureQuery = `
            SELECT * FROM time_slots
            WHERE doctor_id = $1 AND is_available = false AND date >= CURRENT_DATE
            ORDER BY date, start_time
        `;
        const futureSlots = await pool.query(futureQuery, [doctor_id]);

        res.json({
            activeSlots: activeSlots.rows,
            futureSlots: futureSlots.rows
        });
    } catch (error) {
        console.error('Error fetching slots for doctor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
const HomeScreenData = asyncHandler(async (req, res) => {
    const doctor_id = req.params.doctor_id;
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    try {
        // Fetch doctor information
        const doctorQuery = `
            SELECT * FROM doctors
            WHERE doctor_id = $1
        `;
        const doctorResult = await pool.query(doctorQuery, [doctor_id]);

        if (doctorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        const doctor = doctorResult.rows[0];

        // Fetch today's appointments
        const todayappointmentsQuery = `
            SELECT a.*, p.firstname, p.email, p.phonenumber
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = $1 AND a.appointment_date = CURRENT_DATE
        `;
        const appointmentsResult = await pool.query(todayappointmentsQuery, [doctor_id]);

        const activeQuery = `
        SELECT *, 
               to_char(time_slots.date, 'YYYY-MM-DD') as date, 
               to_char(time_slots.start_time, 'HH24:MI:SS') as start_time, 
               to_char(time_slots.end_time, 'HH24:MI:SS') as end_time
        FROM time_slots
        WHERE time_slots.doctor_id = $1 AND time_slots.is_available = true
        ORDER BY time_slots.date, time_slots.start_time
    `;
    
    const futureSlotsQuery = `
        SELECT *, 
               to_char(time_slots.date, 'YYYY-MM-DD') as date, 
               to_char(time_slots.start_time, 'HH24:MI:SS') as start_time, 
               to_char(time_slots.end_time, 'HH24:MI:SS') as end_time
        FROM time_slots
        WHERE time_slots.doctor_id = $1 AND time_slots.is_available = false AND time_slots.date >= CURRENT_DATE
        ORDER BY time_slots.date, time_slots.start_time
    `;
    const futureAppointmentsQuery = `
    SELECT a.*, p.firstname, p.email, p.phonenumber,
           to_char(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
           to_char(a.start_time, 'HH24:MI:SS') as start_time,
           to_char(a.end_time, 'HH24:MI:SS') as end_time
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.doctor_id = $1 AND a.appointment_date >= CURRENT_DATE
`;
const pastAppointmentsQuery = `
    SELECT a.*, p.firstname, p.email, p.phonenumber,
           to_char(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
           to_char(a.start_time, 'HH24:MI:SS') as start_time,
           to_char(a.end_time, 'HH24:MI:SS') as end_time
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.doctor_id = $1 AND a.appointment_date < CURRENT_DATE
`;
        const activeSlots = await pool.query(activeQuery , [doctor_id]);

        
        const futureSlots = await pool.query(futureSlotsQuery , [doctor_id]);

        const FutureAppointments = await pool.query(futureAppointmentsQuery , [doctor_id]);
        const pastAppointments = await pool.query(pastAppointmentsQuery , [doctor_id]);

        // Combine doctor information with today's appointments
        const doctorWithAppointments = {
            ...doctor,
            todayAppointments: appointmentsResult.rows,
            activeSlots: activeSlots.rows,
            futureSlots: futureSlots.rows,
            futureAppointments: FutureAppointments.rows,
            pastAppointments: pastAppointments.rows,
        };

        res.status(200).json(doctorWithAppointments);
    } catch (error) {
        console.error('Error fetching doctor with today\'s appointments:', error);
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
    getSlotsForDoctor,
    HomeScreenData
};