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
const getRay = async (req, res) => {
  const { type, id, date, rayorsegmentation } = req.params;
  try {
    let returnedRay;
    switch (type) {
      case 'brain':
        Brain.findOne({ id: id, 'rays.ray.imageDate': date }).then((result) => {
          // for (const ray in result.rays) {
          //   console.log('ray', ray);
          //   if (ray.imageDate == date) {
          //     returnedRay = ray;
          //   }
          // }
          console.log()
        });

        break;
      case 'lung':

        break;
    }
    console.log(returnedRay);
  } catch (e) {
    console.log(e);
  }
}

const postRay = async (req, res) => {
  const { type, id, date, rayorsegmentation } = req.params;
  console.log(req.file);
  try {
    switch (type) {
      case 'brain':
        if (rayorsegmentation == 'ray') {
          await Brain.updateOne({ id: id }, { $push: { rays: { ray: { imageData: new Binary(req.file.buffer), imageDate: date } } } }, { upsert: true })
          console.log('المفروض اشتغل');
        } else if (rayorsegmentation == 'segmentation') {
          await Brain.updateOne(
            { id: id, 'rays.ray.imageDate': date },
            { $set: { 'rays.$.segmentation': { imageData: new Binary(req.file.buffer), imageDate: date } } }
          );
        }
        break;
      case 'lung':
        if (rayorsegmentation === 'ray') {
          await Lung.updateOne(
            { id: id },
            { $push: { rays: { ray: { imageData: new Binary(req.file.buffer), imageDate: date } } } },
            { upsert: true }
          );
        } else if (rayorsegmentation === 'segmentation') {
          await Lung.updateOne(
            { id: id, 'rays.ray.imageDate': date },
            { $set: { 'rays.$.segmentation': { imageData: new Binary(req.file.buffer), imageDate: date } } }
          );
        }
        break;
      default:
        break;
    }
  } catch (e) {
    console.log(`error: ${e}`);
  }
}

const updateRay = async (req, res) => {

}

const deleteRay = async (req, res) => {
  const { type, id, date, rayorsegmentation } = req.params;

  try {
    let updateQuery;
    switch (type) {
      case 'brain':
        if (rayorsegmentation === 'ray') {
          updateQuery = { $pull: { rays: { 'ray.imageDate': date } } };
        } else if (rayorsegmentation === 'segmentation') {
          updateQuery = { $set: { 'rays.$.segmentation': null } };
        }
        await Brain.updateOne(
          { id: id, 'rays.ray.imageDate': date },
          updateQuery
        );
        break;
      case 'lung':
        if (rayorsegmentation === 'ray') {
          updateQuery = { $pull: { rays: { 'ray.imageDate': date } } };
        } else if (rayorsegmentation === 'segmentation') {
          updateQuery = { $set: { 'rays.$.segmentation': null } };
        }
        await Lung.updateOne(
          { id: id, 'rays.ray.imageDate': date },
          updateQuery
        );
        break;
    }

    console.log('deleted successfully');
  } catch (e) {
    console.log(e);
  }
}

const getSegementation = async (req, res) => {

}

const postSegmentation = async (req, res) => {

}

module.exports = {
  postPatient,
  deletePatient,
  getRay,
  postRay,
  updateRay,
  deleteRay
}