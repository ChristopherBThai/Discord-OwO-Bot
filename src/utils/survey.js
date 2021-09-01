/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const surveyEmoji = '📝';
const surveyLogChannel = '882521311371485184';

exports.handle = async function (msg, ack) {
	const survey = await getSurvey.bind(this)(msg.author.id);
	if (!survey.length) return;

	const currentQuestion = survey.find(question => question.question_number === question.number)
	if (!currentQuestion) return;

	const embed = {
		title: currentQuestion.question,
		author: {
			name: `Question ${currentQuestion.sid}.${currentQuestion.number}`
		},
		description: msg.content.trim(),
		color: this.config.embed_color
	}
	await this.sender.msgChannel(surveyLogChannel, { embed });

	await nextQuestion.bind(this)(msg, survey);
}

async function getSurvey (userId) {
	const sql = `SELECT us.*, sq.*
			FROM user u
				INNER JOIN user_survey us ON u.uid = us.uid
				INNER JOIN survey_question sq ON sq.sid = us.sid
			WHERE u.id = ${userId}
				AND in_progress = 1;`;
	return await this.query(sql) || [];
}

async function nextQuestion (msg, survey) {
}
