const DB = require('../../../config/db/connection');
const Querybuilder = require('querybuilder');
const qb = new Querybuilder('mysql');
const formidable = require('formidable');
const moment = require('moment'); // Ex: moment().format('YYYY-MM-DD')
const fs = require('fs');
const uploadHelper = require('../../../config/aws/awsHelper');
const path = require('path')

// Configurations
// Exporting middleware configuration
export const config = {
    api: {
      bodyParser: false,
    },
  }

  const AWS3_UPLOAD_CONFIG = {
    bucket: 'metaversero',
    path: 'catchpoint',
  };
  
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

// Table names
const MISSION_TABLE_NAME = 'mission';
const Q_SELECT_MISSIONS = qb.select('*').from(MISSION_TABLE_NAME);
const Q_INSERT_MISSIONS = `INSERT INTO ${MISSION_TABLE_NAME} VALUES(null, ?, ?, ?, ?, ?)`;

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handleGet = async (req, res) => {
    try {
        const mysql = await DB.getMySQLConnection();
    
        // Synchronous
        var query = Q_SELECT_MISSIONS;
    
        if(req.query.cId) query.where({catchpoint_id: req.query.cId});
    
        const [missions, encoding] = await mysql.execute(query.call());
        
        DB.destroy();
        res.status(200).send(missions);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Failed to fetch the data.'});
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handlePost = async (req, res) => {
    const [request, _] = await parseFormdata(req, res);

    try {
        const inputs = request.body; // The uploaded information
        const buffer = fs.readFileSync(request.files.thumbnail.filepath);
        const thumbnail = await uploadHelper.uploadFile(AWS3_UPLOAD_CONFIG.bucket, buffer, request.files.thumbnail.mimetype, `catchPoint/missions/${inputs.title}/${request.files.thumbnail.newFilename}${path.extname(request.files.thumbnail.originalFilename)}`, 
          request.files.thumbnail.newFilename, 'public-read');

        // Inserting records of the uploaded files in database
        const mysqlConnection = await DB.getMySQLConnection();
        const mission = [inputs.title, inputs.desc, inputs.point, `${thumbnail.Location}`, inputs.catchpoint_id];

        // Actul insertion of the record in database
        const [lastRecord, _] = await mysqlConnection.execute(Q_INSERT_MISSIONS, mission);

        console.log('Last record', lastRecord);

        DB.destroy();

        if(lastRecord.insertId > 0) res.status(200).json({status: 'success', createdAt: moment().format('YYYY-MM-DD HH:mm:ss')});
        else res.status(401).json({status: 'failed', date: moment().format('YYYY-MM-DD HH:mm:ss')});
    } catch (error) {
        console.log(error);
        res.status(500).json({ err: "Unable to perform the POST request." });
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