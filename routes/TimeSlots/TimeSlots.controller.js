const pool = require('../../configs/DataBase_conf');
const asyncHandler = require('../../utils/asyncHandler');

// Handler for retrieving time slots
const getTimeSlots = asyncHandler(async (req, res) => {
  const { doctor_id, date } = req.query;
  const result = await pool.query('SELECT * FROM time_slots WHERE doctor_id = $1 AND date = $2', [doctor_id, date]);
  res.status(200).json(result.rows);
});

// Handler for creating a time slot
const createTimeSlot = asyncHandler(async (req, res) => {
  const { doctor_id, date, start_time, end_time, is_available } = req.body;
  const result = await pool.query(
    'INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [doctor_id, date, start_time, end_time, is_available]
  );
  res.status(201).json(result.rows[0]);
});

// Handler for updating a time slot
const updateTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, start_time, end_time, is_available } = req.body;
  const result = await pool.query(
    'UPDATE time_slots SET date = $1, start_time = $2, end_time = $3, is_available = $4 WHERE slot_id = $5 RETURNING *',
    [date, start_time, end_time, is_available, id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Time slot not found' });
  }
  res.status(200).json(result.rows[0]);
});

// Handler for deleting a time slot
const deleteTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM time_slots WHERE slot_id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Time slot not found' });
  }
  res.status(204).send();
});
const getAllTimeSlots = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;
    let queryText = 'SELECT * FROM time_slots WHERE doctor_id = $1';
    const values = [doctor_id];
  
    // Optional filter by availability
    const { availability } = req.query;
    if (availability === 'available') {
      queryText += ' AND is_available = true';
    } else if (availability === 'unavailable') {
      queryText += ' AND is_available = false';
    }
  
    const result = await pool.query(queryText, values);
    res.json(result.rows);
  });
const generateTimeSlots = asyncHandler(async (req, res) => {
    const { doctor_id, start_time, end_time, slot_duration_minutes } = req.body;
  
    // Calculate number of slots based on working hours and slot duration
    const slots = [];
    let currentStartTime = new Date(`1970-01-01T${start_time}`);
    const endTime = new Date(`1970-01-01T${end_time}`);
    const slotDurationMs = slot_duration_minutes * 60 * 1000;
  
    while (currentStartTime < endTime) {
      const slotEndTime = new Date(currentStartTime.getTime() + slotDurationMs);
      const queryText = 'INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const values = [doctor_id, currentStartTime.toISOString().slice(0, 10), currentStartTime.toLocaleTimeString(), slotEndTime.toLocaleTimeString(), true];
      const result = await pool.query(queryText, values);
      slots.push(result.rows[0]);
      currentStartTime = slotEndTime;
    }
  
    res.status(201).json(slots);
  });
const deleteTimeSlots = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;
    const queryText = 'DELETE FROM time_slots WHERE doctor_id = $1';
    await pool.query(queryText, [doctor_id]);
    res.json({ message: 'Time slots deleted successfully' });
  });
const updateAndGenerateTimeSlots = asyncHandler(async (req, res) => {
    const { doctor_id, start_time, end_time, slot_duration_minutes } = req.body;
  
    // Delete existing time slots
    await deleteTimeSlots(req, res);
  
    // Generate new time slots
    await generateTimeSlots(req, res);
  });
module.exports = {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
};