const { Brain, Lung } = require('../../models/rays.models');
const { Binary } = require('mongodb');

// ========== patient ==========
async function postPatient(id, type) {
  try {
    let documentExist;
    switch (type) {
      case 'brain':
        document = await Brain.findOne({ id: id });
        if (documentExist) {
          throw Error('this does already exist' + id);
        }
        document = new Brain({ id: id });
        break;
      case 'lung':
        document = await Lung.findOne({ id: id });
        if (documentExist) {
          throw Error('this does already exist' + id);
        }
        document = new Lung({ id: id });
    }
    await document.save();
    console.log('user added to archive with ID ' + id);
  } catch (err) {
    console.log('Error Adding to Archive:', err);
  }
}

async function deletePatient(id, type) {
  let documentExist;
  switch (type) {
    case 'brain':
      documentExist = await Brain.findOne({ id: id });
      if (!documentExist) {
        throw Error('this user does not exist to delete it');
      }
      await Brain.deleteOne({ id: id });
      break;
    case 'brain':
      documentExist = await Lung.findOne({ name: id });
      if (!documentExist) {
        throw Error('this user does not exist to delete it');
      }
      await Lung.deleteOne({ id: id });
      break;
  }
}
// ========== rays ==========
const getRays = async (req, res) => {
  const { type, id, date } = req.params;

  try {
    let patient;
    switch (type) {
      case 'brain':
        patient = await Brain.findOne({ id: id });
        break;
      case 'lung':
        patient = await Lung.findOne({ id: id });
        break;
      default:
        return res.status(400).send('Invalid type');
    }
    if (patient) {
      res.status(200).send(patient.rays);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.status(500).send('Error');
  }
};

const getRay = async (req, res) => {
  const { type, id, date } = req.params;
  try {
    let patient;
    switch (type) {
      case 'brain':
        patient = await Brain.findOne({ id: id });
        break;
      case 'lung':
        patient = await Lung.findOne({ id: id });
        break;
      default:
        return res.status(400).send('Invalid type');
    }
    if (patient) {
      const ray = patient.rays.find(ray => ray.imageDate === date);
      if (ray) {
        res.status(200).send(ray);
      } else {
        res.status(404).send('Ray not found');
      }
    } else {
      res.status(404).send('Patient not found');
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.status(500).send('Error');
  }
};

const postRay = async (req, res) => {
  const { type, id, date } = req.params;
  console.log(req.file);
  try {

    switch (type) {
      case 'brain':
        const ray = {
          imageDate: date,
          imageData: new Binary(req.file.buffer),
          imageName: `${type}-${date}`,

        };
        let result = await Brain.updateOne({ id: id }, { $push: { rays: ray } }, { upsert: true });
        console.log(result);
        break;
      case 'lung':
        result = await Lung.updateOne({ id: id }, { $push: { rays: ray } }, { upsert: true });
        console.log(result);
        break;
      default:
        break;
    }
  } catch (e) {
    console.log(`error: ${e}`);
  }
}


const deleteRay = async (req, res) => {
  const { type, id, date } = req.params;

  try {
    let patient;
    switch (type) {
      case 'brain':
        patient = await Brain.findOne({ id: id });
        break;
      case 'lung':
        patient = await Lung.findOne({ id: id });
        break;
      default:
        return res.status(400).send('Invalid type');
    }
    if (patient) {
      const updatedRays = patient.rays.filter(ray => ray.imageDate !== date);
      patient.rays = updatedRays;
      await patient.save();
      res.status(200).send('Ray deleted');
    } else {
      res.status(404).send('Patient not found');
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.status(500).send('Error');
  }
};

module.exports = {
  postPatient,
  deletePatient,
  getRays,
  getRay,
  postRay,
  deleteRay
}