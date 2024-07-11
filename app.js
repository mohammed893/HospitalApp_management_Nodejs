const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const appointments = require('./routes/appointments/appointments');
const doctors = require('./routes/doctors/doctors');
const rays = require('./routes/mongodb/rays');
app.use(cors());

app.use(morgan(
   format = "combined",
));
app.use(bodyParser.json());
app.use('/rays', rays);
app.use('/appointments', appointments);
app.use('/doctors', doctors);
module.exports = app;