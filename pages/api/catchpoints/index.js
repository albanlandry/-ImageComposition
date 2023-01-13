// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const formidable = require('formidable');
const moment = require('moment'); // Ex: moment().format('YYYY-MM-DD')
const fs = require('fs');
const uploadHelper = require('../../../config/aws/awsHelper');
const path = require('path')
const DB = require('../../../config/db/connection');

// Exporting middleware configuration
export const config = {
  api: {
    bodyParser: false,
  },
}

const  form = new formidable.IncomingForm({ multiples:  true }); // multiples means req.files will be an array

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const parseFormdata = (req, res) => {
  return new Promise((resolve, _) => {
    const  contentType = req.headers['content-type'];

    if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
      form.parse(req, (err, fields, files) => {
        if (!err) {
          req.body = fields; // sets the body field in the request object
          req.files = files; // sets the files field in the request object
        }

        resolve([req, res]);
      });
    } else
      resolve([req, res]);
  });
}

// const queries
const INSERT_CATCHPOINT = `INSERT INTO catchpoint VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_FORMAT(sysdate(), "%Y-%m-%d"), 1, 65)`;
const INSERT_BANNER_IMGS = 'INSERT INTO cp_banner VALUES(null, ?, ?, ?)';
const SELECT_CATCHPOINT = `SELECT * FROM catchpoint`;
const SET_UTC_TIME = "SET time_zone = '+00:00'";

const AWS3_UPLOAD_CONFIG = {
  bucket: 'metaversero',
  path: 'catchpoint',
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handlePost = async (req, res) => {
  const [request, _] = await parseFormdata(req, res);

  try {
    const inputs = request.body; // The uploaded files
        
    // Uploading all the files to amazon aws
    // Uploading the cover-related file
    const buffer = fs.readFileSync(request.files.cover.filepath);
    const coverUpload = await uploadHelper.uploadFile(AWS3_UPLOAD_CONFIG.bucket, buffer, request.files.cover.mimetype, `catchPoint/${inputs.title}/${request.files.cover.newFilename}${path.extname(request.files.cover.originalFilename)}`, 
      request.files.cover.newFilename, 'public-read');
    
    // Uploading the intro images
    const imagesUpload = await Promise.all(request.files.images.map(file => {
      const blob = fs.readFileSync(file.filepath);

      return uploadHelper.uploadFile(AWS3_UPLOAD_CONFIG.bucket, blob, file.mimetype, `catchPoint/${inputs.title}/${file.newFilename}${path.extname(file.originalFilename)}`, file.newFilename, 'public-read');
    }));
    
    // Inserting records of the uploaded files in database
    const mysqlConnection = await DB.getMySQLConnection();
    const catchpoint = [inputs.title, inputs.subtitle, inputs.desc, inputs.subdesc, inputs.time, inputs.price, inputs.point, inputs.goods, '', `${coverUpload.Location}`, ''];

    // Setting the time zone
    // lastRecord: {fieldCount, affectedRows, insertId, info, serverStatus, warningStatus}
    await mysqlConnection.execute(SET_UTC_TIME);
    const [lastRecord, _] = await mysqlConnection.execute(INSERT_CATCHPOINT, catchpoint);
    
    // Save the rows in the banner if they were successfully uploaded
    let insertions;
    if(lastRecord.insertId) {
      insertions = await Promise.all(imagesUpload.map(async (img, index) => {
        const value = [img.Location, `value${index}`, lastRecord.insertId];

        return await mysqlConnection.execute(INSERT_BANNER_IMGS, value);
      }));
    }

    DB.destroy();
    res.status(200).json({status: 'success', createdAt: moment().format('YYYY-MM-DD HH:mm:ss')});
  } catch(err) {
    console.log(err);
    res.status(500).json({ err: err.message });
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handleGet = async (req, res) => {

  try {
    const mysqlConnection = await DB.getMySQLConnection();
    const [records, _] = await mysqlConnection.execute(SELECT_CATCHPOINT);

    res.status(200).json(records);
  } catch(err) {
    res.status(500).json({ error: 'Failed to access the records' });
  }  
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default async function handler(req, res) {
  if (req.method === 'POST') { 
    await handlePost(req, res);
  } else if (req.method === 'GET') {
    await handleGet(req, res);
  }
  else {
    res.status(404).json(`${req.method} method is not supported for this endpoint.`);
  }
}
