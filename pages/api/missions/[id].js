const DB = require('../../../config/db/connection');
const Querybuilder = require('querybuilder');
const qb = new Querybuilder('mysql');

// Configurations
// Exporting middleware configuration
/*
export const config = {
    api: {
        bodyParser: false,
    },
}
*/

// Table names
const MISSION_TABLE_NAME = 'mission';
const Q_SELECT_MISSIONS = qb.select('*').from(MISSION_TABLE_NAME);

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
    
        if(req.query.id) query.where({id: req.query.id});
    
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
export default async function handler(req, res) {
    if (req.method === 'GET') {
        await handleGet(req, res);
    }
    else {
        res.status(404).json(`${req.method} method is not supported for this endpoint.`);
    }
}