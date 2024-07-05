const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const appointments = require('./routes/appointments/appointments');
const doctors = require('./routes/doctors/doctors');
app.use(cors({ origin: 'http://localhost:3000', }));

app.use(morgan(
   format = "combined",
));
app.use(bodyParser.json());
app.use('/appointments', appointments);
app.use('/doctors' , doctors);

module.exports = app;