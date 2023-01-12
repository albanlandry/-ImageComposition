const DB = require('../../../config/db/connection');
const Querybuilder = require('querybuilder');
const qb = new Querybuilder('mysql');

// Table names
const MISSION_TABLE_NAME = 'mission';

const Q_SELECT_MISSIONS = qb.select('*').from(MISSION_TABLE_NAME);

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default async function handler(req, res) {
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
}