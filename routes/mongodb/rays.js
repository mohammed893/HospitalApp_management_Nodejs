// doctors.js

const express = require('express');
const router = express.Router();
const controller = require('./rays.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Routes
router.get('/:type/:id/:date/:rayorsegmentation', controller.getRay);
router.post('/:type/:id/:date/:rayorsegmentation', upload.single('file'), controller.postRay);
router.put('/:type/:id/:date/:rayorsegmentation', controller.updateRay);
router.delete('/:type/:id/:date/:rayorsegmentation', controller.deleteRay);

module.exports = router;