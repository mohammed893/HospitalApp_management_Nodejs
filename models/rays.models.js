const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  imageData: {
    type: Buffer,
    required: true
  },
  imageDate: {
    type: String,
    required: false,
  },
  // in the original ray, the doctor's diagnose will be saved and the model's will be in the segmentation.
  result: {
    type: String,
    required: false
  },
});
const raySchema = mongoose.Schema({
  ray: imageSchema,
  segmentation: imageSchema,
});
const patientSchema = mongoose.Schema({
  id: Number,
  rays: {
    type: [raySchema],
    required: false
  }
});

const Brain = mongoose.model('brain', patientSchema);
const Lung = mongoose.model('lung', patientSchema);
module.exports = {
  Brain,
  Lung
};