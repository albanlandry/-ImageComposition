const DB = require('../../../../config/db/connection');
const Querybuilder = require('querybuilder');
const qb = new Querybuilder('mysql');
const formidable = require('formidable');

// Exporting middleware configuration
export const config = {
    api: {
      bodyParser: false,
    },
}

const  form = new formidable.IncomingForm({ multiples:  true }); // multiples means req.files will be an array

// Table names
const MISSION_TABLE_NAME = 'mission';
const MISSION_INFO_TABLE_NAME = 'mission_info';
const Q_SELECT_MISSIONS = qb.select('*').from(MISSION_TABLE_NAME);
const Q_SELECT_MISSIONS_INFO = qb.select('*').from(MISSION_INFO_TABLE_NAME);
const Q_SELECT_MISSIONS_PARAM = `SELECT * FROM ${MISSION_INFO_TABLE_NAME} WHERE mission_id = ? AND param_name LIKE ?`; 

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const handleGet = async (req, res) => {
    const mysql = await DB.getMySQLConnection();
    const query = Q_SELECT_MISSIONS_INFO;

    try{

        if(req.query.mId && req.query.p) {
            // console.log('Params', [req.query.mId, req.query.p]);
            const [info, encoding] = await mysql.execute(Q_SELECT_MISSIONS_PARAM, [req.query.mId, req.query.p]);
            res.status(200).json(info);

            return;
        }

        if(req.query.mId) {
            query.where({mission_id: req.query.mId});
            const [info, encoding] = await mysql.execute(query.call());
            res.status(200).json(info);
            return;
        }

        // Default execution
        const [info, encoding] = await mysql.execute(query.call());
        res.status(200).json(infos);
    } catch(err) {
        console.log(err);
        res.status(500).json({status: 'Failed', message: 'Unable to process the request'});
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default async function handler(req, res) {
    if (req.method === 'GET') {
        await handleGet(req, res);
    }
    else {
        res.status(404).json(`${req.method} method is not supported for this endpoint.`);
    }
}