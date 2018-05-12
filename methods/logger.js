var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();


exports.vote = function(){
	log.increment('owo.vote');
}

exports.point = function(){
	log.increment('owo.point');
}

exports.hunt= function(){
	log.increment('owo.hunt');
}

exports.battle = function(){
	log.increment('owo.battle');
}

exports.daily = function(){
	log.increment('owo.daily');
}
