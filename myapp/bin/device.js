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

				var upSql = 'update light set status = "off",state = "1" where id = ?';
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

//设备上传数据
function devUp(id,status){
	var seSql = 'SELECT id FROM device WHERE id = ? ';
		mysqlDb.mysql.find(seSql,[id],function (err,result) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}else if(result.length > 0){
				if(status === 'on'){
					var upSql = 'update mq2 set status = "on" where id = ?';
					mysqlDb.mysql.update(upSql,[id],function (err) {
						if(err){
							// 保存数据失败只会影响历史数据的呈现。
							console.log(id,"连接设备失败：",err)
						}
					})
				}
			}
		})
}


//dht11查询用户名
function dhtUserName(id,callback){
	var seSql = 'SELECT user.userName FROM `user`,dht11 WHERE `user`.uid = dht11.uid AND dht11.id = ?;';
		mysqlDb.mysql.find(seSql,[id],function (err,result) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}else if(result.length > 0){
				callback(null,result[0].userName);
			}
		})
}


//更新空调模式
function air(userName, acmode){
    var upSql = 'update acandhum set acmode = ? where userName = ?';
		mysqlDb.mysql.update(upSql,[acmode,userName],function (err) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}
		})
}

//更新加湿器模式
function hum(userName, hummode){
    var upSql = 'update acandhum set hummode = ? where userName = ?';
		mysqlDb.mysql.update(upSql,[hummode,userName],function (err) {
			if(err){
				// 保存数据失败只会影响历史数据的呈现。
				console.log(id,"连接设备失败：",err)
			}
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
	devUp:devUp,
	dhtUserName:dhtUserName,
	air:air,
	hum:hum

  }