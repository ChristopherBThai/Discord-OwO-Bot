/*
 * Handles messages sent to parent
 */

exports.handle = function(manager,shard,msg){
	switch(msg.type){
		case "sendChannel":
			manager.broadcast(msg);
			break;
		default:
			break;
	}
}
