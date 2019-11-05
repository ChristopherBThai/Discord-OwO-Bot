
/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const callbackList = {};

exports.handle = async function(main, message){
	let {buffer,error,callbackID,loc} = JSON.parse(message);
	if(callbackList[callbackID]){
		callbackList[callbackID](error,buffer,loc);
		delete callbackList[callbackID];
	}
}

exports.addCallback = function(id,callback,timeout=2000){
	callbackList[id] = callback;
	setTimeout(() => {
		if(callbackList[id]){
			callbackList[id](true);
			delete callbackList[id];
		}
	},timeout);
}
