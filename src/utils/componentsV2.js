/*
 * Components V2 helpers.
 *
 * Eris does not ship builders for Components V2, so these helpers produce the raw
 * JSON payloads Discord expects. They mirror the discord.js builder names
 * (ContainerBuilder, SectionBuilder, TextDisplayBuilder, ...) to make porting easy.
 */

// MessageFlags.IsComponentsV2
const IS_COMPONENTS_V2 = 1 << 15;

const ComponentType = {
	ActionRow: 1,
	Button: 2,
	StringSelect: 3,
	Section: 9,
	TextDisplay: 10,
	Thumbnail: 11,
	MediaGallery: 12,
	File: 13,
	Separator: 14,
	Container: 17,
};

const ButtonStyle = {
	Primary: 1,
	Secondary: 2,
	Success: 3,
	Danger: 4,
	Link: 5,
};

function textDisplay(content) {
	return { type: ComponentType.TextDisplay, content };
}

function separator(divider = true, spacing = 1) {
	return { type: ComponentType.Separator, divider, spacing };
}

function button({ customId, label, style = ButtonStyle.Primary, emoji, disabled, url }) {
	const btn = { type: ComponentType.Button, style };
	if (url) btn.url = url;
	else btn.custom_id = customId;
	if (label) btn.label = label;
	if (emoji) btn.emoji = typeof emoji === 'string' ? { id: null, name: emoji } : emoji;
	if (disabled) btn.disabled = true;
	return btn;
}

function stringSelect({ customId, placeholder, options, minValues = 1, maxValues = 1, disabled }) {
	const select = {
		type: ComponentType.StringSelect,
		custom_id: customId,
		options,
		min_values: minValues,
		max_values: maxValues,
	};
	if (placeholder) select.placeholder = placeholder;
	if (disabled) select.disabled = true;
	return select;
}

function actionRow(...components) {
	return { type: ComponentType.ActionRow, components };
}

/**
 * A text block with a button (or thumbnail) next to it.
 * `texts` can be one string or an array of strings (max 3).
 */
function section(texts, accessory) {
	texts = Array.isArray(texts) ? texts : [texts];
	return {
		type: ComponentType.Section,
		components: texts.map(textDisplay),
		accessory,
	};
}

/**
 * Small image used as a section accessory.
 */
function thumbnail(url, description) {
	const result = { type: ComponentType.Thumbnail, media: { url } };
	if (description) result.description = description;
	return result;
}

/**
 * Gallery of images. Items can be urls (`attachment://file.png`) or `{ url, description }`.
 */
function mediaGallery(...items) {
	return {
		type: ComponentType.MediaGallery,
		items: items.map((item) => {
			const { url, description } = typeof item === 'string' ? { url: item } : item;
			const result = { media: { url } };
			if (description) result.description = description;
			return result;
		}),
	};
}

function container(components, { accentColor, spoiler } = {}) {
	const result = { type: ComponentType.Container, components };
	if (accentColor !== undefined) result.accent_color = accentColor;
	if (spoiler) result.spoiler = true;
	return result;
}

/**
 * Message payload ready for `p.send()`, `message.edit()` or an interaction `ack()`
 * Components V2 messages can not contain `content` or `embeds`.
 */
function v2Message(...components) {
	return { components, flags: IS_COMPONENTS_V2 };
}

module.exports = {
	IS_COMPONENTS_V2,
	ComponentType,
	ButtonStyle,
	textDisplay,
	separator,
	button,
	stringSelect,
	actionRow,
	section,
	thumbnail,
	mediaGallery,
	container,
	v2Message,
};
