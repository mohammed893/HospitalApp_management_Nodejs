const cron = require('node-cron');
const { pool } = require('../../configs/DataBase_conf'); // assuming you have a db module to manage the pool

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Activate new slots and delete old slots
        await pool.query('BEGIN');

        // Delete old slots
        await pool.query(`
            DELETE FROM time_slots
            WHERE is_activated = true
              AND date < $1
        `, [today]);

        // Activate new slots
        await pool.query(`
            UPDATE time_slots
            SET is_activated = true
            WHERE date = $1
              AND is_activated = false
        `, [today]);

        await pool.query('COMMIT');

        console.log(`Slots activated for date: ${today}`);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error activating slots:', error);
    }
});