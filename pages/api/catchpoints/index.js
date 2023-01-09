// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const mysql = require('mysql2/promise');
const formidable = require('formidable');
const moment = require('moment');
const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new AWS.S3();
const uploadHelper = require('../../../config/aws/awsHelper');

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

/** Database-related */
const getMySQLConnection = () => {
  return mysql.createConnection({
    host: 'dev-database.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'popsline1234',
    database: 'metaversero',
    multipleStatements: true
  });
}

// const queries
const INSERT_CATCHPOINT = `INSERT INTO catchpoint VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 65)`;
const SELECT_MISSION = "SELECT * FROM mission_info WHERE param_name LIKE 'm_piece%' ORDER BY mission_id";
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

  // console.log('Input-data', request.body, INSERT_CATCHPOINT);
  // console.log('Cover', request.files.cover.filepath);

  try {
    const inputs = request.body;
    const mysqlConnection = await getMySQLConnection();
    const catchpoint = [inputs.title, inputs.subtitle, inputs.desc, inputs.subdesc, inputs.time, inputs.price, inputs.point,
      inputs.goods, '', '', '', moment().format('YYYY-MM-DD')];
    
    // Setting the time zone
    // await mysqlConnection.execute(SET_UTC_TIME);
    // const [result, encoding] = await mysqlConnection.execute(SELECT_MISSION, values);
    // const [result, _] = await mysqlConnection.execute(INSERT_CATCHPOINT, catchpoint);
    const buffer = fs.readFileSync(request.files.cover.filepath);

    console.log('blob', buffer);

    await uploadHelper.uploadFile(AWS3_UPLOAD_CONFIG.bucket, buffer, request.files.cover.mimetype, 
      `catchpoint/${request.files.cover.originalFilename}`, request.files.cover.newFilename, 'public');
    
    
    // res.status(200).json(result)
    res.status(200).json(request.files.cover);
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
export default async function handler(req, res) {
  if (req.method === 'POST') { 
    await handlePost(req, res);
  }else {
    res.status(404).json(`${req.method} method is not supported for this endpoint.`);
  }
}
