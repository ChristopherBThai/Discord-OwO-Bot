/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const OverrideInterface = require('./interface/OverrideInterface.js');
const requireDir = require('require-dir');
const dir = requireDir('./',{recurse:false});

var overrides = {};
for(let key in dir){
	if(dir[key] instanceof OverrideInterface){
		overrides[key] = dir[key];
	}
}

exports.override = function(client){
	for(let key in overrides){
		overrides[key].override(client);
	}
}
