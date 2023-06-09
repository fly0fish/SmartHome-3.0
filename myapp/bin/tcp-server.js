// 导入net模块:
const net = require('net')
const PORT = "9003"
const equipmentArray = []
const TIMEOUT = 30*1000; // 30秒没接收到数据就断开连接
const mysqlDb = require('./mysql.js')
const websocket = require('./websocket.js')
const tcpClient = require('./tcp-client.js');
const device = require('./device.js')
const { dhtData } = require('./device.js');


//创建服务器对象
const server = net.createServer((socket)=>{
  //connect
  let addr = socket.remoteAddress + ':' + socket.remotePort
  console.log(addr," connected.")

  // receive data
  socket.on("data",data=>{
	if(!socket.id){
		//接收的第一条数据作为其设备id
		socket.id = data.toString('ascii')
		console.log(socket.id)
		
		

		device.dhtUser(socket.id,function(err,result){
			if(err){
				console.log('查询用户失败')
			}else{
				if(!result){
					socket.end();
				}
			}
		});


		//设备地址
		socket.addr = addr

		//将设备socket存入列表
		addEquipment(socket)

		//存储连接到服务器的设备信息
		device.dhtConn(socket.id)
	}else{
		const json = JSON.parse(data)

		if(json.id === 100){
			device.lightConn(json.light1,function(err,result){
				if(err){
					console.log('查询light1失败')
				}else if(result.length > 0){
					socket.light1 = json.light1
				}
			});
		
			device.lightConn(json.light2,function(err,result){
				if(err){
					console.log('查询light2失败')
				}else if(result.length > 0){
					socket.light2 = json.light2
				}
			});
		
			device.lightConn(json.light3,function(err,result){
				if(err){
					console.log('查询light3失败')
				}else if(result.length > 0){
					socket.light3 = json.light3
				}
			});
		
			device.lightConn(json.light4,function(err,result){
				if(err){
					console.log('查询light4失败')
				}else if(result.length > 0){
					socket.light4 = json.light4
				}
			});

			device.mq2Conn(json.mq2,function(err,result){
				if(err){
					console.log('查询mq2失败')
				}else if(result.length > 0){
					socket.mq2 = json.mq2
				}
			});

			device.doorConn(json.door,function(err,result){
				if(err){
					console.log('查询door失败')
				}else if(result.length > 0){
					socket.door = json.door
				}
			});

		}else if(json.id === 200){
			device.devUp(json.devId,json.status)


		}else if(json.id === 300){

			// 将接收到的数据作为最新的数据
			// let str = addr+" --> " + "tem:" + json.tem + "  " + "hum:" + json.hum
			socket.lastValue = json
			// console.log(str)

			//存储温湿度数据
			device.dhtData(socket.id,json.tem,json.hum)

			//发送websocket消息 
			websocket.sendData(socket.id,socket.lastValue)
		}else if(json.id === 400){

			
			device.dhtUserName(socket.id,function(err,result){
				if(err){
					console.log('查询失败')
				}else if(result.length > 0){
					var userName = result
					var date = new Date();
					mysqlDb.mysql.insertLog([userName,json.log,date])
					device.air(userName,json.acmode)
				}
			});
			

		}else if(json.id === 500){
			device.dhtUserName(socket.id,function(err,result){
				if(err){
					console.log('查询失败')
				}else if(result.length > 0){
					var userName = result
					var date = new Date();
					mysqlDb.mysql.insertLog([userName,json.log,date])
					device.hum(userName,json.hummode)
				}
			});
		}
	}
	
  })

  // close
  socket.on('close',()=>{
		console.log(addr,socket.id,"close")
		// console.log("equipmentArray.length:",equipmentArray.length)
		deleteEquipment(socket.id,socket.addr)
	})
	
	socket.on('error',()=>{
		console.log(addr,socket.id,"error")
		deleteEquipment(socket.id,socket.addr)
	})

	socket.setTimeout(TIMEOUT);
	// 超过一定时间 没接收到数据，就主动断开连接。
	socket.on('timeout', () => {
		console.log(socket.id,socket.addr,'socket timeout');
		deleteEquipment(socket.id,socket.addr)
		device.dhtClose(socket.id)
		socket.end();
	});

})

server.on("error",(err)=>{
	console.log(err)
})

//开启监听
server.listen({port: PORT,host: '0.0.0.0'}, () => {
	console.log('TCP服务器 启动：', server.address())
	
	// 2秒后启动demo2 tcp client 以生成数据。
	setTimeout(() => {
		tcpClient.init()
	}, 2000);


})

// 给列表添加设备
function addEquipment(socket) {
	// 先从列表删除旧的同名连接
	deleteEquipment(socket.id,socket.addr)
	equipmentArray.push(socket)
	
}

// 从列表中删除设备
function deleteEquipment(id,addr){
	if(!id || !addr){
		return ;
	}

	let index = null
	let i
	// 从数组中找到它的位置
	for(i=0;i<equipmentArray.length;i++){
		if(equipmentArray[i].id === id && equipmentArray[i].addr === addr){
			index = i;
		}
	}
	// 从数组中删除该设备
	if(index != null){
		equipmentArray.splice(index,1)
	}
	
}

// 在列表中找到某个id、addr的设备，结果为数组，可能包含多个socket。
function findEquipment(id,addr) {
	let result = []
	let i

	for(i=0;i<equipmentArray.length;i++){
		if(equipmentArray[i].id === id && equipmentArray[i].addr === addr){
			result.push(equipmentArray[i])
		}
	}
	return result
}

// 在列表中找到某个id的设备，结果为数组
function findEquipmentById(id) {
	let result = []
	let i

	for(i=0;i<equipmentArray.length;i++){
		if(equipmentArray[i].id === id){
			result.push(equipmentArray[i])
		}
	}
	return result
}

// 给设备发送控制命令
function sentCommand(id,command,devData,userName) {
	let equipments = findEquipmentById(id)
	if(equipments.length === 0){
		return;
	}
	if(command === 'set'){
		equipments.forEach((socket)=>{
			const json = JSON.stringify(devData);
			socket.write(json);
			var date = new Date();
			mysqlDb.mysql.insertLog([userName,'设置温湿度:tem:' + devData.tem + ' hum:' + devData.hum,date]);
		})

	}else if(command === 'light'){
		equipments.forEach((socket)=>{
			const json = JSON.stringify(devData);
			socket.write(json)

			mysqlDb.mysql.checkLight(userName,devData.id,devData.comm);
			
		})
	}
	else if(command === 'door'){
		equipments.forEach((socket)=>{
			const json = JSON.stringify(devData);
			socket.write(json)

			var date = new Date();
			mysqlDb.mysql.insertLog([userName,'门禁' + devData.comm,date]);
			
		})
	}else if(command === 'outmode'){
		equipments.forEach((socket)=>{
			const json = JSON.stringify(devData);
			socket.write(json)
			
		})
	}else if(command === 'inmode'){
		equipments.forEach((socket)=>{
			const json = JSON.stringify(devData);
			socket.write(json)
			
		})
	}

}

module.exports={
	equipmentArray:equipmentArray,
	addEquipment:addEquipment,
	deleteEquipment:deleteEquipment,
	findEquipment:findEquipment,
	sentCommand:sentCommand,
}