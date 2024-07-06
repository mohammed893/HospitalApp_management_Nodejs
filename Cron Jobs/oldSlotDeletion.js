const { pool } = require('../configs/DataBase_conf');
const asyncHandler = require('../utils/asyncHandler');

const deleteOldSlotsForToday = async () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    try {
        // Delete old slots from old_time_slots where deletion_date is today
        const deleteQuery = `
            DELETE FROM old_time_slots
            WHERE deletion_date = $1
        `;
        const deleteValues = [currentDate];
        const deleteResult = await pool.query(deleteQuery, deleteValues);
        console.log(`Deleted ${deleteResult.rowCount} old slots for today`);
    } catch (error) {
        throw new Error(`Error deleting old slots: ${error.message}`);
    }
};

module.exports = {
    deleteOldSlotsForToday,
};