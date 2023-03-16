const mysqlDb = require('./mysql.js')

//dht11连接信息
function dhtConn(id){
    var upSql = 'update dht11 set status = "on",state = "1" where id = ?';
		mysqlDb.mysql.update(upSql,[id],function (err) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}
		})
}

//存储温湿度数据
function dhtData(id,tem,hum){
    var addSql = 'INSERT INTO dht11_data(devId,tem,hum) VALUES(?,?,?)';
		mysqlDb.mysql.insert(addSql,[id,tem,hum],function (err) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"保存数据失败：",err)
			}
		})
}

module.exports = {
    dhtConn:dhtConn,
    dhtData:dhtData
  }