var net = require('net');

var PORT = "9002"
var tcpClient = null;// tcp客户端，只记录最新接入的那个

var server = net.createServer((socket)=>{
  //connect
  tcpClient = socket// 保存最新接入的那个，方便后面定时发送0/1
  var addr = socket.address().address + ':' + socket.address().port
  var welcome =  addr + ' connected.\n'
  socket.write(welcome, 'ascii')//

  // recieve data
  socket.on("data",data=>{
    var str = addr+" --> " + data.toString('ascii') + '\n'
    console.log(str)
  })

  // close
  socket.on('close',()=>{
    tcpClient = null
    console.log(addr,"close")
  })

  socket.on('error',(err)=>{
    tcpClient = null
    console.log("error",err)
  })
  
})

server.on("error",(err)=>{
  console.log(err)
})

server.listen({port: PORT,host: '0.0.0.0'}, () => {
  console.log('tcp1 server running on', server.address())
})

var flag = true
setInterval(() => {
  if(tcpClient){
    flag = !flag // 不断取反
    tcpClient.write(flag?'1':'0') // 若true则发送1，若false发送0
  }
}, 1000);