/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to provide random numbers modified by "luck" */

/* return a random number 0-1 skewed by a "luck" value */
exports.random = function(luck=0, luckCap=10000, luckSkew=0.2){
  return Math.max(Math.min(Math.random() + (luck/luckCap) * luckSkew, 1), 0);
}

/* get the player's luck, expects params object per methods/command.js */
let getLuck = function(p){
    var sql = "SELECT lcount FROM luck WHERE id = "+p.msg.author.id+";";
    var resObj = {'luck': 0};
    p.con.query(sql,function(err,result){
      if(err) {console.error(err);return;}
      resObj.luck = result[1][0].lcount;
    });
    return resObj.luck;
}

/*
l = getLuck({'con': {'query': function(sql, cb){ console.log(sql,cb); cb(false,[0,[{'lcount': 10}]]);}},'msg':{'author':{'id':'123'}}});
console.log('luck: ',l);
*/
