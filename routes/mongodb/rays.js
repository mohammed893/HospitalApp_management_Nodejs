// doctors.js

const express = require('express');
const router = express.Router();
const controller = require('./rays.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Routes
router.get('/:type/:id', controller.getRays);
router.get('/:type/:id/:date', controller.getRay);
router.post('/:type/:id/:date', upload.single('file'), controller.postRay);
router.delete('/:type/:id/:date', controller.deleteRay);

module.exports = router;