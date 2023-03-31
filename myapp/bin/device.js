const mysqlDb = require('./mysql.js')

//查询设备用户是否存在
function dhtUser(id,callback){
    var seSql = 'SELECT uid FROM dht11 WHERE id = ? ';
		mysqlDb.mysql.find(seSql,[id],function (err,result) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}
				callback(null, result);
		})
}

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

//设备连接
function devConn(json){
	

}

//light连接
function lightConn(id,callback){
	var seSql = 'SELECT uid FROM light WHERE id = ? ';
		mysqlDb.mysql.find(seSql,[id],function (err,result) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}else if(result.length > 0){

				var upSql = 'update light set status = "on",state = "1" where id = ?';
					mysqlDb.mysql.update(upSql,[id],function (err) {
						if(err){
							// 保存数据失败只会影响历史数据的呈现。
							console.log(id,"连接设备失败：",err)
						}
					})
			}
			callback(null,result);
		})
}

//设备断开连接
function dhtClose(id){
    var upSql = 'update dht11 set status = "off",state = "0" where id = ?';
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

//mq2连接
function mq2Conn(id,callback){
	var seSql = 'SELECT uid FROM mq2 WHERE id = ? ';
		mysqlDb.mysql.find(seSql,[id],function (err,result) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}else if(result.length > 0){

				var upSql = 'update mq2 set state = "1" where id = ?';
					mysqlDb.mysql.update(upSql,[id],function (err) {
						if(err){
							// 保存数据失败只会影响历史数据的呈现。
							console.log(id,"连接设备失败：",err)
						}
					})
			}
			callback(null,result);
		})
}



module.exports = {
	dhtUser:dhtUser,
    dhtConn:dhtConn,
	devConn:devConn,
	lightConn:lightConn,
	dhtClose:dhtClose,
    dhtData:dhtData,
	mq2Conn:mq2Conn,

  }