const { pool } = require('../../configs/DataBase_conf');
const asyncHandler = require('../../utils/asyncHandler');
const cron = require('node-cron');

// Generate slots for a doctor
const generateSlots = asyncHandler(async (req, res) => {
    const { doctor_id, start_time, end_time, slot_duration_minutes, activation_date, force, activate_immediately } = req.body;

    try {
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

        // Generate slots
        const slots = await generateAndInsertSlots(doctor_id, start_time, end_time, slot_duration_minutes, activation_date, activate_immediately);

        // Move old slots to the old_time_slots table
        await moveOldSlots(doctor_id, activation_date);

        // Return generated slots
        res.status(201).json(slots);
    } catch (error) {
        console.error('Error generating slots:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Function to check for conflicts in appointments
const checkConflicts = async (doctor_id, activation_date) => {
    const conflictCheck = await pool.query(
        `SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date >= $2`,
        [doctor_id, activation_date]
    );
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
const generateAndInsertSlots = async (doctor_id, start_time, end_time, slot_duration_minutes, activation_date, activate_immediately) => {
    const startTime = new Date(`1970-01-01T${start_time}`);
    const endTime = new Date(`1970-01-01T${end_time}`);
    const slotDurationMs = slot_duration_minutes * 60 * 1000;
    const slots = [];

    let currentStartTime = startTime;

    while (currentStartTime < endTime) {
        const slotEndTime = new Date(currentStartTime.getTime() + slotDurationMs);
        const isActivated = activate_immediately ? true : false;

        const queryText = `
            INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            doctor_id,
            isActivated ? new Date() : activation_date,
            currentStartTime.toLocaleTimeString(),
            slotEndTime.toLocaleTimeString(),
            isActivated
        ];

        const result = await pool.query(queryText, values);
        slots.push(result.rows[0]);

        currentStartTime = slotEndTime; // Move to the next slot time
    }

    return slots;
};

// Function to move old slots to old_time_slots table
const moveOldSlots = async (doctor_id, activation_date) => {
    try {
        // Select slots that need to be moved
        const selectQuery = `
            SELECT * FROM time_slots
            WHERE doctor_id = $1 AND is_available = true AND date < $2
        `;
        const { rows: oldSlots } = await pool.query(selectQuery, [doctor_id, activation_date]);

        // Insert old slots into old_time_slots table
        for (const slot of oldSlots) {
            const insertQuery = `
                INSERT INTO old_time_slots (doctor_id, date, start_time, end_time, is_available, deletion_date)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [
                slot.doctor_id,
                slot.date,
                slot.start_time,
                slot.end_time,
                slot.is_available,
                activation_date
            ];
            await pool.query(insertQuery, values);
        }

        // Delete old slots from time_slots table
        const deleteQuery = `
            DELETE FROM time_slots
            WHERE doctor_id = $1 AND is_available = true AND date < $2
        `;
        await pool.query(deleteQuery, [doctor_id, activation_date]);

        console.log('Old slots moved successfully');
    } catch (error) {
        console.error('Error moving old slots:', error);
    }
};

// Schedule the cron job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const result = await pool.query('SELECT doctor_id, activation_date FROM time_slots WHERE date = CURRENT_DATE');
        for (const { doctor_id, activation_date } of result.rows) {
            await moveOldSlots(doctor_id, activation_date);
        }
        console.log('Cron job executed successfully');
    } catch (error) {
        console.error('Error executing cron job:', error);
    }
});

const updateSlotAvailability = asyncHandler(async (req, res) => {
    const { slot_id, is_available, force = false } = req.body;
    const currentDate = new Date();
    try {
        if (force) {
            // Delete future appointments using the slot
            await pool.query(
                `DELETE FROM appointments WHERE slot_id = $1 AND appointment_date > CURRENT_DATE`,
                [slot_id]
            );
        } else {
            // Check for future appointments using the slot
            const futureAppointmentsQuery = await pool.query(
                `SELECT * FROM appointments WHERE slot_id = $1 AND appointment_date > CURRENT_DATE`,
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