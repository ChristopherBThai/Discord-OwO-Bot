/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const axios = require('axios');

exports.open = function (p, ack, user, title, label, onSubmit) {
	const customId = `number_${user.id}_${Date.now()}`;
	p.interactionCollector.registerModal(customId, user.id, async (interaction) => {
		const value = interaction.data.components
			?.flatMap((row) => row.components || [])
			.find((component) => component.custom_id === 'amount')?.value;
		const callbackUrl = `https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`;
		const amount = Number(value);

		if (!/^\d+$/.test(value || '') || !Number.isSafeInteger(amount) || amount <= 0) {
			return axios.post(callbackUrl, {
				type: 4,
				data: { content: 'Please enter a positive whole number.', flags: 64 },
			});
		}

		await axios.post(callbackUrl, { type: 5, data: { flags: 64 } });
		try {
			await onSubmit(amount);
			await axios.patch(
				`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`,
				{ content: 'Form received. Check the channel for the command result.' }
			);
		} catch (err) {
			console.error('Number modal action failed.', err);
			await axios.patch(
				`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`,
				{ content: 'The request could not be completed. Please try again later.' }
			);
		}
	});

	return ack.showModal({
		custom_id: customId,
		title,
		components: [
			{
				type: 1,
				components: [
					{
						type: 4,
						custom_id: 'amount',
						label,
						style: 1,
						min_length: 1,
						max_length: 16,
						required: true,
					},
				],
			},
		],
	});
};
