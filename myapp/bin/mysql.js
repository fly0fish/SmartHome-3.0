const MysqlClient = require('mysql');

var obj = {
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  port: '3306',
  database: 'iot',
  multipleStatements: true // 支持执行多条 sql 语句
},
  connPool = MysqlClient.createPool(obj);

let mysql = {
  dbClient: null,
  db: null,
  insert: null,
  find: null
}

connPool.getConnection(function (err, client) {
  if (err) throw err;
  // 如果连接成功

  mysql.dbClient = client;
  console.log('数据库已连接')
});


//增添数据
mysql.insert = function (sql,data, callback) {
  if (mysql.dbClient) {

    var SqlParams = data;

    mysql.dbClient.query(sql, SqlParams, function (err, result) {
      // 如果在执行上述查询时出现任何错误，则抛出错误
      if (err) {
        callback(err)
      }
      // 如果没有错误，得到结果
      callback(null, result);
    });
  }
  else {
    callback('mysql is not connected!')
  }
}

//删除数据
mysql.delete = function (sql,data, callback) {
  if (mysql.dbClient) {

    var SqlParams = data;

    mysql.dbClient.query(sql, SqlParams, function (err, result) {
      // 如果在执行上述查询时出现任何错误，则抛出错误
      if (err) {
        callback(err)
      }
      // 如果没有错误，得到结果
      callback(null, result);
    });
  }
  else {
    callback('mysql is not connected!')
  }
}

//修改数据
mysql.update = function (sql,data, callback) {
  if (mysql.dbClient) {

    var SqlParams = data;

    mysql.dbClient.query(sql, SqlParams, function (err, result) {
      // 如果在执行上述查询时出现任何错误，则抛出错误
      if (err) {
        callback(err)
      }
      // 如果没有错误，得到结果
      callback(null, result);
    });
  }
  else {
    callback('mysql is not connected!')
  }
}


// 查找数据
mysql.find = function (sql,data, callback) {
  if (mysql.dbClient) {

    // var sql = 'select * from dev order by sn desc limit 10;';
    var SqlParams = data;

    mysql.dbClient.query(sql, SqlParams, function (err, result) {
      if (err) {
        callback(err)
      }
      callback(null,result);
    });
  }
  else {
    callback('mysql is not connected!')
  }

}


module.exports = {
  mysql: mysql,
  connPool:connPool
}
