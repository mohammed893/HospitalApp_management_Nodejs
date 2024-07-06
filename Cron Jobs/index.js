const cron = require('node-cron');
const slotActivation = require('./slotActivation');
const oldSlotDeletion = require('./oldSlotDeletion');

const startCronJobs = () => {
    // Schedule slot activation cron job
    cron.schedule('0 0 * * *', async () => {
        try {
            await slotActivation.activateSlotsForToday();
            console.log('Slot activation cron job executed successfully');
        } catch (error) {
            console.error('Error executing slot activation cron job:', error);
        }
    });

    // Schedule old slot deletion cron job
    cron.schedule('0 1 * * *', async () => { // Adjust the schedule as needed
        try {
            await oldSlotDeletion.deleteOldSlotsForToday();
            console.log('Old slot deletion cron job executed successfully');
        } catch (error) {
            console.error('Error executing old slot deletion cron job:', error);
        }
    });
};

module.exports = {
    startCronJobs,
};