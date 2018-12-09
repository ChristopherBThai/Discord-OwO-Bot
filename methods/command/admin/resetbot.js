const CommandInterface = require('../../commandinterface.js');

const delay = 30000;

module.exports = new CommandInterface({
	
	alias:["resetbot","restartbot"],

	admin:true,
	dm:true,

	execute: function(p){
		p.msg.channel.send("Restarting all shards...").then(function(){
			for(var i=0;i<p.client.shard.count;i++){
				if(i!=p.client.shard.id){
					var func = resetShard(p,i);
					setTimeout(func,(i+1)*delay);
				}
			}
			setTimeout(function(){
				p.msg.channel.send("["+p.client.shard.id+"] Restarting last shard...").then(function(){
					process.exit(0);
				});
			},(p.client.shard.count+1)*delay);
		});
	}

})

function resetShard(p,id){
	var num = id;
	return function(){
		p.client.shard.broadcastEval(`
			if(this.shard.id==${num}){
				console.log("["+this.shard.id+"] Shard is restarting!");
				process.exit(0);
			}
		`);
	}
}
