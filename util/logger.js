var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();


exports.increment= function(name,tags){
	log.increment('owo.'+name,tags);
}

exports.decrement= function(name,tags){
	log.decrement('owo.'+name,tags);
}

