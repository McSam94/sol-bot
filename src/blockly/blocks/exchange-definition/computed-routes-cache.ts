import Blockly, { BlockSvg } from 'blockly';

Blockly.Blocks.computed_routes_cache = {
	init() {
		this.jsonInit(this.definition());
	},
	definition() {
		return {
			message0: 'Routes cached time %1 seconds',
			args0: [
				{
					type: 'field_dropdown',
					name: 'ROUTES_CACHE_TIME',
					options: [0, 1, 5, 10].map(time => [`${time}`, `${time}`]),
				},
			],
			colour: '#4E6882',
			previousStatement: null,
			nextStatement: null,
		};
	},
};

Blockly.JavaScript.computed_routes_cache = (block: BlockSvg) => {
	const cacheTime = block.getFieldValue('ROUTES_CACHE_TIME');

	return `updateRoutesCache(${cacheTime});`;
};
