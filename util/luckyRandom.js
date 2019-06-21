/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

/* Utility to provide random numbers modified by "luck" */

/* return a random number 0-1 skewed by a "luck" value */
exports.random = function(luck=0, cap=10000, skew=0.1){
  // luck may not exceed the cap
  var clamped = clamp(luck,-cap,cap);
  // how close to the cap is the player?
  var normalized = clamped/cap;

  // are we going to apply the luck? 
  luckyka = Math.random() < Math.abs(normalized);
  // pick a random number and grow o shrink it based on luck
  scale = luckyka ? 1.0 + normalized * skew : 1.0
  return clamp((Math.random() - 0.5) * scale + 0.5);
}

function clamp(n,min=0.0,max=1.0){
  return Math.max(Math.min(n,max),min);
}
