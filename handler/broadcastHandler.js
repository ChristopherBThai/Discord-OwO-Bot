/* Handles messages between parent to child process */

const global = require("../util/global.js");
const Error = require("./errorHandler.js");

exports.handle = function(client,msg){

	/* Check if the message is ment for this shard */
	if(msg.shard!=undefined&&msg.shard!=client.shard.id)
		return;

	/* Determine the type of broadcast message */
	try{
		switch(msg.type){
			case "sendDM":
				sendDM(msg).catch(err=>{console.error(err)});
				break;
			case "sendChannel":
				sendChannel(client,msg);
				break;
			default:
				return;
		}
	}catch(err){
		console.error(err)
	}
}

async function sendDM(msg){
	var user = await global.getUser(msg.to);

	if(!user)
		throw new Error("Failed to send a message to "+msg.to,"Messaging");

	user.send(msg.msg);
}

async function sendChannel(client,msg){
	var channel = client.channels.get(msg.to);
	if(channel) channel.send(msg.msg);
}
