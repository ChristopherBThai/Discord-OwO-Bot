
exports.check = function(dbl,msg){
	console.log(dbl.getVotes(false));
	console.log(dbl.hasVoted(msg.author.id));
}
