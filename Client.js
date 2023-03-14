var net = require('net')

var client = net.createConnection({
    port: 9002,
    host: '127.0.0.1'
})

client.on('connect',() => {
    client.write('client connected')
})

client.on('data', (chunk) => {
    console.log(chunk.toString('ascii'))
})

client.on('error', (err) => {
    console.log(err)
})

client.on('close', () => {
    console.log('客户端已关闭')
})