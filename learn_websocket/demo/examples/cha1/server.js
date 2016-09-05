var webSocketServer = require('ws').Server;
var wss = new webSocketServer({port:8080});

wss.on('connection',function(ws){
    console.log('connected');
    ws.on('message',function(message){
    console.log(message);
    })
})