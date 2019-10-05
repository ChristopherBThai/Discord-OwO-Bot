/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const OverrideInterface = require('./interface/OverrideInterface.js');
var Messages = {};

/*
 * Overrides MESSAGE_REACTION_ADD websockets
 */
module.exports = new class ReactionSocketOverride extends OverrideInterface{

	override(client){
		//console.log("Overriding handlers/index.js");
		let handler = require('../node_modules/discord.js/src/client/websocket/handlers/index.js');
		handler['MESSAGE_REACTION_ADD'] = (client, packet) => {
			if(!client.actions.MessageReactionAdd.handle(packet.d)&&Messages[packet.d.message_id]){
				let rc = Messages[packet.d.message_id];
				let info = packet.d;
				rc.emit('collect',{emoji:info.emoji},{id:info.user_id});
			}
		};
	}

	addEmitter(ReactionCollector, Message){
		Messages[Message.id] = ReactionCollector;
		ReactionCollector.on('end',async function(collected){
			delete Messages[Message.id];
		});
	}

}
