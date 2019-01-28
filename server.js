var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const port = process.env.port || 3001;

app.use(express.static(__dirname + '/dist/MainLCD'));

app.get('/*', (req,res)=> res.sendFile(path.join(__dirname+ '/dist/MainLCD/index.html')));

io.on('connection', function(socket) {
  console.log('new connection made');
});

server.listen(port, ()=> console.log('Running...'));
