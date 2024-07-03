const express = require('express');
const notify = express.Router();
const {notifyUser, notifyUsersByRole}  = require('../../sockets/socket.controller')

notify.post('/', notifyUser);
notify.post('/role', notifyUsersByRole);
module.exports = notify;