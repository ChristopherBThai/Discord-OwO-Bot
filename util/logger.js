var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();


exports.increment= function(name,id){
	log.increment('owo.'+name);
	if(id)
		log.increment('owo.'+id+'.'+name);
}

exports.decrement= function(name,id){
	log.decrement('owo.d'+name);
	if(id)
		log.decrement('owo.'+id+'.'+name);
}

