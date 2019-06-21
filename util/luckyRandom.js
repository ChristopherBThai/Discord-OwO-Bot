/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to provide random numbers modified by "luck" */

config = require('../json/botConfig.json');

/* return a random number 0-1 skewed by a "luck" value */
exports.random = function(luck=0, cap=config.luck.cap, skew=config.luck.skew){
  // luck may not exceed the cap
  var clamped = clamp(luck,-cap,cap);
  // how close to the cap is the player?
  var normalized = clamped/cap;

  // pick a random number and grow o shrink it based on luck
  roll = Math.random();
  mod = (roll < 0.5 ? -1 : 1) * (roll - roll*roll) * skew * normalized
  return roll+mod;
}

function clamp(n,min=0.0,max=1.0){
  return Math.max(Math.min(n,max),min);
}
