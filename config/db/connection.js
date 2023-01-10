const mysql = require('mysql2/promise');

/** Database-related */
/**
 * Get the connection to the database
 * @returns 
 */
module.exports.getMySQLConnection = () => {
    return mysql.createConnection({
      host: 'dev-database.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
      user: 'admin',
      password: 'popsline1234',
      database: 'metaversero',
      multipleStatements: true
    });
}