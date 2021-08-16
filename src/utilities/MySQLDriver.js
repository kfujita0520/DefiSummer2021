const MySQL = require('mysql');
const dotenv = require('dotenv');
dotenv.config();


class MySQLDriver{
  constructor(){
    this.connection = this.createConnection();
    this.connection.connect();
  }

  createConnection(){
    return MySQL.createConnection({
      host: process.env.RDS_HOST,
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE
    });
  }

  getConnection(){
    return this.connection;
  }

  closeConnection(){
    this.connection.end();
  }

  recordWithoutId(target){
    let result = Object.assign({}, target);
    delete result.id;
    return result;
  }
  extractId(target){
    return {id:target.id};
  }
  splitById(target){
    return [this.extractId(target), this.recordWithoutId(target)];
  }
  query(statement, ...parameters){
    return this.connection().query(statement, parameters, (error, results, fields) => {

    });
  }
  execute(statement, ...parameters){
    return this.connection().query(statement, parameters, (error, results, fields) => {

    });
  }
  select(tableName, criteria){
    if (criteria === undefined) {
      return this.connection().query(`SELECT * FROM ${tableName} WHERE ?`, criteria, (error, results, fields) => {

      });
    }else{
      return this.connection().query(`SELECT * FROM ${tableName}`, (error, results, fields) => {

      });
    }
  }
  insert(tableName, target){
    this.connection().query(`INSERT INTO ${tableName} ?`, this.recordWithoutId(target), (error, results, fields) => {

    });
  }
  update(tableName, target){
    const id_clause = {id: target.id};
    this.connection().query(`UPDATE ${tableName} SET ? WHERE ?`, this.splitById(target), (error, results, fields) => {

    });
  }
  delete(tableName, target){
    this.connection().query(`DELETE FROM ${tableName} WHERE ?`, this.extractId(target), (error, results, fields) => {

    });
  }
}
module.exports.MySQLDriver = MySQLDriver;
