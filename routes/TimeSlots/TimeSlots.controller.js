const { pool } = require('../../configs/DataBase_conf');
const asyncHandler = require('../../utils/asyncHandler');
const cron = require('node-cron');

// Generate slots for a doctor
const generateSlots = asyncHandler(async (req, res) => {
     let{ doctor_id, start_time, end_time, slot_duration_minutes, activation_date,
         available_days, force, activate_immediately } = req.body;
        if (activate_immediately) {
            activation_date = new Date();
        }
    try {
        // Check if the doctor exists
        const doctorExistenceCheck = await pool.query(
            `SELECT COUNT(*) FROM doctors WHERE doctor_id = $1`,
            [doctor_id]
        );
        const doctorExists = parseInt(doctorExistenceCheck.rows[0].count) > 0;
        if (!doctorExists) {
            return res.status(404).json({ error: `Doctor with ID ${doctor_id} does not exist.` });
        }

        // Check for conflicts
        const conflicts = await checkConflicts(doctor_id, activation_date);

        // Handle conflicts if any
        if (conflicts.length > 0 && !force) {
            return res.status(400).json({ conflict: true, appointments: conflicts });
        }

        // If force is true, delete conflicting appointments
        if (force) {
            await deleteConflictingAppointments(doctor_id, activation_date);
        }
        // Move old slots to the old_time_slots table
       
        await moveOldSlots(doctor_id, activation_date , activate_immediately ? true : false);
        
        // Generate slots
        const slots = await generateAndInsertSlots(doctor_id, start_time, end_time, slot_duration_minutes, activation_date, available_days, activate_immediately);

        

        // Return generated slots
        res.status(201).json(slots);
    } catch (error) {
        console.error('Error generating slots:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Function to check for conflicts in appointments
const checkConflicts = async (doctor_id, activation_date , ) => {
    // First, check if the doctor exists
    const doctorExistenceCheck = await pool.query(
        `SELECT COUNT(*) FROM doctors WHERE doctor_id = $1`,
        [doctor_id]
    );

    const doctorExists = parseInt(doctorExistenceCheck.rows[0].count) > 0;

    if (!doctorExists) {
        throw new Error(`Doctor with ID ${doctor_id} does not exist.`);
    }

    // If doctor exists, then proceed to check for conflicts in appointments
    const conflictCheck = await pool.query(
        `SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date >= $2`,
        [doctor_id, activation_date]
    );
    console.log("Checked" + conflictCheck.rows);

    return conflictCheck.rows;
};

// Function to delete conflicting appointments
const deleteConflictingAppointments = async (doctor_id, activation_date) => {
    await pool.query(
        `DELETE FROM appointments WHERE doctor_id = $1 AND appointment_date >= $2`,
        [doctor_id, activation_date]
    );
};

// Function to generate and insert slots into time_slots table
const generateAndInsertSlots = async (doctor_id, start_time, end_time, slot_duration_minutes, activation_date, available_days, activate_immediately) => {
    const startTime = new Date(`1970-01-01T${start_time}`);
    const endTime = new Date(`1970-01-01T${end_time}`);
    const slotDurationMs = slot_duration_minutes * 60 * 1000;
    const slots = [];

    let currentStartTime = startTime;

    while (currentStartTime < endTime) {
        const slotEndTime = new Date(currentStartTime.getTime() + slotDurationMs);
        const isActivated = activate_immediately ? true : false;

        try {
            const queryText = `
                INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available, available_days)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const values = [
                doctor_id,
                isActivated ? new Date() : activation_date,
                currentStartTime.toLocaleTimeString(),
                slotEndTime.toLocaleTimeString(),
                isActivated,
                JSON.stringify(available_days) // store available days as JSON
            ];

            const result = await pool.query(queryText, values);
            slots.push(result.rows[0]);
        } catch (error) {
            // Log the error and handle it as needed
            console.error('Error inserting slot into database:', error);
            // You can throw the error to stop further processing or handle it differently based on your application's needs
            throw new Error('Failed to insert slot into database');
        }

        currentStartTime = slotEndTime; // Move to the next slot time
    }

    return slots;
};

// Function to move old slots to old_time_slots table
const moveOldSlots = async (doctor_id, activation_date, immediatelyActivate = false) => {
    try {
        let selectQuery;
        let queryValues = [doctor_id];

        if (immediatelyActivate) {
            // Immediately activate: Delete old slots directly
            await pool.query(`
                DELETE FROM time_slots
                WHERE doctor_id = $1 AND is_available = true
            `, [doctor_id]);
            console.log('Old slots deleted directly successfully');
        } else {
            // Future activation: Move old slots to old_time_slots table
            selectQuery = `
                SELECT * FROM time_slots
                WHERE doctor_id = $1 AND is_available = true AND date <= $2
            `;
            queryValues.push(activation_date);
            const { rows: oldSlots } = await pool.query(selectQuery, queryValues);

            for (const slot of oldSlots) {
                const insertQuery = `
                    INSERT INTO old_time_slots (doctor_id, old_slot_id, date, start_time, end_time, is_available, deletion_date)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `;
                const values = [
                    slot.doctor_id,
                    slot.slot_id, // Include slot_id here
                    slot.date,
                    slot.start_time,
                    slot.end_time,
                    slot.is_available,
                    activation_date
                ];
                await pool.query(insertQuery, values);
            }

            console.log('Old slots moved successfully and waiting for scheduled deletion');
        }
    } catch (error) {
        console.error('Error moving old slots:', error);
    }
};

// Schedule the cron job to run daily at midnight
// cron.schedule('0 0 * * *', async () => {
//     try {
//         const result = await pool.query('SELECT doctor_id, activation_date FROM time_slots WHERE date = CURRENT_DATE');
//         for (const { doctor_id, activation_date } of result.rows) {
//             await moveOldSlots(doctor_id, activation_date);
//         }
//         console.log('Cron job executed successfully');
//     } catch (error) {
//         console.error('Error executing cron job:', error);
//     }
// });

const updateSlotAvailability = asyncHandler(async (req, res) => {
    const { slot_id, is_available, force = false } = req.body;
    const currentDate = new Date();
    try {
        //check for conflicts 

        if (force) {
            // Delete future appointments using the slot
            await pool.query(
                `DELETE FROM appointments WHERE slot_id = $1 AND appointment_date > CURRENT_DATE`,
                [slot_id]
            );
        } else {
            // Check for future appointments using the slot
            const futureAppointmentsQuery = await pool.query(
                `SELECT * FROM appointments WHERE slot_id = $1 AND appointment_date >= CURRENT_DATE`,
                [slot_id]
            );

            if (futureAppointmentsQuery.rows.length > 0) {
                return res.status(400).json({ error: 'Cannot update slot with future appointments' });
            }
        }

        // Update the slot availability
        const updateQuery = `
            UPDATE time_slots SET is_available = $1 WHERE slot_id = $2 RETURNING *
        `;
        const updateValues = [is_available, slot_id];
        const updatedSlot = await pool.query(updateQuery, updateValues);
        if (updatedSlot.rows.length == 0) {
            res.status(404).json({ error: "Slot Not found" });
        }
        res.status(200).json(updatedSlot.rows[0]);
    } catch (error) {
        console.error('Error updating slot availability:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = {
    generateSlots,
    updateSlotAvailability,
    checkConflicts,
    deleteConflictingAppointments
};