/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to provide random numbers modified by "luck" */

/* return a random number 0-1 skewed by a "luck" value */
exports.random = function(luck=0, luckCap=10000, luckSkew=0.1){
  var cappedLuck = Math.min(luck,luckCap);
  return Math.max(Math.min(Math.random() + (cappedLuck/luckCap) * luckSkew, 1), 0);
}
