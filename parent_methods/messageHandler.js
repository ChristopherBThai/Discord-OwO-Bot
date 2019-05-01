/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

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
