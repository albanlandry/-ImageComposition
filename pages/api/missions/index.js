const DB = require('../../../config/db/connection');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export default async function handler(req, res) {
    const mysql = await DB.getMySQLConnection();

    
}