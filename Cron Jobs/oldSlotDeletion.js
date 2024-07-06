const { pool } = require('../configs/DataBase_conf');
const asyncHandler = require('../utils/asyncHandler');

const deleteOldSlotsForToday = async () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    try {
        // Select IDs of old slots from old_time_slots where deletion_date is today
        const selectQuery = `
            SELECT old_slot_id FROM old_time_slots
            WHERE deletion_date = $1
        `;
        const selectValues = [currentDate];
        const { rows: oldSlotIds } = await pool.query(selectQuery, selectValues);

        if (oldSlotIds.length === 0) {
            console.log('No old slots found for today');
            return;
        }

        // Prepare IDs for deletion from time_slots table
        const idsToDelete = oldSlotIds.map(slot => slot.old_slot_id); // Corrected to use old_slot_id

        // Delete corresponding slots from time_slots table
        const deleteQuery = `
            DELETE FROM time_slots
            WHERE slot_id IN (${idsToDelete.join(', ')})
        `;
        const deleteResult = await pool.query(deleteQuery);
        
        console.log(`Deleted ${deleteResult.rowCount} slots from time_slots corresponding to old slots for today`);
    } catch (error) {
        throw new Error(`Error deleting old slots: ${error.message}`);
    }
};

module.exports = {
    deleteOldSlotsForToday,
};
