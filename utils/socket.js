const secret = require('../../tokens/wsserver.json');
const socket = require('socket.io-client').connect(secret.url);

socket.on('connect', function(){
	console.log("Sharder socket connected");
});

socket.on('error', function(err){
	console.error(err);
});

socket.on('disconnect',function(){
	console.log("Socket disconnected");
});

