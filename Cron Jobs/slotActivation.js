const { pool } = require('../configs/DataBase_conf');
const asyncHandler = require('../utils/asyncHandler');

const activateSlotsForToday = async () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    try {
        // Activate slots in time_slots where date is today and is_available is false
        const activateQuery = `
            UPDATE time_slots
            SET is_available = true
            WHERE date = $1 AND is_available = false
        `;
        const activateValues = [currentDate];
        const activateResult = await pool.query(activateQuery, activateValues);
        console.log(`Activated ${activateResult.rowCount} slots for today`);
    } catch (error) {
        throw new Error(`Error activating slots: ${error.message}`);
    }
};

module.exports = {
    activateSlotsForToday,
};