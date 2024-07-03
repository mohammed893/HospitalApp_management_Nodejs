const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

app.use(cors({ origin: 'http://localhost:3000', }));

app.use(morgan(
   format = "combined",
));

app.use(bodyParser.json());
app.use('/auth', auth);

module.exports = app;