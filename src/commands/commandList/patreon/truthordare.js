/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const truths = [
	'What is one thing you wish you could change about yourself?',
	'Who is your crush?',
	"What is the most food you've ever eaten in a single sitting?",
	"What is the craziest pickup line you've ever used?",
	'What animal do you think you most look like?',
	'How many selfies do you take a day?',
	'What is one thing you would stand in line for an hour for?',
	'When was the last time you cried?',
	"What's the longest time you've ever gone without showering?",
	'What was your favorite childhood show?',
	"What's your biggest fear?",
	'What person do you text the most?',
	'If you could only eat one thing for the rest of your life, what would you choose?',
	"What's your favorite part of your body?",
	'Who is your celebrity crush?',
	"What's the strangest dream you've ever had?",
	'What are the top three things you look for in a boyfriend/girlfriend?',
	'What is your worst habit?',
	'What is your biggest insecurity?',
	'What is the most embarrassing nickname you have ever had?',
	'What would be your last meal if you got the death penalty?',
	'Do you have more guy friends or girl *space* friends?',
	'Have you ever cheated in an exam?',
	'Who would you like to kiss in this chat?',
	'How many people have you kissed?',
	"What's one thing you only do when you're alone?",
	'If you had to cut one friend out of your life, who would it be?',
	'Do you have a favourite friend and who?',
	'If you could swap lives with someone in this chat, who would it be?',
	'What are your top three turn-ons?',
	'What is your biggest regret?',
	'What do most people think is true about you, but isn’t?',
	'What is the biggest thing you’ve gotten away with?',
	'What would you do if you were the opposite gender for a month?',
	'What is the most childish thing you still do?',
	'What are your real feelings about me (about the truther)? ',
	'What is your biggest secret?',
	'What is something that people think you would never be into, but you are?',
	'What was the worst encounter you had with a police officer, if you did?',
	'Why did you break up with your last boyfriend or girlfriend?',
];
const dares = [
	'Eat a packet of hot sauce straight.',
	'Do 20 squats.',
	'Gulp down a raw egg.',
	"Put five ice cubes in your mouth (you can't chew them, you just have to let them melt—brrr).",
	'Shot gun a diet coke.',
	'Empty a glass of cold water onto your head outside.',
	'Lick a bar of soap.',
	'Eat a teaspoon of mustard.',
	'Drink apple cider vinegar.',
	'Take a shot, if of age, else shot of darers choice.',
	'Jump into snow.',
	'Show the most embarrassing photo on your phone.',
	'Eat a raw piece of garlic.',
	'Show us your screen time report.',
	'Show us your pc search history.',
	'Show us your phone search history.',
	'Put 10 different available liquids into a cup and drink it.',
	'Tell everyone an embarrassing story about yourself.',
	'Lick your own foot.',
	'Post the oldest selfie on your phone on a social media story.',
	'Try and make yourself cry in front of us in video call.',
	'Tell the group two truths and a lie, and they have to guess which one the lie is.',
	'Cut off some piece of hair.',
	'Let darer post something on your social media.',
	'Lick the floor.',
	"For a guy, put on makeup. For a girl, wash off your make up (unless you don't wear make up, put some on).",
	'Write or draw something of groups choice somewhere on your body (that can be hidden with clothing) with a sharpie.',
	'Do pushups until you can’t do any more, wait 5 seconds, and then do one more.',
	'Let the group look through your phone for 2 minute (screen share).',
	'Eat one teaspoon of the spiciest thing you have in the kitchen.',
	'Drop something in the toilet and then reach in to get it.',
	'Describe what your crush looks like and their personality?',
	'Eat a raw potato.',
	'Choose a person in the group and say what annoys you about them.',
	'Lick the bottom of your shoe.',
	'Drink 3 big cups of water without stopping.',
	'Post the last youtube video you watched.',
	'Write darers name on some body part and send the picture.',
	"List all your ex's alphabetically",
	'Break two eggs on your forehead.',
];

module.exports = new CommandInterface({
	alias: ['truthordare', 'td'],

	args: ['[truth | dare] @user'],

	desc: 'Send someone a Truth or Dare!  Including an optional @mention for a direct truth/dare or no @mention.  Specifying either a truth or dare, or no type for either a truth or dare at random\n\nThis command was created by ?442112392868921365?!',

	example: ['owo truthordare truth @user'],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 10000,

	execute: async function (p) {
		const user = p.getMention(p.args[1]);

		if (p.args[0] == 'truth') {
			const truth = truths[Math.floor(Math.random() * truths.length)];
			if (user) {
				p.send(`A random truth for ${user.username}: **${truth}**`);
			} else {
				p.send(`Here is your random truth: **${truth}**`);
			}
		} else if (p.args[0] == 'dare') {
			const dare = dares[Math.floor(Math.random() * dares.length)];
			if (user) {
				p.send(`A random dare for ${user.username}: **${dare}**`);
			} else {
				p.send(`Here is your random dare: **${dare}**`);
			}
		} else {
			p.errorMsg(', you must specify either `truth` or `dare`!', 3000);
		}
	},
});
