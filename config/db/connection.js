const mysql = require('mysql2/promise');

let Connection = null;
/** Database-related */
/**
 * Get the connection to the database
 * @returns 
 */
module.exports.getMySQLConnection = async () => {
    Connection =  mysql.createPool({
      host: 'dev-database.cmpvgajxiyud.ap-northeast-2.rds.amazonaws.com',
      user: 'admin',
      password: 'popsline1234',
      database: 'metaversero',
      connectionLimit: 2,
    });

    return Connection;
}

module.exports.close = () => {
  if(Connection) Connection.end();
}

module.exports.destroy = () => {
    Connection.end();
}