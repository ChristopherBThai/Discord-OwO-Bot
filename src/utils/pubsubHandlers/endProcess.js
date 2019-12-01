/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

var timer;

exports.handle = async function(main, message){
	if(timer){
		clearTimeout(timer);
		delete timer;
	}
	let time = main.clusterID*60000;
	console.log("ending "+main.clusterID+" in "+time+"ms");
	timer = setTimeout(function(){
		process.exit(0);
	},time);
}

