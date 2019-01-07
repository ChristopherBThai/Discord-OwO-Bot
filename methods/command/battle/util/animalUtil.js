exports.stats = function(animal){

	/* Parse animal stats */
	let lvl = this.toLvl(animal.xp);
	/* Parse base animal stat*/
	let stats = this.parseStats(animal.animal,lvl.lvl);
	
	stats.lvl = lvl.lvl;
	stats.xp = [lvl.currentXp,lvl.maxXp];

	this.weaponStats(stats,animal.weapon);

	animal.stats = stats;
}

exports.weaponStats = function(stats,weapon){
	/* Add Bonus Stats */
	if(weapon) weapon.alterStats(stats);
}

exports.parseStats = function(animal,lvl){
	let stats = {};
	let baseHp = 500+lvl*animal.hpr;
	stats.hp = [baseHp,baseHp,baseHp,0];
	let baseWp = 500+lvl*animal.wpr;
	stats.wp = [baseWp,baseWp,baseWp,0];
	let baseAtt = 100+lvl*animal.attr;
	stats.att = [baseAtt,0];
	let baseMag = 100+lvl*animal.magr;
	stats.mag = [baseMag,0];
	let basePr = 25+lvl*animal.prr;
	stats.pr = [basePr,0];
	let baseMr = 25+lvl*animal.mrr;
	stats.mr = [baseMr,0]
	return stats;
}

exports.toLvl = function(xp){
	let lvl = 1;
	while(xp>=getXp(lvl)){
		xp -= getXp(lvl);
		lvl++;
	}
	return {lvl,currentXp:xp,maxXp:getXp(lvl+1)}
}

function getXp(lvl){
	return lvl*lvl + 100;
}
