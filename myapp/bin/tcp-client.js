const net = require('net');

let client = new net.Socket();

// function generateRandomData() {
//   const temperature = (20 + Math.random() * 10).toFixed(2);
//   const humidity = (40 + Math.random() * 20).toFixed(2);
//   return { temperature, humidity };
// }

function init() {
  client.connect(9003, '127.0.0.1', function() {
    console.log('tcp-client Connected.');
    // 先发送设备id
    client.write('211')
    //定时发送随机数
    let interval = setInterval(()=>{
      if(!client.destroyed){
        // let value = (20+Math.random()*10).toFixed(2)
        // client.write(String(value))
        const data = {
          tem: (20+Math.random()*10).toFixed(2),
          hum: (50+Math.random()*10).toFixed(2)
        };
        
        const json = JSON.stringify(data);
        client.write(json);
      }
      else{
        clearInterval(interval)
      }
      
    },1000)
  });

  client.on('data', function(data) {
    console.log('tcp-client received: ' + data);
  });
  
  client.on('close', function() {
    console.log('Connection closed.');
  });

  client.on('error',(err)=>{
		console.error(err)
	})


}

module.exports={init:init}

